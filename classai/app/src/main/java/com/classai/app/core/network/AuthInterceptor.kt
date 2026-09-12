package com.classai.app.core.network

import okhttp3.Interceptor
import okhttp3.Response

/**
 * AuthInterceptor prepares the HTTP request with Firebase ID token:
 * "Authorization: Bearer <firebase_id_token>"
 */
class AuthInterceptor(
    private val tokenProvider: suspend () -> String?
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val builder = original.newBuilder()

        // In a coroutine/blocking run, token is appended if present
        val token = runCatching {
            kotlinx.coroutines.runBlocking { tokenProvider() }
        }.getOrNull()

        if (!token.isNullOrBlank()) {
            builder.addHeader("Authorization", "Bearer $token")
        }
        builder.addHeader("Accept", "application/json")
        builder.addHeader("Content-Type", "application/json")

        return chain.proceed(builder.build())
    }
}
