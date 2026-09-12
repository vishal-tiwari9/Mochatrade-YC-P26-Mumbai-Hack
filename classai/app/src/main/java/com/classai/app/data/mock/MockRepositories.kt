package com.classai.app.data.mock

import com.classai.app.domain.model.*
import com.classai.app.domain.repository.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import java.util.UUID

class MockAuthRepository : AuthRepository {
    private val _currentUser = MutableStateFlow<User?>(MockDataProvider.studentUser)

    override fun getCurrentUser(): Flow<User?> = _currentUser.asStateFlow()

    override suspend fun login(email: String, password: String): Result<User> {
        delay(400)
        if (password.length < 6) {
            return Result.failure(IllegalArgumentException("Password must be at least 6 characters."))
        }
        val user = if (email.contains("sharma", ignoreCase = true) || email.contains("teacher", ignoreCase = true)) {
            MockDataProvider.teacherUser
        } else {
            MockDataProvider.studentUser.copy(email = email)
        }
        _currentUser.value = user
        MockDataProvider.currentUser = user
        return Result.success(user)
    }

    override suspend fun register(
        name: String,
        email: String,
        password: String,
        rollOrEmpId: String,
        role: UserRole
    ): Result<User> {
        delay(400)
        val user = User(
            id = "user_${UUID.randomUUID().toString().take(6)}",
            name = name,
            email = email,
            rollOrEmpId = rollOrEmpId,
            role = role
        )
        _currentUser.value = user
        MockDataProvider.currentUser = user
        return Result.success(user)
    }

    override suspend fun forgotPassword(email: String): Result<Unit> {
        delay(300)
        return Result.success(Unit)
    }

    override suspend fun sendEmailVerification(): Result<Unit> {
        delay(300)
        return Result.success(Unit)
    }

    override suspend fun logout(): Result<Unit> {
        delay(200)
        _currentUser.value = null
        return Result.success(Unit)
    }

    override fun switchUserRole(role: UserRole) {
        val user = if (role == UserRole.TEACHER) {
            MockDataProvider.teacherUser
        } else {
            MockDataProvider.studentUser
        }
        _currentUser.value = user
        MockDataProvider.currentUser = user
    }
}

class MockClassroomRepository : ClassroomRepository {
    private val _classrooms = MutableStateFlow(MockDataProvider.classrooms)
    private val _upcomingTopic = MutableStateFlow<UpcomingTopic?>(MockDataProvider.upcomingTopic)

    override fun getClassrooms(): Flow<List<Classroom>> = _classrooms.asStateFlow()

    override fun getClassroomById(classroomId: String): Flow<Classroom?> =
        _classrooms.map { list -> list.find { it.classroomId == classroomId } }

    override suspend fun createClassroom(
        className: String,
        subjectName: String,
        subjectCode: String,
        semester: String,
        division: String
    ): Result<Classroom> {
        delay(400)
        val randomChars = (('A'..'Z') + ('0'..'9')).shuffled().take(6).joinToString("")
        val newClass = Classroom(
            classroomId = "class_${UUID.randomUUID().toString().take(6)}",
            className = className,
            subjectName = subjectName,
            subjectCode = subjectCode,
            semester = semester,
            division = division,
            teacherId = MockDataProvider.teacherUser.id,
            teacherName = MockDataProvider.teacherUser.name,
            joinCode = randomChars,
            createdAt = "Today",
            studentCount = 0
        )
        val updated = _classrooms.value.toMutableList().apply { add(0, newClass) }
        _classrooms.value = updated
        return Result.success(newClass)
    }

    override suspend fun joinClassroom(joinCode: String): Result<Classroom> {
        delay(400)
        val found = _classrooms.value.find { it.joinCode.equals(joinCode.trim(), ignoreCase = true) }
        return if (found != null) {
            Result.success(found)
        } else {
            // If code not found among existing, create mock joined class
            val joined = Classroom(
                classroomId = "class_joined_${joinCode.trim().lowercase()}",
                className = "Joined Classroom ($joinCode)",
                subjectName = "Advanced Studies",
                subjectCode = "ADV${joinCode.take(3).uppercase()}",
                semester = "6",
                division = "A",
                teacherId = "teacher_ext",
                teacherName = "Prof. Andrews",
                joinCode = joinCode.trim().uppercase(),
                createdAt = "Today",
                studentCount = 35
            )
            val updated = _classrooms.value.toMutableList().apply { add(joined) }
            _classrooms.value = updated
            Result.success(joined)
        }
    }

    override fun getClassroomMembers(classroomId: String): Flow<List<User>> =
        MutableStateFlow(
            listOf(
                MockDataProvider.teacherUser,
                MockDataProvider.studentUser,
                User("s2", "Aarav Gupta", "aarav@uni.edu", "CS-2021-001", UserRole.STUDENT),
                User("s3", "Ananya Singh", "ananya@uni.edu", "CS-2021-005", UserRole.STUDENT),
                User("s4", "Priya Mehta", "priya@uni.edu", "CS-2021-018", UserRole.STUDENT),
                User("s5", "Rahul Verma", "rahul@uni.edu", "CS-2021-023", UserRole.STUDENT),
                User("s6", "Sneha Iyer", "sneha@uni.edu", "CS-2021-035", UserRole.STUDENT)
            )
        )

