package com.classai.app.ui.classroom

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import com.classai.app.core.ui.theme.ClassAiEmerald
import com.classai.app.core.ui.theme.ClassAiRose
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.classai.app.core.ui.components.*
import com.classai.app.di.AppContainer
import com.classai.app.domain.model.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClassroomListScreen(
    onNavigateToDetail: (String) -> Unit,
    onNavigateToCreateClass: () -> Unit,
    modifier: Modifier = Modifier
) {
    val classrooms by AppContainer.classroomRepository.getClassrooms().collectAsState(initial = emptyList())
    val userFlow = AppContainer.authRepository.getCurrentUser().collectAsState(initial = null)
    val currentUser = userFlow.value ?: return
    val isTeacher = currentUser.role == UserRole.TEACHER

    var showJoinDialog by remember { mutableStateOf(false) }
    var showCreateDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (isTeacher) "Managed Classes" else "My Classrooms", fontWeight = FontWeight.Bold) },
                actions = {
                    if (isTeacher) {
                        FilledTonalButton(
                            onClick = { showCreateDialog = true },
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.padding(end = 8.dp).defaultMinSize(minHeight = 44.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Create")
                        }
                    } else {
                        FilledTonalButton(
                            onClick = { showJoinDialog = true },
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.padding(end = 8.dp).defaultMinSize(minHeight = 44.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Join")
                        }
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(padding)
                .padding(horizontal = 16.dp)
                .testTag("classroom_list_screen"),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(top = 8.dp, bottom = 96.dp)
        ) {
            item {
                Text(
                    text = if (isTeacher) "Manage assignments, notes, and attendance for your divisions" else "Select a class to view notes, tests, and attendance",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            items(classrooms) { classroom ->
                ClassroomCard(
                    classroom = classroom,
                    onClick = { onNavigateToDetail(classroom.classroomId) }
                )
            }
        }
    }

    if (showJoinDialog) {
        JoinClassroomDialog(
            onDismiss = { showJoinDialog = false },
            onJoined = {
                showJoinDialog = false
                onNavigateToDetail(it.classroomId)
            }
        )
    }

    if (showCreateDialog) {
        CreateClassroomDialog(
            onDismiss = { showCreateDialog = false },
            onCreated = {
                showCreateDialog = false
                onNavigateToDetail(it)
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClassroomDetailScreen(
    classroomId: String,
    viewModel: ClassroomViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToLecture: (String) -> Unit,
    onNavigateToCatchUp: (String) -> Unit,
    onNavigateToTakeTest: (String) -> Unit,
    onNavigateToCreateTest: (String) -> Unit,
    onNavigateToAttendance: (String) -> Unit,
    onNavigateToPdf: (String, String) -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val userFlow = AppContainer.authRepository.getCurrentUser().collectAsState(initial = null)
    val currentUser = userFlow.value ?: return
    val isTeacher = currentUser.role == UserRole.TEACHER

    var selectedTabIndex by remember { mutableIntStateOf(0) }
    val tabs = listOf("Overview", "Lectures", "Notes", "Tests", "Attendance", "People")

    var showUpcomingTopicDialog by remember { mutableStateOf(false) }

    LaunchedEffect(classroomId) {
        viewModel.loadClassroom(classroomId)
    }

    val classroom = state.classroom
    if (classroom == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(classroom.className, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text("${classroom.subjectCode} • Div ${classroom.division}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = MaterialTheme.colorScheme.primaryContainer,
                        modifier = Modifier.padding(end = 8.dp)
                    ) {
                        Text(
                            text = classroom.joinCode,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(padding)
                .testTag("classroom_detail_screen")
        ) {
            // Scrollable Tab Row for the 6 Clean Tabs
            PrimaryScrollableTabRow(
                selectedTabIndex = selectedTabIndex,
                edgePadding = 12.dp,
                containerColor = MaterialTheme.colorScheme.surface
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTabIndex == index,
                        onClick = { selectedTabIndex = index },
                        text = {
                            Text(
                                text = title,
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = if (selectedTabIndex == index) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    )
                }
            }

            when (selectedTabIndex) {
                0 -> ClassroomOverviewTab(
                    classroom = classroom,
                    state = state,
                    isTeacher = isTeacher,
                    onEditUpcomingTopic = { showUpcomingTopicDialog = true },
                    onNavigateToLecture = onNavigateToLecture,
                    onNavigateToCatchUp = onNavigateToCatchUp,
                    onNavigateToTest = onNavigateToTakeTest,
                    onNavigateToAttendance = { onNavigateToAttendance(classroom.classroomId) }
                )
                1 -> ClassroomLecturesTab(
                    lectures = state.lectures,
                    onNavigateToLecture = onNavigateToLecture,
                    onNavigateToCatchUp = onNavigateToCatchUp
                )
                2 -> ClassroomNotesTab(
                    notebookEntries = state.notebookEntries,
                    resources = state.resources,
                    onNavigateToLecture = onNavigateToLecture,
                    onNavigateToCatchUp = onNavigateToCatchUp,
                    onNavigateToPdf = onNavigateToPdf
                )
                3 -> ClassroomTestsTab(
                    tests = state.tests,
                    isTeacher = isTeacher,
                    onCreateTest = { onNavigateToCreateTest(classroom.classroomId) },
                    onTakeTest = onNavigateToTakeTest
                )
                4 -> ClassroomAttendanceTab(
                    classroomId = classroom.classroomId,
                    isTeacher = isTeacher,
                    onTakeAttendance = { onNavigateToAttendance(classroom.classroomId) }
                )
                5 -> ClassroomPeopleTab(
                    members = state.members,
                    teacherName = classroom.teacherName
                )
            }
        }
    }

    if (showUpcomingTopicDialog) {
        UpcomingTopicDialog(
            currentTopic = state.upcomingTopic,
            onDismiss = { showUpcomingTopicDialog = false },
            onSave = { topic, date, desc ->
                viewModel.setUpcomingTopic(classroom.classroomId, topic, date, desc)
                showUpcomingTopicDialog = false
            }
        )
    }
}

@Composable
private fun ClassroomOverviewTab(
    classroom: Classroom,
    state: ClassroomDetailUiState,
    isTeacher: Boolean,
    onEditUpcomingTopic: () -> Unit,
    onNavigateToLecture: (String) -> Unit,
    onNavigateToCatchUp: (String) -> Unit,
    onNavigateToTest: (String) -> Unit,
    onNavigateToAttendance: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 96.dp)
    ) {
        // Upcoming Topic Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Next Lecture",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                            fontWeight = FontWeight.Bold
                        )
                        if (isTeacher) {
                            TextButton(onClick = onEditUpcomingTopic) {
                                Text("Edit Topic", style = MaterialTheme.typography.labelSmall)
                            }
                        } else {
                            Text(
                                text = state.upcomingTopic?.lectureDate ?: "14 Sep • 10:00 AM",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                    }

                    Text(
                        text = state.upcomingTopic?.topic ?: "Deadlocks",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "Teacher will cover: ${state.upcomingTopic?.description ?: "Deadlock detection and prevention."}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.9f)
                    )
                }
            }
        }

        // Catch up card if absent
        val missed = state.lectures.find { it.studentAttendance == AttendanceStatus.ABSENT }
        if (!isTeacher && missed != null) {
            item {
                CatchUpCard(
                    lectureTitle = missed.title,
                    subjectName = classroom.subjectName,
                    date = missed.lectureDate,
                    onCatchUpClick = { onNavigateToCatchUp(missed.lectureId) }
                )
            }
        }

        // Attendance Summary Card
        item {
            SectionHeader(title = "Attendance Status", actionText = "Details", onActionClick = onNavigateToAttendance)
            AttendanceCard(
                percentage = 82.35,
                presentCount = 28,
                absentCount = 6,
                totalLectures = 34,
                statusMessage = "You can miss approximately 3 more lectures while remaining above 75%.",
                isShortage = false,
                onClick = onNavigateToAttendance
            )
        }

        // Upcoming / Active Test
        state.tests.firstOrNull()?.let { test ->
            item {
                SectionHeader(title = "Upcoming Test")
                TestCard(test = test, onClick = { onNavigateToTest(test.testId) })
            }
        }

        // Recent Lecture
        state.lectures.firstOrNull()?.let { lecture ->
            item {
                SectionHeader(title = "Latest Published Lecture")
                LectureCard(lecture = lecture, onClick = { onNavigateToLecture(lecture.lectureId) })
            }
        }
    }
}

@Composable
private fun ClassroomLecturesTab(
    lectures: List<Lecture>,
    onNavigateToLecture: (String) -> Unit,
    onNavigateToCatchUp: (String) -> Unit
) {
    if (lectures.isEmpty()) {
        EmptyState(title = "No Lectures", message = "No lectures have been published for this class yet.")
    } else {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(top = 16.dp, bottom = 96.dp)
        ) {
            items(lectures) { lecture ->
                LectureCard(lecture = lecture, onClick = { onNavigateToLecture(lecture.lectureId) })
            }
        }
    }
}

@Composable
private fun ClassroomNotesTab(
    notebookEntries: List<NotebookEntry>,
    resources: List<ResourceItem>,
    onNavigateToLecture: (String) -> Unit,
    onNavigateToCatchUp: (String) -> Unit,
    onNavigateToPdf: (String, String) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 96.dp)
    ) {
        item {
            Text(
                text = "OPERATING SYSTEMS",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Chronological Class Notebook",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(6.dp))
        }

        items(notebookEntries) { entry ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToLecture(entry.lectureId) },
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = entry.date,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        if (entry.attendance == AttendanceStatus.PRESENT) {
                            Text(
                                text = "✓ Present",
                                style = MaterialTheme.typography.labelSmall,
                                color = ClassAiEmerald,
                                fontWeight = FontWeight.Bold
                            )
                        } else {
                            Text(
                                text = "✕ Absent",
                                style = MaterialTheme.typography.labelSmall,
                                color = ClassAiRose,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = entry.title,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )

                    Text(
                        text = entry.topic,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        FilledTonalButton(
                            onClick = { onNavigateToLecture(entry.lectureId) },
                            modifier = Modifier.heightIn(min = 36.dp),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Open notes", style = MaterialTheme.typography.labelSmall)
                        }

                        OutlinedButton(
                            onClick = { onNavigateToLecture(entry.lectureId) },
                            modifier = Modifier.heightIn(min = 36.dp),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Summary", style = MaterialTheme.typography.labelSmall)
                        }

                        if (entry.hasCatchUp) {
                            Button(
                                onClick = { onNavigateToCatchUp(entry.lectureId) },
                                modifier = Modifier.heightIn(min = 36.dp),
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = ClassAiRose)
                            ) {
                                Text("Catch Up", style = MaterialTheme.typography.labelSmall, color = Color.White)
                            }
                        }
                    }
                }
            }
        }

        // Teacher Resources List
        item {
            Spacer(modifier = Modifier.height(10.dp))
            SectionHeader(title = "Teacher Uploaded Resources")
        }

        items(resources) { res ->
            ResourceCard(
                resource = res,
                onClick = { onNavigateToPdf(res.title, res.fileUrl) }
            )
        }
    }
}

