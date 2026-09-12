package com.classai.app.ui.notifications

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.classai.app.core.ui.components.EmptyState
import com.classai.app.core.ui.theme.ClassAiAmber
import com.classai.app.core.ui.theme.ClassAiEmerald
import com.classai.app.core.ui.theme.ClassAiRose
import com.classai.app.di.AppContainer
import com.classai.app.domain.model.NotificationItem
import com.classai.app.domain.model.NotificationType
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationScreen(
    onNavigateBack: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val notifications by AppContainer.notificationRepository.getNotifications().collectAsState(initial = emptyList())

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Notifications", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    TextButton(onClick = {
                        notifications.forEach {
                            coroutineScope.launch { AppContainer.notificationRepository.markAsRead(it.id) }
                        }
                    }) {
                        Text("Mark All Read")
                    }
                }
            )
        }
    ) { padding ->
        if (notifications.isEmpty()) {
            EmptyState(
                title = "No Notifications",
                message = "You're all caught up with your classes and quizzes."
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.background)
                    .padding(padding)
                    .padding(horizontal = 16.dp)
                    .testTag("notification_screen"),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                contentPadding = PaddingValues(top = 8.dp, bottom = 96.dp)
            ) {
                items(notifications) { item ->
                    val icon = when (item.type) {
                        NotificationType.LECTURE_NOTES_PUBLISHED -> Icons.Outlined.AutoAwesome
                        NotificationType.TEST_PUBLISHED -> Icons.Outlined.Assignment
                        NotificationType.TEST_DEADLINE -> Icons.Outlined.Timer
                        NotificationType.UPCOMING_TOPIC -> Icons.Outlined.CalendarToday
                        NotificationType.ABSENT_CATCHUP_READY -> Icons.Outlined.WarningAmber
                        NotificationType.RESOURCE_UPLOADED -> Icons.Outlined.Description
                    }

                    val color = when (item.type) {
                        NotificationType.LECTURE_NOTES_PUBLISHED -> MaterialTheme.colorScheme.primary
                        NotificationType.TEST_PUBLISHED -> ClassAiAmber
                        NotificationType.TEST_DEADLINE -> ClassAiRose
                        NotificationType.UPCOMING_TOPIC -> MaterialTheme.colorScheme.secondary
                        NotificationType.ABSENT_CATCHUP_READY -> ClassAiRose
                        NotificationType.RESOURCE_UPLOADED -> ClassAiEmerald
                    }

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                coroutineScope.launch {
                                    AppContainer.notificationRepository.markAsRead(item.id)
                                }
                            },
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (!item.isRead) MaterialTheme.colorScheme.surface else MaterialTheme.colorScheme.surface.copy(alpha = 0.6f)
                        ),
                        border = BorderStroke(
                            1.dp,
                            if (!item.isRead) color.copy(alpha = 0.5f) else MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = color.copy(alpha = 0.12f),
                                modifier = Modifier.size(40.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        imageVector = icon,
                                        contentDescription = null,
                                        tint = color,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = item.title,
                                        style = MaterialTheme.typography.titleSmall,
                                        fontWeight = if (!item.isRead) FontWeight.Bold else FontWeight.Medium
                                    )
                                    if (!item.isRead) {
                                        Surface(
                                            shape = CircleShape,
                                            color = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(8.dp)
                                        ) {}
                                    }
                                }

                                Spacer(modifier = Modifier.height(3.dp))

                                Text(
                                    text = item.message,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )

                                Spacer(modifier = Modifier.height(4.dp))

                                Text(
                                    text = item.timestamp,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
