package com.classai.app.domain.repository

import com.classai.app.domain.model.*
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    fun getCurrentUser(): Flow<User?>
    suspend fun login(email: String, password: String): Result<User>
    suspend fun register(
        name: String,
        email: String,
        password: String,
        rollOrEmpId: String,
        role: UserRole
    ): Result<User>
    suspend fun forgotPassword(email: String): Result<Unit>
    suspend fun sendEmailVerification(): Result<Unit>
    suspend fun logout(): Result<Unit>
    fun switchUserRole(role: UserRole)
}

interface ClassroomRepository {
    fun getClassrooms(): Flow<List<Classroom>>
    fun getClassroomById(classroomId: String): Flow<Classroom?>
    suspend fun createClassroom(
        className: String,
        subjectName: String,
        subjectCode: String,
        semester: String,
        division: String
    ): Result<Classroom>
    suspend fun joinClassroom(joinCode: String): Result<Classroom>
    fun getClassroomMembers(classroomId: String): Flow<List<User>>
    fun getUpcomingTopic(classroomId: String): Flow<UpcomingTopic?>
    suspend fun setUpcomingTopic(
        classroomId: String,
        topic: String,
        date: String,
        description: String
    ): Result<UpcomingTopic>
}

interface LectureRepository {
    fun getLectures(classroomId: String): Flow<List<Lecture>>
    fun getLectureById(lectureId: String): Flow<Lecture?>
    fun getNotebookEntries(classroomId: String): Flow<List<NotebookEntry>>
    suspend fun generateAiQuiz(
        lectureId: String,
        numQuestions: Int,
        difficulty: String,
        types: List<QuestionType>
    ): Result<QuizGenerationDraft>
}

interface AttendanceRepository {
    fun getStudentAttendanceOverview(studentId: String): Flow<StudentAttendanceOverview>
    fun getClassroomAttendanceSessions(classroomId: String): Flow<List<AttendanceSession>>
    fun getClassroomStudentsForAttendance(classroomId: String): Flow<List<AttendanceRecord>>
    suspend fun submitAttendance(
        sessionId: String,
        classroomId: String,
        records: List<AttendanceRecord>
    ): Result<Unit>
    fun getTeacherAttendanceAnalytics(classroomId: String): Flow<TeacherAttendanceAnalytics>
}

interface TestRepository {
    fun getClassroomTests(classroomId: String): Flow<List<Test>>
    fun getAllPendingTests(): Flow<List<Test>>
    fun getTestById(testId: String): Flow<Test?>
    fun getQuestionsForTest(testId: String): Flow<List<Question>>
    suspend fun createTest(test: Test, questions: List<Question>): Result<Test>
    suspend fun publishTest(testId: String): Result<Unit>
    suspend fun closeTest(testId: String): Result<Unit>
    suspend fun submitTestAttempt(testId: String, answers: Map<String, List<String>>): Result<TestAttempt>
    fun getTestAnalytics(testId: String): Flow<TeacherTestAnalytics>
}

interface ResourceRepository {
    fun getResources(classroomId: String): Flow<List<ResourceItem>>
    suspend fun uploadResource(item: ResourceItem): Result<ResourceItem>
}

interface NotificationRepository {
    fun getNotifications(): Flow<List<NotificationItem>>
    suspend fun markAsRead(notificationId: String): Result<Unit>
}