    override fun getUpcomingTopic(classroomId: String): Flow<UpcomingTopic?> = _upcomingTopic.asStateFlow()

    override suspend fun setUpcomingTopic(
        classroomId: String,
        topic: String,
        date: String,
        description: String
    ): Result<UpcomingTopic> {
        delay(300)
        val newTopic = UpcomingTopic(
            topicId = "topic_${UUID.randomUUID().toString().take(6)}",
            classroomId = classroomId,
            topic = topic,
            lectureDate = date,
            description = description,
            teacherId = MockDataProvider.teacherUser.id
        )
        _upcomingTopic.value = newTopic
        MockDataProvider.upcomingTopic = newTopic
        return Result.success(newTopic)
    }
}

class MockLectureRepository : LectureRepository {
    private val _lectures = MutableStateFlow(MockDataProvider.lectures)
    private val _notebook = MutableStateFlow(MockDataProvider.notebookEntries)

    override fun getLectures(classroomId: String): Flow<List<Lecture>> = _lectures.asStateFlow()

    override fun getLectureById(lectureId: String): Flow<Lecture?> =
        _lectures.map { list -> list.find { it.lectureId == lectureId } }

    override fun getNotebookEntries(classroomId: String): Flow<List<NotebookEntry>> = _notebook.asStateFlow()

    override suspend fun generateAiQuiz(
        lectureId: String,
        numQuestions: Int,
        difficulty: String,
        types: List<QuestionType>
    ): Result<QuizGenerationDraft> {
        delay(1200) // Simulate AI processing
        val lecture = _lectures.value.find { it.lectureId == lectureId } ?: MockDataProvider.lectures.first()
        val generatedQuestions = listOf(
            Question(
                questionId = "ai_q1",
                testId = "ai_draft_${lecture.lectureId}",
                type = QuestionType.MCQ,
                questionText = "According to the ${lecture.topic} lecture, what is the principal role of the Banker's Algorithm?",
                options = listOf("Deadlock detection", "Deadlock avoidance by checking safe states", "Deadlock recovery by process termination", "Priority inversion prevention"),
                correctAnswers = listOf("Deadlock avoidance by checking safe states"),
                marks = 2,
                order = 1
            ),
            Question(
                questionId = "ai_q2",
                testId = "ai_draft_${lecture.lectureId}",
                type = QuestionType.TRUE_FALSE,
                questionText = "Can an unsafe state in resource allocation lead to a deadlock condition?",
                options = listOf("True", "False"),
                correctAnswers = listOf("True"),
                marks = 2,
                order = 2
            ),
            Question(
                questionId = "ai_q3",
                testId = "ai_draft_${lecture.lectureId}",
                type = QuestionType.MCQ,
                questionText = "Which condition implies that a process holds resources while simultaneously requesting additional held resources?",
                options = listOf("Mutual exclusion", "Hold and Wait", "Circular wait", "Starvation"),
                correctAnswers = listOf("Hold and Wait"),
                marks = 2,
                order = 3
            )
        )
        return Result.success(
            QuizGenerationDraft(
                lectureId = lecture.lectureId,
                lectureTitle = lecture.title,
                numberOfQuestions = numQuestions,
                difficulty = difficulty,
                questions = generatedQuestions.take(numQuestions.coerceAtLeast(1))
            )
        )
    }
}

class MockAttendanceRepository : AttendanceRepository {
    private val _sessions = MutableStateFlow(
        listOf(
            AttendanceSession("sess_01", "class_os_01", "lec_03", "14 Sep", "Prof. Sharma", "2026-09-14"),
            AttendanceSession("sess_02", "class_os_01", "lec_02", "11 Sep", "Prof. Sharma", "2026-09-11"),
            AttendanceSession("sess_03", "class_os_01", "lec_01", "08 Sep", "Prof. Sharma", "2026-09-08")
        )
    )

    private val _students = MutableStateFlow<List<AttendanceRecord>>(MockDataProvider.classroomStudents)

    override fun getStudentAttendanceOverview(studentId: String): Flow<StudentAttendanceOverview> =
        MutableStateFlow(MockDataProvider.getStudentAttendanceOverview())

    override fun getClassroomAttendanceSessions(classroomId: String): Flow<List<AttendanceSession>> =
        _sessions.asStateFlow()

    override fun getClassroomStudentsForAttendance(classroomId: String): Flow<List<AttendanceRecord>> =
        _students.asStateFlow()

    override suspend fun submitAttendance(
        sessionId: String,
        classroomId: String,
        records: List<AttendanceRecord>
    ): Result<Unit> {
        delay(500)
        _students.value = records
        val newSession = AttendanceSession(
            sessionId = sessionId,
            classroomId = classroomId,
            lectureId = null,
            date = "Today",
            markedBy = "Prof. Sharma",
            createdAt = "Just now"
        )
        _sessions.value = listOf(newSession) + _sessions.value
        return Result.success(Unit)
    }

