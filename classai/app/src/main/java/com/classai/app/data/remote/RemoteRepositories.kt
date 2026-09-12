package com.classai.app.data.remote

import com.classai.app.core.network.ApiResponse
import com.classai.app.data.dto.*
import com.classai.app.domain.model.*
import com.classai.app.domain.repository.*
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.time.LocalDate

private class ApiException(message: String) : IllegalStateException(message)

private fun <T> ApiResponse<T>.requireData(): T {
    if (!success || data == null) throw ApiException(message ?: "The server could not complete this request.")
    return data
}

private fun <T> ApiResponse<T>.nullableData(): T? {
    if (!success) throw ApiException(message ?: "The server could not complete this request.")
    return data
}

private fun <T> apiFlow(block: suspend () -> T): Flow<T> = flow { emit(block()) }.flowOn(Dispatchers.IO)

/**
 * Firebase owns sign-in and ID-token refresh. ClassAI's API remains the source
 * of truth for roles, classrooms and academic data.
 */
class FirebaseAuthRepository(private val api: ClassAiApiService) : AuthRepository {
    private val auth = runCatching { FirebaseAuth.getInstance() }.getOrNull()
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val currentUser = MutableStateFlow<User?>(null)

    init {
        auth?.addAuthStateListener { firebaseUser ->
            if (firebaseUser.currentUser == null) currentUser.value = null
            else scope.launch { refreshProfile() }
        }
    }

    override fun getCurrentUser(): Flow<User?> = currentUser.asStateFlow()

    suspend fun getIdToken(): String? = auth?.currentUser?.getIdToken(false)?.await()?.token

    private suspend fun refreshProfile(): User? = runCatching {
        api.getMe().requireData().also { currentUser.value = it }
    }.getOrElse {
        currentUser.value = null
        null
    }

    private suspend fun registerCurrentDevice() {
        val token = runCatching { FirebaseMessaging.getInstance().token.await() }.getOrNull() ?: return
        runCatching { api.registerFcmToken(FcmTokenRequest(token)).requireData() }
    }

    override suspend fun login(email: String, password: String): Result<User> = runCatching {
        val firebase = auth ?: throw ApiException("Firebase is not configured. Add google-services.json before signing in.")
        firebase.signInWithEmailAndPassword(email.trim(), password).await()
        val profile = refreshProfile()
            ?: throw ApiException("Your account is not provisioned in ClassAI. Ask your teacher or administrator to add you.")
        if (profile.role != UserRole.STUDENT) {
            firebase.signOut()
            currentUser.value = null
            throw ApiException("This mobile app is for students only. Teachers should use the ClassAI Teacher Studio.")
        }
        profile.also { registerCurrentDevice() }
    }

    override suspend fun register(name: String, email: String, password: String, rollOrEmpId: String, role: UserRole): Result<User> =
        Result.failure(ApiException("Accounts are provisioned by the institution. Ask a teacher to add your student account, then sign in."))

    override suspend fun forgotPassword(email: String): Result<Unit> = runCatching {
        val firebase = auth ?: throw ApiException("Firebase is not configured.")
        firebase.sendPasswordResetEmail(email.trim()).await()
    }

    override suspend fun sendEmailVerification(): Result<Unit> = runCatching {
        val user = auth?.currentUser ?: throw ApiException("Sign in first.")
        user.sendEmailVerification().await()
    }

    override suspend fun logout(): Result<Unit> = runCatching {
        auth?.signOut()
        currentUser.value = null
    }

    /** Roles are server-owned. This prevents a client-side teacher escalation. */
    override fun switchUserRole(role: UserRole) = Unit
}

suspend fun syncFcmToken(api: ClassAiApiService, token: String) {
    if (token.isBlank()) return
    runCatching { api.registerFcmToken(FcmTokenRequest(token)).requireData() }
}

class RemoteClassroomRepository(private val api: ClassAiApiService) : ClassroomRepository {
    override fun getClassrooms(): Flow<List<Classroom>> = apiFlow { api.getClassrooms().requireData() }
    override fun getClassroomById(classroomId: String): Flow<Classroom?> = apiFlow { api.getClassroomById(classroomId).requireData() }
    override suspend fun createClassroom(className: String, subjectName: String, subjectCode: String, semester: String, division: String): Result<Classroom> = runCatching {
        api.createClassroom(CreateClassroomRequest(className, subjectName, subjectCode, semester, division)).requireData()
    }
    override suspend fun joinClassroom(joinCode: String): Result<Classroom> = runCatching { api.joinClassroom(JoinClassroomRequest(joinCode.trim())).requireData() }
    override fun getClassroomMembers(classroomId: String): Flow<List<User>> = apiFlow { api.getClassroomMembers(classroomId).requireData() }
    override fun getUpcomingTopic(classroomId: String): Flow<UpcomingTopic?> = apiFlow { api.getUpcomingTopic(classroomId).nullableData() }
    override suspend fun setUpcomingTopic(classroomId: String, topic: String, date: String, description: String): Result<UpcomingTopic> = runCatching {
        api.setUpcomingTopic(classroomId, CreateUpcomingTopicRequest(topic, date, description)).requireData()
    }
}

