package com.classai.app.data.remote

import com.classai.app.core.network.ApiResponse
import com.classai.app.data.dto.*
import com.classai.app.domain.model.*
import retrofit2.http.*

/**
 * Retrofit interface representing the future FastAPI REST backend.
 * Base URL is configured in network modules.
 * Authorization header is supplied by AuthInterceptor:
 * "Authorization: Bearer <firebase_id_token>"
 */
interface ClassAiApiService {

    @GET("api/me")
    suspend fun getMe(): ApiResponse<User>

    @PUT("api/devices/fcm-token")
    suspend fun registerFcmToken(@Body request: FcmTokenRequest): ApiResponse<Map<String, Boolean>>

    @GET("api/classrooms")
    suspend fun getClassrooms(): ApiResponse<List<Classroom>>

    @POST("api/classrooms")
    suspend fun createClassroom(@Body request: CreateClassroomRequest): ApiResponse<Classroom>

    @POST("api/classrooms/join")
    suspend fun joinClassroom(@Body request: JoinClassroomRequest): ApiResponse<Classroom>

    @GET("api/classrooms/{classroomId}")
    suspend fun getClassroomById(@Path("classroomId") classroomId: String): ApiResponse<Classroom>

    @GET("api/classrooms/{classroomId}/members")
    suspend fun getClassroomMembers(@Path("classroomId") classroomId: String): ApiResponse<List<User>>

    @GET("api/classrooms/{classroomId}/upcoming-topic")
    suspend fun getUpcomingTopic(@Path("classroomId") classroomId: String): ApiResponse<UpcomingTopic>

    @POST("api/classrooms/{classroomId}/upcoming-topic")
    suspend fun setUpcomingTopic(
        @Path("classroomId") classroomId: String,
        @Body request: CreateUpcomingTopicRequest
    ): ApiResponse<UpcomingTopic>

    @GET("api/classrooms/{classroomId}/lectures")
    suspend fun getLectures(@Path("classroomId") classroomId: String): ApiResponse<List<Lecture>>

    @GET("api/lectures/{lectureId}")
    suspend fun getLectureById(@Path("lectureId") lectureId: String): ApiResponse<Lecture>

    @GET("api/classrooms/{classroomId}/resources")
    suspend fun getResources(@Path("classroomId") classroomId: String): ApiResponse<List<ResourceItem>>

    @POST("api/resources")
    suspend fun createResource(@Body request: ResourceCreateRequest): ApiResponse<ResourceItem>

    @GET("api/classrooms/{classroomId}/attendance")
    suspend fun getClassroomAttendance(@Path("classroomId") classroomId: String): ApiResponse<List<AttendanceSessionDto>>

    @GET("api/classrooms/{classroomId}/attendance/analytics")
    suspend fun getTeacherAttendanceAnalytics(@Path("classroomId") classroomId: String): ApiResponse<TeacherAttendanceAnalytics>

    @POST("api/attendance/sessions")
    suspend fun submitAttendanceSession(@Body request: SubmitAttendanceRequest): ApiResponse<AttendanceSessionDto>

    @GET("api/students/me/attendance")
    suspend fun getMyAttendance(): ApiResponse<StudentAttendanceOverview>

    @GET("api/classrooms/{classroomId}/tests")
    suspend fun getClassroomTests(@Path("classroomId") classroomId: String): ApiResponse<List<Test>>

    @POST("api/tests")
    suspend fun createTest(@Body request: CreateTestRequest): ApiResponse<Test>

    @GET("api/tests/{testId}")
    suspend fun getTestById(@Path("testId") testId: String): ApiResponse<Test>

    @PATCH("api/tests/{testId}")
    suspend fun updateTestStatus(@Path("testId") testId: String, @Body request: TestStatusRequest): ApiResponse<Test>

    @POST("api/tests/{testId}/attempts")
    suspend fun startTestAttempt(@Path("testId") testId: String): ApiResponse<TestAttempt>

    @POST("api/tests/{testId}/submit")
    suspend fun submitTestAttempt(
        @Path("testId") testId: String,
        @Body request: SubmitTestAttemptRequest
    ): ApiResponse<TestAttempt>

    @GET("api/tests/{testId}/analytics")
    suspend fun getTestAnalytics(@Path("testId") testId: String): ApiResponse<TeacherTestAnalytics>

    @POST("api/ai/lectures/{lectureId}/generate-quiz")
    suspend fun generateQuizFromLecture(
        @Path("lectureId") lectureId: String,
        @Body request: GenerateQuizRequest
    ): ApiResponse<GeneratedQuizResponse>

    @GET("api/notifications")
    suspend fun getNotifications(): ApiResponse<List<NotificationItem>>

    @PATCH("api/notifications/{notificationId}")
    suspend fun markNotificationRead(@Path("notificationId") notificationId: String): ApiResponse<NotificationItem>
}
