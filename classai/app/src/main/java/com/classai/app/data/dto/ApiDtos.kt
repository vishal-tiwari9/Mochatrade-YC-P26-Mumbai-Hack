package com.classai.app.data.dto

import com.classai.app.domain.model.*

data class UserDto(
    @com.squareup.moshi.Json(name = "userId") val id: String,
    @com.squareup.moshi.Json(name = "fullName") val name: String,
    val email: String,
    @com.squareup.moshi.Json(name = "rollNumber") val rollOrEmpId: String? = null,
    val role: UserRole
)

data class CreateClassroomRequest(
    val className: String,
    val subjectName: String,
    val subjectCode: String,
    val semester: String,
    val division: String
)

data class JoinClassroomRequest(
    val joinCode: String
)

data class CreateUpcomingTopicRequest(
    val topic: String,
    val lectureDate: String,
    val description: String
)

data class AttendanceSessionDto(
    val sessionId: String,
    val classroomId: String,
    val lectureId: String?,
    val date: String,
    val markedBy: String,
    val createdAt: String
)

data class SubmitAttendanceRequest(
    val classroomId: String,
    val lectureId: String? = null,
    val date: String,
    val records: List<AttendanceRecordDto>
)

data class AttendanceRecordDto(
    val studentId: String,
    val status: AttendanceStatus
)

data class ResourceCreateRequest(
    val classroomId: String,
    val title: String,
    val description: String,
    val resourceType: ResourceType,
    val fileUrl: String,
    val lectureId: String? = null
)

data class CreateTestRequest(
    val classroomId: String,
    val lectureId: String?,
    val title: String,
    val description: String,
    val totalMarks: Int,
    val durationMinutes: Int?,
    val startAt: String,
    val deadlineAt: String,
    val showScoreImmediately: Boolean,
    val shuffleQuestions: Boolean,
    val oneAttemptOnly: Boolean,
    val questions: List<QuestionDto>
)

data class QuestionDto(
    val type: QuestionType,
    val questionText: String,
    val options: List<String>,
    val correctAnswers: List<String>,
    val marks: Int,
    val order: Int
)

data class SubmitTestAttemptRequest(
    val answers: Map<String, List<String>>
)

data class GenerateQuizRequest(
    val questionCount: Int,
    val difficulty: String,
    val types: List<QuestionType>
)

data class TestStatusRequest(val status: TestStatus)

data class GeneratedQuizResponse(val questions: List<Question>)

data class FcmTokenRequest(val token: String)