@Composable
private fun ClassroomTestsTab(
    tests: List<Test>,
    isTeacher: Boolean,
    onCreateTest: () -> Unit,
    onTakeTest: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        if (isTeacher) {
            Spacer(modifier = Modifier.height(12.dp))
            PrimaryButton(
                text = "+ Create New Test",
                onClick = onCreateTest,
                testTag = "create_test_btn"
            )
            Spacer(modifier = Modifier.height(12.dp))
        }

        if (tests.isEmpty()) {
            EmptyState(
                title = "No Tests",
                message = "No quizzes or tests scheduled for this class.",
                actionText = if (isTeacher) "Create Test" else null,
                onActionClick = if (isTeacher) onCreateTest else null
            )
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(top = 12.dp, bottom = 96.dp)
            ) {
                items(tests) { test ->
                    TestCard(test = test, onClick = { onTakeTest(test.testId) })
                }
            }
        }
    }
}

@Composable
private fun ClassroomAttendanceTab(
    classroomId: String,
    isTeacher: Boolean,
    onTakeAttendance: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        if (isTeacher) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Attendance Management", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Text("Record present and absent status for all students in Division A.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(modifier = Modifier.height(16.dp))
                    PrimaryButton(
                        text = "Take Today's Attendance",
                        onClick = onTakeAttendance,
                        testTag = "take_attendance_btn"
                    )
                }
            }
        } else {
            AttendanceCard(
                percentage = 82.35,
                presentCount = 28,
                absentCount = 6,
                totalLectures = 34,
                statusMessage = "You can miss approximately 3 more lectures while remaining above 75%.",
                isShortage = false
            )
        }
    }
}

