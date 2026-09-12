package com.classai.app.domain.model

import com.squareup.moshi.Json

data class User(
    @Json(name = "userId")
    val id: String,
    @Json(name = "fullName")
    val name: String,
    val email: String,
    @Json(name = "rollNumber")
    val rollOrEmpId: String = "",
    val role: UserRole
)

data class Classroom(
    val classroomId: String,
    val className: String,
    val subjectName: String,
    val subjectCode: String,
    val semester: String,
    val division: String,
    val teacherId: String,
    val teacherName: String,
    val joinCode: String,
    val createdAt: String,
    val studentCount: Int = 0
)

data class UpcomingTopic(
    val topicId: String,
    val classroomId: String,
    val topic: String,
    val lectureDate: String,
    val description: String,
    val teacherId: String
)

data class Lecture(
    val lectureId: String,
    val classroomId: String,
    val title: String,
    val topic: String,
    val teacherId: String,
    val lectureDate: String,
    val status: LectureStatus,
    val summary: String,
    @Json(name = "cleanTranscript")
    val transcript: String = "",
    val keyPoints: List<String> = emptyList(),
    val transcriptAvailable: Boolean = false,
    val pdfAvailable: Boolean = false,
    val pdfUrl: String? = null,
    val createdAt: String,
    val publishedAt: String?,
    @Json(name = "attendanceStatus")
    val studentAttendance: AttendanceStatus? = null,
    val catchUpAvailable: Boolean = false
)

data class NotebookEntry(
    val lectureId: String,
    val date: String,
    val title: String,
    val topic: String,
    val attendance: AttendanceStatus,
    val hasPdf: Boolean = true,
    val hasSummary: Boolean = true,
    val hasCatchUp: Boolean = false
)

data class ResourceItem(
    val resourceId: String,
    val classroomId: String,
    val lectureId: String? = null,
    val title: String,
    val description: String,
    val resourceType: ResourceType,
    val fileUrl: String,
    val uploadedBy: String,
    val createdAt: String
)

data class AttendanceSession(
    val sessionId: String,
    val classroomId: String,
    val lectureId: String? = null,
    val date: String,
    val markedBy: String,
    val createdAt: String
)

data class AttendanceRecord(
    val recordId: String,
    val sessionId: String,
    val classroomId: String,
    val studentId: String,
    val studentName: String,
    val rollNumber: String,
    val status: AttendanceStatus
)

data class SubjectAttendance(
    val subjectName: String,
    val subjectCode: String,
    val presentCount: Int,
    val absentCount: Int,
    val percentage: Double,
    val isShortage: Boolean,
    val safeMisses: Int,
    val requiredConsecutive: Int
)

data class StudentAttendanceHistoryItem(
    val lectureTitle: String,
    val date: String,
    val status: AttendanceStatus
)

data class StudentAttendanceOverview(
    @Json(name = "attendancePercentage")
    val overallPercentage: Double,
    val presentCount: Int,
    val absentCount: Int,
    val totalLectures: Int,
    val requiredThreshold: Double = 75.0,
    val isShortage: Boolean = overallPercentage < 75.0,
    val safeMisses: Int,
    @Json(name = "requiredConsecutiveClasses")
    val requiredConsecutive: Int,
    val statusMessage: String = "",
    val subjects: List<SubjectAttendance> = emptyList(),
    val history: List<StudentAttendanceHistoryItem> = emptyList()
)

data class StudentAttendanceRecordSummary(
    val studentId: String,
    val studentName: String,
    val rollNumber: String,
    val presentCount: Int,
    val totalCount: Int,
    val percentage: Double,
    val isCritical: Boolean // < 60%
)

data class TeacherAttendanceAnalytics(
    val classroomId: String,
    val className: String,
    val classAverage: Double,
    @Json(name = "studentCount")
    val totalStudents: Int,
    val totalLecturesConducted: Int = 0,
    val below75Count: Int,
    val below60Count: Int,
    val students: List<StudentAttendanceRecordSummary>
)

data class Test(
    val testId: String,
    val classroomId: String,
    val lectureId: String? = null,
    val title: String,
    val description: String,
    val totalMarks: Int,
    val durationMinutes: Int? = null,
    val startAt: String,
    val deadlineAt: String,
    val status: TestStatus,
    val showScoreImmediately: Boolean = true,
    val shuffleQuestions: Boolean = false,
    val oneAttemptOnly: Boolean = true,
    val createdBy: String,
    val createdAt: String,
    val questionCount: Int = 0,
    val isAttempted: Boolean = false,
    val studentScore: Int? = null,
    val questions: List<Question> = emptyList()
)

data class Question(
    val questionId: String,
    val testId: String,
    val type: QuestionType,
    val questionText: String,
    val options: List<String> = emptyList(),
    val correctAnswers: List<String> = emptyList(),
    val marks: Int,
    val order: Int
)

data class TestAttempt(
    val attemptId: String,
    val testId: String,
    val studentId: String,
    val studentName: String = "",
    val status: AttemptStatus,
    val score: Int?,
    @Json(name = "maxScore")
    val totalMarks: Int,
    val percentage: Double? = null,
    val startedAt: String,
    val submittedAt: String?,
    val answers: Map<String, List<String>> = emptyMap(),
    val isDescriptivePending: Boolean = false
)

data class QuestionStat(
    val questionId: String,
    val order: Int,
    val questionText: String,
    val percentCorrect: Int,
    val needsAttention: Boolean
)

data class StudentTestResponseSummary(
    val studentId: String,
    val studentName: String,
    val score: Int?,
    val totalMarks: Int,
    val submissionTime: String,
    val status: AttemptStatus
)

data class TeacherTestAnalytics(
    val testId: String,
    val title: String = "",
    val totalStudents: Int,
    @Json(name = "submitted")
    val submittedCount: Int,
    @Json(name = "pending")
    val pendingCount: Int,
    val averageScore: Double,
    val highestScore: Int,
    val lowestScore: Int,
    @Json(name = "questionStats")
    val questionAnalysis: List<QuestionStat> = emptyList(),
    val responses: List<StudentTestResponseSummary> = emptyList()
)

data class QuizGenerationDraft(
    val lectureId: String,
    val lectureTitle: String,
    val numberOfQuestions: Int,
    val difficulty: String,
    val questions: List<Question>
)

data class NotificationItem(
    @Json(name = "notificationId")
    val id: String,
    val type: NotificationType,
    val title: String,
    @Json(name = "body")
    val message: String,
    @Json(name = "createdAt")
    val timestamp: String,
    val classroomId: String? = null,
    val relatedId: String? = null,
    val isRead: Boolean = false
)