class RemoteLectureRepository(private val api: ClassAiApiService) : LectureRepository {
    override fun getLectures(classroomId: String): Flow<List<Lecture>> = apiFlow { api.getLectures(classroomId).requireData() }
    override fun getLectureById(lectureId: String): Flow<Lecture?> = apiFlow { api.getLectureById(lectureId).requireData() }
    override fun getNotebookEntries(classroomId: String): Flow<List<NotebookEntry>> = apiFlow {
        api.getLectures(classroomId).requireData().map { lecture ->
            NotebookEntry(
                lectureId = lecture.lectureId,
                date = lecture.lectureDate,
                title = lecture.title,
                topic = lecture.topic,
                attendance = lecture.studentAttendance ?: AttendanceStatus.PRESENT,
                hasPdf = !lecture.pdfUrl.isNullOrBlank(),
                hasSummary = lecture.summary.isNotBlank(),
                hasCatchUp = lecture.catchUpAvailable
            )
        }
    }
    override suspend fun generateAiQuiz(lectureId: String, numQuestions: Int, difficulty: String, types: List<QuestionType>): Result<QuizGenerationDraft> = runCatching {
        val response = api.generateQuizFromLecture(lectureId, GenerateQuizRequest(numQuestions, difficulty, types)).requireData()
        QuizGenerationDraft(lectureId, "Lecture quiz draft", response.questions.size, difficulty, response.questions)
    }
}

class RemoteAttendanceRepository(private val api: ClassAiApiService) : AttendanceRepository {
    override fun getStudentAttendanceOverview(studentId: String): Flow<StudentAttendanceOverview> = apiFlow { api.getMyAttendance().requireData() }
    override fun getClassroomAttendanceSessions(classroomId: String): Flow<List<AttendanceSession>> = apiFlow {
        api.getClassroomAttendance(classroomId).requireData().map { AttendanceSession(it.sessionId, it.classroomId, it.lectureId, it.date, it.markedBy, it.createdAt) }
    }
    override fun getClassroomStudentsForAttendance(classroomId: String): Flow<List<AttendanceRecord>> = apiFlow {
        api.getClassroomMembers(classroomId).requireData().filter { it.role == UserRole.STUDENT }.map {
            AttendanceRecord("", "", classroomId, it.id, it.name, it.rollOrEmpId, AttendanceStatus.PRESENT)
        }
    }
    override suspend fun submitAttendance(sessionId: String, classroomId: String, records: List<AttendanceRecord>): Result<Unit> = runCatching {
        api.submitAttendanceSession(SubmitAttendanceRequest(classroomId, null, LocalDate.now().toString(), records.map { AttendanceRecordDto(it.studentId, it.status) })).requireData()
        Unit
    }
    override fun getTeacherAttendanceAnalytics(classroomId: String): Flow<TeacherAttendanceAnalytics> = apiFlow { api.getTeacherAttendanceAnalytics(classroomId).requireData() }
}

class RemoteTestRepository(private val api: ClassAiApiService) : TestRepository {
    override fun getClassroomTests(classroomId: String): Flow<List<Test>> = apiFlow { api.getClassroomTests(classroomId).requireData() }
    override fun getAllPendingTests(): Flow<List<Test>> = apiFlow {
        api.getClassrooms().requireData().flatMap { classroom -> api.getClassroomTests(classroom.classroomId).requireData() }
            .filter { it.status == TestStatus.PUBLISHED && !it.isAttempted }
    }
    override fun getTestById(testId: String): Flow<Test?> = apiFlow { api.getTestById(testId).requireData() }
    override fun getQuestionsForTest(testId: String): Flow<List<Question>> = apiFlow { api.getTestById(testId).requireData().questions }
    override suspend fun createTest(test: Test, questions: List<Question>): Result<Test> = runCatching {
        val request = CreateTestRequest(test.classroomId, test.lectureId, test.title, test.description, test.totalMarks, test.durationMinutes, test.startAt, test.deadlineAt, test.showScoreImmediately, test.shuffleQuestions, test.oneAttemptOnly, questions.map {
            QuestionDto(it.type, it.questionText, it.options, it.correctAnswers, it.marks, it.order)
        })
        api.createTest(request).requireData()
    }
    override suspend fun publishTest(testId: String): Result<Unit> = runCatching { api.updateTestStatus(testId, TestStatusRequest(TestStatus.PUBLISHED)).requireData(); Unit }
    override suspend fun closeTest(testId: String): Result<Unit> = runCatching { api.updateTestStatus(testId, TestStatusRequest(TestStatus.CLOSED)).requireData(); Unit }
    override suspend fun submitTestAttempt(testId: String, answers: Map<String, List<String>>): Result<TestAttempt> = runCatching {
        api.startTestAttempt(testId).requireData()
        api.submitTestAttempt(testId, SubmitTestAttemptRequest(answers)).requireData()
    }
    override fun getTestAnalytics(testId: String): Flow<TeacherTestAnalytics> = apiFlow { api.getTestAnalytics(testId).requireData() }
}

class RemoteResourceRepository(private val api: ClassAiApiService) : ResourceRepository {
    override fun getResources(classroomId: String): Flow<List<ResourceItem>> = apiFlow { api.getResources(classroomId).requireData() }
    override suspend fun uploadResource(item: ResourceItem): Result<ResourceItem> = runCatching {
        api.createResource(ResourceCreateRequest(item.classroomId, item.title, item.description, item.resourceType, item.fileUrl, item.lectureId)).requireData()
    }
}

class RemoteNotificationRepository(private val api: ClassAiApiService) : NotificationRepository {
    override fun getNotifications(): Flow<List<NotificationItem>> = apiFlow { api.getNotifications().requireData() }
    override suspend fun markAsRead(notificationId: String): Result<Unit> = runCatching { api.markNotificationRead(notificationId).requireData(); Unit }
}
