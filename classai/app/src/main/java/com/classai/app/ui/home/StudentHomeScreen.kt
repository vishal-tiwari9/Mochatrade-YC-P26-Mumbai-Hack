package com.classai.app.ui.home

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.classai.app.core.ui.components.*
import com.classai.app.di.AppContainer
import com.classai.app.domain.model.*
import kotlinx.coroutines.flow.flowOf

@Composable
fun StudentHomeScreen(
    onNavigateToClassroom: (String) -> Unit,
    onNavigateToLecture: (String) -> Unit,
    onNavigateToTest: (String) -> Unit,
    onNavigateToCatchUp: (String) -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToAttendance: () -> Unit
) {
    val userFlow = AppContainer.authRepository.getCurrentUser().collectAsState(initial = null)
    val classrooms by AppContainer.classroomRepository.getClassrooms().collectAsState(initial = emptyList())
    val activeClassroomId = classrooms.firstOrNull()?.classroomId
    val upcomingTopic by (activeClassroomId?.let { AppContainer.classroomRepository.getUpcomingTopic(it) } ?: flowOf(null)).collectAsState(initial = null)
    val pendingTests by AppContainer.testRepository.getAllPendingTests().collectAsState(initial = emptyList())
    val lectures by (activeClassroomId?.let { AppContainer.lectureRepository.getLectures(it) } ?: flowOf(emptyList())).collectAsState(initial = emptyList())
    val attendanceOverview by AppContainer.attendanceRepository.getStudentAttendanceOverview(userFlow.value?.id.orEmpty()).collectAsState(initial = null)

    val currentUser = userFlow.value ?: return
    val missedLecture = lectures.find { it.studentAttendance == AttendanceStatus.ABSENT }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 16.dp)
            .testTag("student_home_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 96.dp)
    ) {
        // Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Good morning,",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = currentUser.name,
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                }

                IconButton(
                    onClick = onNavigateToNotifications,
                    modifier = Modifier.testTag("home_notification_icon")
                ) {
                    BadgedBox(
                        badge = { Badge { Text("3") } }
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Notifications,
                            contentDescription = "Notifications",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }

        // Upcoming Lecture/Topic Card
        upcomingTopic?.let { topic ->
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("upcoming_topic_card"),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = MaterialTheme.colorScheme.primary
                            ) {
                                Text(
                                    text = "UPCOMING",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = androidx.compose.ui.graphics.Color.White,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }

                            Text(
                                text = topic.lectureDate,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                                fontWeight = FontWeight.Medium
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = "Operating Systems",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )

                        Text(
                            text = topic.topic,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "Teacher will cover: ${topic.description}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.9f)
                        )
                    }
                }
            }
        }

        // Missed Class / Catch-Up Card
        missedLecture?.let { missed ->
            item {
                CatchUpCard(
                    lectureTitle = missed.title,
                    subjectName = "Operating Systems (${missed.topic})",
                    date = missed.lectureDate,
                    onCatchUpClick = { onNavigateToCatchUp(missed.lectureId) }
                )
            }
        }

        // Attendance Intelligence Summary
        attendanceOverview?.let { att ->
            item {
                AttendanceCard(
                    percentage = att.overallPercentage,
                    presentCount = att.presentCount,
                    absentCount = att.absentCount,
                    totalLectures = att.totalLectures,
                    statusMessage = att.statusMessage,
                    isShortage = att.isShortage,
                    onClick = onNavigateToAttendance
                )
            }
        }

        // Pending Tests Section
        if (pendingTests.isNotEmpty()) {
            item {
                SectionHeader(
                    title = "Pending Tests",
                    actionText = "See All",
                    onActionClick = { /* handeled by bottom tab */ }
                )
            }
            items(pendingTests) { test ->
                TestCard(
                    test = test,
                    onClick = { onNavigateToTest(test.testId) }
                )
            }
        }

        // Recent Lecture Notes Section
        item {
            SectionHeader(
                title = "Recent Notes & Lectures",
                actionText = "Notebook",
                onActionClick = { activeClassroomId?.let(onNavigateToClassroom) }
            )
        }

        items(lectures) { lecture ->
            LectureCard(
                lecture = lecture,
                onClick = { onNavigateToLecture(lecture.lectureId) }
            )
        }
    }
}
