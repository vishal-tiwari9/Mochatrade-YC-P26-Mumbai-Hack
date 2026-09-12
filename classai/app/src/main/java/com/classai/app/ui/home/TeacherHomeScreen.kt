package com.classai.app.ui.home

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.classai.app.core.ui.components.*
import com.classai.app.core.ui.theme.ClassAiEmerald
import com.classai.app.core.ui.theme.ClassAiRose
import com.classai.app.di.AppContainer
import com.classai.app.domain.model.*
import kotlinx.coroutines.flow.flowOf

@Composable
fun TeacherHomeScreen(
    onNavigateToClassroom: (String) -> Unit,
    onNavigateToCreateClassroom: () -> Unit,
    onNavigateToTakeAttendance: (String) -> Unit,
    onNavigateToCreateTest: (String) -> Unit,
    onNavigateToTestAnalytics: (String) -> Unit,
    onNavigateToLecture: (String) -> Unit,
    onNavigateToNotifications: () -> Unit
) {
    val userFlow = AppContainer.authRepository.getCurrentUser().collectAsState(initial = null)
    val classrooms by AppContainer.classroomRepository.getClassrooms().collectAsState(initial = emptyList())
    val activeClassroomId = classrooms.firstOrNull()?.classroomId
    val lectures by (activeClassroomId?.let { AppContainer.lectureRepository.getLectures(it) } ?: flowOf(emptyList())).collectAsState(initial = emptyList())
    val tests by (activeClassroomId?.let { AppContainer.testRepository.getClassroomTests(it) } ?: flowOf(emptyList())).collectAsState(initial = emptyList())
    val teacherAnalytics by (activeClassroomId?.let { AppContainer.attendanceRepository.getTeacherAttendanceAnalytics(it) } ?: flowOf(null)).collectAsState(initial = null)
    val resources by (activeClassroomId?.let { AppContainer.resourceRepository.getResources(it) } ?: flowOf(emptyList())).collectAsState(initial = emptyList())

    val currentUser = userFlow.value ?: return

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 16.dp)
            .testTag("teacher_home_screen"),
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
                        text = "Teacher Portal",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold
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
                    modifier = Modifier.testTag("teacher_home_notifications_btn")
                ) {
                    BadgedBox(badge = { Badge { Text("2") } }) {
                        Icon(
                            imageVector = Icons.Outlined.Notifications,
                            contentDescription = "Notifications",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }

        // Dedicated Lecture Recorder Card (as explicitly mandated)
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("teacher_recorder_banner"),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer
                ),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(48.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Outlined.LaptopMac,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Lecture Recorder",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Open the ClassAI teacher recorder on your laptop to capture and process lectures.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.8f)
                        )
                    }
                }
            }
        }

        // Quick Actions Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { activeClassroomId?.let(onNavigateToTakeAttendance) },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Icon(
                            imageVector = Icons.Outlined.HowToReg,
                            contentDescription = null,
                            tint = ClassAiEmerald
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Take Attendance",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Operating Systems",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { activeClassroomId?.let(onNavigateToCreateTest) },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Icon(
                            imageVector = Icons.Outlined.AddCircleOutline,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Create Test",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Draft or Quiz",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }

        // My Classrooms Section
        item {
            SectionHeader(
                title = "My Classrooms",
                actionText = "+ New Class",
                onActionClick = onNavigateToCreateClassroom
            )
        }

        items(classrooms) { classroom ->
            ClassroomCard(
                classroom = classroom,
                onClick = { onNavigateToClassroom(classroom.classroomId) }
            )
        }

        // Students below attendance threshold (Attendance Shortage Analytics)
        teacherAnalytics?.let { analytics ->
            item {
                SectionHeader(
                    title = "Attendance Alerts (< 75%)",
                    actionText = "Full Analytics",
                    onActionClick = { activeClassroomId?.let(onNavigateToTakeAttendance) }
                )
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, ClassAiRose.copy(alpha = 0.4f))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "${analytics.below75Count} Students with Shortage",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = ClassAiRose
                            )
                            Text(
                                text = "Avg: ${analytics.classAverage}%",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        val shortageStudents = analytics.students.filter { it.percentage < 75.0 }
                        shortageStudents.forEach { student ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = student.studentName,
                                        style = MaterialTheme.typography.bodySmall,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = student.rollNumber,
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }

                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = if (student.isCritical) ClassAiRose.copy(alpha = 0.15f) else MaterialTheme.colorScheme.tertiaryContainer
                                ) {
                                    Text(
                                        text = "${student.percentage}%",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = if (student.isCritical) ClassAiRose else MaterialTheme.colorScheme.onTertiaryContainer,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            HorizontalDivider(modifier = Modifier.padding(vertical = 2.dp), color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
                        }
                    }
                }
            }
        }

        // Active Tests & Analytics Quick Preview
        if (tests.isNotEmpty()) {
            item {
                SectionHeader(
                    title = "Class Tests & Analytics",
                    actionText = "Manage",
                    onActionClick = { onNavigateToTestAnalytics(tests.first().testId) }
                )
            }

            items(tests) { test ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigateToTestAnalytics(test.testId) },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = test.title,
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "${test.questionCount} Questions • Due ${test.deadlineAt}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        OutlinedButton(
                            onClick = { onNavigateToTestAnalytics(test.testId) },
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Analytics")
                        }
                    }
                }
            }
        }

        // Recent Resources
        if (resources.isNotEmpty()) {
            item {
                SectionHeader(title = "Recent Resources")
            }
            items(resources.take(3)) { resource ->
                ResourceCard(
                    resource = resource,
                    onClick = { /* handled in resources */ }
                )
            }
        }
    }
}
