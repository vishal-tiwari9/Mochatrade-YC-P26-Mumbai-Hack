package com.classai.app.ui.attendance

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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AttendanceScreen(
    viewModel: AttendanceViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToCatchUp: (String) -> Unit
) {
    val userFlow = AppContainer.authRepository.getCurrentUser().collectAsState(initial = null)
    val currentUser = userFlow.value ?: return
    val isTeacher = currentUser.role == UserRole.TEACHER

    if (isTeacher) {
        TeacherAttendanceHub(viewModel = viewModel)
    } else {
        StudentAttendanceView(viewModel = viewModel, onNavigateToCatchUp = onNavigateToCatchUp)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun StudentAttendanceView(
    viewModel: AttendanceViewModel,
    onNavigateToCatchUp: (String) -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val overview = state.studentOverview
    if (overview == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        return
    }

    var filterStatus by remember { mutableStateOf<AttendanceStatus?>(null) }

    val filteredHistory = remember(overview.history, filterStatus) {
        if (filterStatus == null) overview.history else overview.history.filter { it.status == filterStatus }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Attendance Intelligence", fontWeight = FontWeight.Bold) }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(padding)
                .padding(horizontal = 16.dp)
                .testTag("student_attendance_screen"),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(top = 8.dp, bottom = 96.dp)
        ) {
            item {
                AttendanceCard(
                    percentage = overview.overallPercentage,
                    presentCount = overview.presentCount,
                    absentCount = overview.absentCount,
                    totalLectures = overview.totalLectures,
                    statusMessage = overview.statusMessage,
                    isShortage = overview.isShortage
                )
            }

            // Calculation Details Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("75% Policy Metric", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = if (overview.isShortage) ClassAiRose.copy(alpha = 0.15f) else ClassAiEmerald.copy(alpha = 0.15f)
                            ) {
                                Text(
                                    text = if (overview.isShortage) "Shortage Action Required" else "Good Standing",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = if (overview.isShortage) ClassAiRose else ClassAiEmerald,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        if (overview.isShortage) {
                            Text(
                                text = "You require ${overview.requiredConsecutive} consecutive attended lectures to safely recover above the 75% threshold.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = ClassAiRose
                            )
                        } else {
                            Text(
                                text = "You can afford to miss up to ${overview.safeMisses} more lectures while safely maintaining 75%+ overall attendance.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }

            // Filter Chips
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = filterStatus == null,
                        onClick = { filterStatus = null },
                        label = { Text("All (${overview.history.size})") }
                    )
                    FilterChip(
                        selected = filterStatus == AttendanceStatus.PRESENT,
                        onClick = { filterStatus = AttendanceStatus.PRESENT },
                        label = { Text("Present (${overview.presentCount})") }
                    )
                    FilterChip(
                        selected = filterStatus == AttendanceStatus.ABSENT,
                        onClick = { filterStatus = AttendanceStatus.ABSENT },
                        label = { Text("Absent (${overview.absentCount})") }
                    )
                }
            }

            // History List
            item {
                SectionHeader(title = "Lecture Session History")
            }

            items(filteredHistory) { record ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(record.lectureTitle, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                            Text(record.date, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }

                        if (record.status == AttendanceStatus.PRESENT) {
                            Surface(shape = RoundedCornerShape(6.dp), color = ClassAiEmerald.copy(alpha = 0.12f)) {
                                Text(
                                    text = "✓ Present",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = ClassAiEmerald,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        } else {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(shape = RoundedCornerShape(6.dp), color = ClassAiRose.copy(alpha = 0.12f)) {
                                    Text(
                                        text = "✕ Absent",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = ClassAiRose,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                TextButton(
                                    onClick = { onNavigateToCatchUp("lec_02") },
                                    modifier = Modifier.defaultMinSize(minHeight = 44.dp)
                                ) {
                                    Text("Catch Up", style = MaterialTheme.typography.labelSmall, color = ClassAiRose)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun TeacherAttendanceHub(
    viewModel: AttendanceViewModel
) {
    val state by viewModel.uiState.collectAsState()
    var selectedTab by remember { mutableIntStateOf(0) }
    var showConfirmDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Attendance Manager", fontWeight = FontWeight.Bold) }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(padding)
                .testTag("teacher_attendance_screen")
        ) {
            TabRow(selectedTabIndex = selectedTab) {
                Tab(selected = selectedTab == 0, onClick = { selectedTab = 0 }, text = { Text("Take Attendance") })
                Tab(selected = selectedTab == 1, onClick = { selectedTab = 1 }, text = { Text("Class Analytics") })
            }

            if (selectedTab == 0) {
                // Take attendance list
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp)
                ) {
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Operating Systems • Div A", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                            Text("Session: Today (${state.studentRecords.count { it.status == AttendanceStatus.PRESENT }}/${state.studentRecords.size} Present)", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }

                        OutlinedButton(
                            onClick = { viewModel.markAllPresent() },
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.heightIn(min = 40.dp)
                        ) {
                            Text("Mark All Present", style = MaterialTheme.typography.labelSmall)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    LazyColumn(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(state.studentRecords) { record ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { viewModel.toggleStudentAttendance(record.studentId) },
                                shape = RoundedCornerShape(10.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (record.status == AttendanceStatus.PRESENT) MaterialTheme.colorScheme.surface else ClassAiRose.copy(alpha = 0.08f)
                                ),
                                border = BorderStroke(1.dp, if (record.status == AttendanceStatus.PRESENT) MaterialTheme.colorScheme.outline.copy(alpha = 0.4f) else ClassAiRose.copy(alpha = 0.3f))
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 14.dp, vertical = 10.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(record.studentName, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                                        Text(record.rollNumber, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }

                                    Button(
                                        onClick = { viewModel.toggleStudentAttendance(record.studentId) },
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = if (record.status == AttendanceStatus.PRESENT) ClassAiEmerald else ClassAiRose
                                        ),
                                        shape = RoundedCornerShape(8.dp),
                                        modifier = Modifier.heightIn(min = 36.dp)
                                    ) {
                                        Text(
                                            text = if (record.status == AttendanceStatus.PRESENT) "Present" else "Absent",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = Color.White,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    PrimaryButton(
                        text = "Submit Attendance Session",
                        onClick = { showConfirmDialog = true },
                        isLoading = state.isSubmitting,
                        testTag = "submit_attendance_btn"
                    )

                    Spacer(modifier = Modifier.height(16.dp))
                }
            } else {
                // Class Analytics
                state.teacherAnalytics?.let { analytics ->
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text("Class Overview", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Column {
                                            Text("Average", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                            Text("${analytics.classAverage}%", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = ClassAiEmerald)
                                        }
                                        Column {
                                            Text("Lectures", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                            Text("${analytics.totalLecturesConducted}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                                        }
                                        Column {
                                            Text("Below 75%", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                            Text("${analytics.below75Count}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = ClassAiRose)
                                        }
                                    }
                                }
                            }
                        }

                        item {
                            SectionHeader(title = "Shortage Roster (< 75%)")
                        }

                        items(analytics.students.filter { it.percentage < 75.0 }) { student ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                border = BorderStroke(1.dp, ClassAiRose.copy(alpha = 0.4f))
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(14.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(student.studentName, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                                        Text("${student.rollNumber} • ${student.presentCount}/${student.totalCount} lectures", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }

                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = if (student.isCritical) ClassAiRose.copy(alpha = 0.15f) else MaterialTheme.colorScheme.tertiaryContainer
                                    ) {
                                        Text(
                                            text = "${student.percentage}%",
                                            style = MaterialTheme.typography.labelMedium,
                                            fontWeight = FontWeight.Bold,
                                            color = if (student.isCritical) ClassAiRose else MaterialTheme.colorScheme.onTertiaryContainer,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showConfirmDialog = false },
            title = { Text("Confirm Attendance Submission") },
            text = { Text("Are you ready to submit attendance for ${state.studentRecords.size} students? This record will update student analytics immediately.") },
            confirmButton = {
                Button(
                    onClick = {
                        showConfirmDialog = false
                        viewModel.submitAttendance {}
                    }
                ) {
                    Text("Submit")
                }
            },
            dismissButton = {
                TextButton(onClick = { showConfirmDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
