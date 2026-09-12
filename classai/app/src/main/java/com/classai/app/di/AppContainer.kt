package com.classai.app.di

import com.classai.app.core.network.AuthInterceptor
import com.classai.app.data.remote.*
import com.example.BuildConfig
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import com.classai.app.domain.repository.*
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Dependency Injection Container for ClassAI.
 * Uses Firebase Authentication plus the hosted FastAPI service. The base URL is
 * supplied at build time through CLASSAI_API_BASE_URL; debug builds default to
 * the Android emulator's host loopback address.
 */
object AppContainer {

    private val baseUrl = BuildConfig.CLASSAI_API_BASE_URL

    private val okHttpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor { firebaseAuthRepository.getIdToken() })
            .addInterceptor(HttpLoggingInterceptor().apply {
                redactHeader("Authorization")
                level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BASIC else HttpLoggingInterceptor.Level.NONE
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(Moshi.Builder().add(KotlinJsonAdapterFactory()).build()))
            .build()
    }

    val apiService: ClassAiApiService by lazy {
        retrofit.create(ClassAiApiService::class.java)
    }

    private val firebaseAuthRepository by lazy { FirebaseAuthRepository(apiService) }
    private val remoteClassroomRepository by lazy { RemoteClassroomRepository(apiService) }
    private val remoteLectureRepository by lazy { RemoteLectureRepository(apiService) }
    private val remoteAttendanceRepository by lazy { RemoteAttendanceRepository(apiService) }
    private val remoteTestRepository by lazy { RemoteTestRepository(apiService) }
    private val remoteResourceRepository by lazy { RemoteResourceRepository(apiService) }
    private val remoteNotificationRepository by lazy { RemoteNotificationRepository(apiService) }

    val authRepository: AuthRepository
        get() = firebaseAuthRepository

    val classroomRepository: ClassroomRepository
        get() = remoteClassroomRepository

    val lectureRepository: LectureRepository
        get() = remoteLectureRepository

    val attendanceRepository: AttendanceRepository
        get() = remoteAttendanceRepository

    val testRepository: TestRepository
        get() = remoteTestRepository

    val resourceRepository: ResourceRepository
        get() = remoteResourceRepository

    val notificationRepository: NotificationRepository
        get() = remoteNotificationRepository

    suspend fun authToken(): String? = firebaseAuthRepository.getIdToken()

    suspend fun syncFcmToken(token: String) = syncFcmToken(apiService, token)
}
