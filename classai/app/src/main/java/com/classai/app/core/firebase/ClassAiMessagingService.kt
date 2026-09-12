package com.classai.app.core.firebase

import com.classai.app.di.AppContainer
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/** Registers refreshed FCM tokens with the authenticated ClassAI backend. */
class ClassAiMessagingService : FirebaseMessagingService() {
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        serviceScope.launch { AppContainer.syncFcmToken(token) }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        // The OS displays notification payloads while the app is backgrounded.
        // In-app state is refreshed from GET /api/notifications when opened.
    }
}
