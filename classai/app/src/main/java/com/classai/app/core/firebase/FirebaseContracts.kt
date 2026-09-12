package com.classai.app.core.firebase

/**
 * Contracts preparing ClassAI for real Firebase backend services
 */
interface FirebaseAuthService {
    suspend fun getCurrentUserId(): String?
    suspend fun getIdToken(forceRefresh: Boolean = false): String?
    suspend fun signInWithEmailAndPassword(email: String, password: String):Result<String>
    suspend fun signUpWithEmailAndPassword(email: String, password: String): Result<String>
    suspend fun sendPasswordResetEmail(email: String): Result<Unit>
    suspend fun sendEmailVerification(): Result<Unit>
    suspend fun signOut()
}

interface FirestoreService {
    suspend fun <T : Any> getDocument(collection: String, documentId: String, clazz: Class<T>): Result<T?>
    suspend fun <T : Any> setDocument(collection: String, documentId: String, data: T): Result<Unit>
    suspend fun <T : Any> getCollection(collection: String, clazz: Class<T>): Result<List<T>>
}

interface FirebaseStorageService {
    suspend fun uploadFile(path: String, bytes: ByteArray): Result<String>
    suspend fun getDownloadUrl(path: String): Result<String>
}

interface FcmNotificationService {
    suspend fun getDeviceToken(): String?
    suspend fun subscribeToTopic(topic: String): Result<Unit>
    suspend fun unsubscribeFromTopic(topic: String): Result<Unit>
}