@Composable
private fun ClassroomPeopleTab(
    members: List<User>,
    teacherName: String
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 96.dp)
    ) {
        item {
            Text("TEACHER", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.height(4.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(shape = CircleShape, color = MaterialTheme.colorScheme.primary, modifier = Modifier.size(40.dp)) {
                        Box(contentAlignment = Alignment.Center) {
                            Text("PS", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(teacherName, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                        Text("Instructor", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text("STUDENTS (${members.filter { it.role == UserRole.STUDENT }.size})", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }

        items(members.filter { it.role == UserRole.STUDENT }) { student ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = CircleShape,
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(student.name.take(1), fontWeight = FontWeight.Bold)
                        }
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(student.name, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold)
                        Text(student.rollOrEmpId, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

@Composable
fun CreateClassroomDialog(
    onDismiss: () -> Unit,
    onCreated: (String) -> Unit
) {
    val context = LocalContext.current
    var className by remember { mutableStateOf("") }
    var subject by remember { mutableStateOf("") }
    var code by remember { mutableStateOf("") }
    var semester by remember { mutableStateOf("6") }
    var division by remember { mutableStateOf("A") }

    var createdJoinCode by remember { mutableStateOf<String?>(null) }
    var createdClassroomId by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .testTag("create_classroom_dialog")
            ) {
                if (createdJoinCode == null) {
                    Text("Create Classroom", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = className,
                        onValueChange = { className = it },
                        label = { Text("Class Name (e.g. Operating Systems)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth().testTag("create_class_name_field")
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = subject,
                        onValueChange = { subject = it },
                        label = { Text("Subject") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth().testTag("create_class_subject_field")
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = code,
                        onValueChange = { code = it },
                        label = { Text("Subject Code (e.g. CS601)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth().testTag("create_class_code_field")
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = semester,
                            onValueChange = { semester = it },
                            label = { Text("Semester") },
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = division,
                            onValueChange = { division = it },
                            label = { Text("Division") },
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    PrimaryButton(
                        text = "Create Classroom",
                        onClick = {
                            if (className.isNotBlank() && subject.isNotBlank()) scope.launch {
                                AppContainer.classroomRepository.createClassroom(className, subject, code, semester, division)
                                    .onSuccess {
                                        createdJoinCode = it.joinCode
                                        createdClassroomId = it.classroomId
                                    }
                            }
                        },
                        testTag = "confirm_create_class_btn"
                    )
                } else {
                    // Success View after creation
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = ClassAiEmerald,
                            modifier = Modifier.size(56.dp)
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Text("Class Created", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        Text("Share this join code with your students:", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)

                        Spacer(modifier = Modifier.height(16.dp))

                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = MaterialTheme.colorScheme.primaryContainer,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = createdJoinCode!!,
                                style = MaterialTheme.typography.headlineLarge,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(16.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedButton(
                                onClick = {
                                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    val clip = ClipData.newPlainText("Class Join Code", createdJoinCode)
                                    clipboard.setPrimaryClip(clip)
                                    Toast.makeText(context, "Code copied to clipboard", Toast.LENGTH_SHORT).show()
                                },
                                modifier = Modifier.weight(1f).heightIn(min = 48.dp)
                            ) {
                                Text("Copy Code")
                            }

                            Button(
                                onClick = {
                                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                        type = "text/plain"
                                        putExtra(Intent.EXTRA_TEXT, "Join our class on ClassAI using code: $createdJoinCode")
                                    }
                                    context.startActivity(Intent.createChooser(shareIntent, "Share Join Code"))
                                },
                                modifier = Modifier.weight(1f).heightIn(min = 48.dp)
                            ) {
                                Text("Share Code")
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        TextButton(
                            onClick = { createdClassroomId?.let(onCreated) },
                            modifier = Modifier.defaultMinSize(minHeight = 48.dp)
                        ) {
                            Text("Open Classroom")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun JoinClassroomDialog(
    onDismiss: () -> Unit,
    onJoined: (Classroom) -> Unit
) {
    var code by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .testTag("join_classroom_dialog")
            ) {
                Text("Join Classroom", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text("Enter the 6-character code provided by your teacher.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = code,
                    onValueChange = { code = it.uppercase() },
                    label = { Text("Join Code (e.g. OS7X92)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("join_code_field")
                )

                Spacer(modifier = Modifier.height(20.dp))

                PrimaryButton(
                    text = "Join",
                    onClick = {
                        if (code.isNotBlank()) scope.launch {
                            AppContainer.classroomRepository.joinClassroom(code).onSuccess(onJoined)
                        }
                    },
                    testTag = "confirm_join_btn"
                )
            }
        }
    }
}

@Composable
fun UpcomingTopicDialog(
    currentTopic: UpcomingTopic?,
    onDismiss: () -> Unit,
    onSave: (String, String, String) -> Unit
) {
    var topic by remember { mutableStateOf(currentTopic?.topic ?: "Deadlocks") }
    var date by remember { mutableStateOf(currentTopic?.lectureDate ?: "14 September • 10:00 AM") }
    var description by remember { mutableStateOf(currentTopic?.description ?: "Deadlock detection and prevention.") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .testTag("upcoming_topic_dialog")
            ) {
                Text("Set Upcoming Topic", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(14.dp))

                OutlinedTextField(
                    value = topic,
                    onValueChange = { topic = it },
                    label = { Text("Topic (e.g. Deadlocks)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = date,
                    onValueChange = { date = it },
                    label = { Text("Lecture Date & Time") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description") },
                    minLines = 2,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(20.dp))

                PrimaryButton(
                    text = "Save Topic",
                    onClick = { onSave(topic, date, description) }
                )
            }
        }
    }
}
