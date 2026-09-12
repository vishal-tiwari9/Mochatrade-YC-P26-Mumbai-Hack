package com.classai.app.core.network

/**
 * Standard API response wrapper matching the backend contract:
 * {
 *   "success": true,
 *   "data": {},
 *   "message": null
 * }
 */
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val message: String? = null,
    val code: String? = null
)

sealed class Resource<out T> {
    data class Success<out T>(val data: T) : Resource<T>()
    data class Error(val message: String, val code: String? = null) : Resource<Nothing>()
    object Loading : Resource<Nothing>()
}