    override fun getTeacherAttendanceAnalytics(classroomId: String): Flow<TeacherAttendanceAnalytics> =
        MutableStateFlow(MockDataProvider.getTeacherAttendanceAnalytics())
}

class MockTestRepository : TestRepository {
    private val _tests = MutableStateFlow<List<Test>>(MockDataProvider.tests)
    private val _questions = MutableStateFlow(MockDataProvider.questionsMap)

    override fun getClassroomTests(classroomId: String): Flow<List<Test>> = _tests.asStateFlow()

    override fun getAllPendingTests(): Flow<List<Test>> =
        _tests.map { list -> list.filter { it.status == TestStatus.PUBLISHED && !it.isAttempted } }

    override fun getTestById(testId: String): Flow<Test?> =
        _tests.map { list -> list.find { it.testId == testId } }

    override fun getQuestionsForTest(testId: String): Flow<List<Question>> =
        _questions.map { map -> map[testId] ?: emptyList() }

    override suspend fun createTest(test: Test, questions: List<Question>): Result<Test> {
        delay(400)
        val updated = _tests.value.toMutableList().apply { add(0, test) }
        _tests.value = updated
        val updatedQuestions = _questions.value.toMutableMap().apply { put(test.testId, questions) }
        _questions.value = updatedQuestions
        return Result.success(test)
    }

    override suspend fun publishTest(testId: String): Result<Unit> {
        delay(300)
        val updated = _tests.value.map {
            if (it.testId == testId) it.copy(status = TestStatus.PUBLISHED) else it
        }
        _tests.value = updated
        return Result.success(Unit)
    }

    override suspend fun closeTest(testId: String): Result<Unit> {
        delay(300)
        val updated = _tests.value.map {
            if (it.testId == testId) it.copy(status = TestStatus.CLOSED) else it
        }
        _tests.value = updated
        return Result.success(Unit)
    }

    override suspend fun submitTestAttempt(
        testId: String,
        answers: Map<String, List<String>>
    ): Result<TestAttempt> {
        delay(600)
        val test = _tests.value.find { it.testId == testId } ?: MockDataProvider.tests.first()
        val questions = _questions.value[testId] ?: emptyList()

        var calculatedScore = 0
        var hasDescriptive = false

        for (q in questions) {
            val given = answers[q.questionId] ?: emptyList()
            when (q.type) {
                QuestionType.MCQ, QuestionType.TRUE_FALSE -> {
                    if (given.isNotEmpty() && q.correctAnswers.contains(given.first())) {
                        calculatedScore += q.marks
                    }
                }
                QuestionType.MULTI_SELECT -> {
                    if (given.toSet() == q.correctAnswers.toSet()) {
                        calculatedScore += q.marks
                    }
                }
                QuestionType.SHORT_ANSWER, QuestionType.LONG_ANSWER -> {
                    hasDescriptive = true
                }
            }
        }

        // If score is immediate and only objective questions:
        val score = if (hasDescriptive) calculatedScore else calculatedScore
        val percentage = if (test.totalMarks > 0) (score.toDouble() / test.totalMarks.toDouble()) * 100.0 else 0.0

        val attempt = TestAttempt(
            attemptId = "att_${UUID.randomUUID().toString().take(6)}",
            testId = testId,
            studentId = MockDataProvider.studentUser.id,
            studentName = MockDataProvider.studentUser.name,
            status = if (hasDescriptive) AttemptStatus.SUBMITTED else AttemptStatus.GRADED,
            score = score,
            totalMarks = test.totalMarks,
            percentage = percentage,
            startedAt = "Today",
            submittedAt = "Just now",
            answers = answers,
            isDescriptivePending = hasDescriptive
        )

        // Mark test as attempted in user's test list
        _tests.value = _tests.value.map {
            if (it.testId == testId) it.copy(isAttempted = true, studentScore = score) else it
        }

        return Result.success(attempt)
    }

    override fun getTestAnalytics(testId: String): Flow<TeacherTestAnalytics> =
        MutableStateFlow(MockDataProvider.getTeacherTestAnalytics(testId))
}

class MockResourceRepository : ResourceRepository {
    private val _resources = MutableStateFlow(MockDataProvider.resources)

    override fun getResources(classroomId: String): Flow<List<ResourceItem>> = _resources.asStateFlow()

    override suspend fun uploadResource(item: ResourceItem): Result<ResourceItem> {
        delay(400)
        val updated = _resources.value.toMutableList().apply { add(0, item) }
        _resources.value = updated
        return Result.success(item)
    }
}

class MockNotificationRepository : NotificationRepository {
    private val _notifications = MutableStateFlow<List<NotificationItem>>(MockDataProvider.notifications)

    override fun getNotifications(): Flow<List<NotificationItem>> = _notifications.asStateFlow()

    override suspend fun markAsRead(notificationId: String): Result<Unit> {
        val updated = _notifications.value.map {
            if (it.id == notificationId) it.copy(isRead = true) else it
        }
        _notifications.value = updated
        return Result.success(Unit)
    }
}
