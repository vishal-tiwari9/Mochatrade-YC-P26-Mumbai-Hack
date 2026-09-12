package com.classai.app.ui.test

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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.classai.app.core.ui.components.*
import com.classai.app.core.ui.theme.ClassAiEmerald
import com.classai.app.core.ui.theme.ClassAiRose
import com.classai.app.di.AppContainer
import com.classai.app.domain.model.*
import kotlinx.coroutines.flow.flowOf

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TestListScreen(
    onNavigateToTakeTest: (String) -> Unit,
    onNavigateToCreateTest: (String) -> Unit,
    onNavigateToAnalytics: (String) -> Unit
) {
    val userFlow = AppContainer.authRepository.getCurrentUser().collectAsState(initial = null)
    val classrooms by AppContainer.classroomRepository.getClassrooms().collectAsState(initial = emptyList())
    val activeClassroomId = classrooms.firstOrNull()?.classroomId
    val tests by (activeClassroomId?.let { AppContainer.testRepository.getClassroomTests(it) } ?: flowOf(emptyList())).collectAsState(initial = emptyList())
    val currentUser = userFlow.value ?: return
    val isTeacher = currentUser.role == UserRole.TEACHER

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (isTeacher) "Test Manager" else "My Tests & Quizzes", fontWeight = FontWeight.Bold) },
                actions = {
                    if (isTeacher) {
                        FilledTonalButton(
                            onClick = { activeClassroomId?.let(onNavigateToCreateTest) },
                            modifier = Modifier.padding(end = 8.dp).defaultMinSize(minHeight = 44.dp),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Create")
                        }
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(padding)
                .padding(horizontal = 16.dp)
                .testTag("test_list_screen"),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(top = 8.dp, bottom = 96.dp)
        ) {
            item {
                Text(
                    text = if (isTeacher) "Manage assessments, set deadlines, and inspect response analytics" else "Complete upcoming quizzes and review past grades",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            items(tests) { test ->
                TestCard(
                    test = test,
                    onClick = {
                        if (isTeacher) {
                            onNavigateToAnalytics(test.testId)
                        } else {
                            onNavigateToTakeTest(test.testId)
                        }
                    }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TakeTestScreen(
    testId: String,
    viewModel: TestViewModel,
    onNavigateBack: () -> Unit
) {
    val state by viewModel.takingState.collectAsState()
    var showConfirmSubmit by remember { mutableStateOf(false) }

    LaunchedEffect(testId) {
        viewModel.loadTestForTaking(testId)
    }

    val test = state.test
    if (test == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        return
    }
    val questions = state.questions
    val currentIndex = state.currentQuestionIndex
    val currentQuestion = questions.getOrNull(currentIndex)

    val minutes = state.remainingSeconds / 60
    val seconds = state.remainingSeconds % 60
    val timeFormatted = String.format("%02d:%02d", minutes, seconds)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(test.title, fontWeight = FontWeight.Bold, maxLines = 1) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (minutes < 3) MaterialTheme.colorScheme.errorContainer else MaterialTheme.colorScheme.primaryContainer,
                        modifier = Modifier.padding(end = 12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Timer,
                                contentDescription = "Timer",
                                tint = if (minutes < 3) ClassAiRose else MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = timeFormatted,
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = if (minutes < 3) ClassAiRose else MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            )
        }
    ) { padding ->
        if (state.isSubmitted && state.attemptResult != null) {
            val result = state.attemptResult!!
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Surface(
                    shape = CircleShape,
                    color = ClassAiEmerald.copy(alpha = 0.15f),
                    modifier = Modifier.size(80.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Check, contentDescription = null, tint = ClassAiEmerald, modifier = Modifier.size(44.dp))
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Text("Test Submitted Successfully", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)

                Spacer(modifier = Modifier.height(8.dp))

                if (result.isDescriptivePending) {
                    Text(
                        "Your submission has been recorded. Descriptive questions are pending teacher grading.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center
                    )
                } else {
                    Text(
                        "Your Score: ${result.score} / ${result.totalMarks} (${String.format("%.0f%%", result.percentage)})",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = ClassAiEmerald
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Graded immediately via objective evaluation.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }

                Spacer(modifier = Modifier.height(32.dp))

                PrimaryButton(
                    text = "Return to Dashboard",
                    onClick = onNavigateBack
                )
            }
        } else if (currentQuestion != null) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.background)
                    .padding(padding)
                    .padding(horizontal = 16.dp)
                    .testTag("take_test_screen")
            ) {
                // Progress Bar
                LinearProgressIndicator(
                    progress = { (currentIndex + 1).toFloat() / questions.size.toFloat() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Question ${currentIndex + 1} of ${questions.size}",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "${currentQuestion.marks} Marks",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Question Box
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = currentQuestion.questionText,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        val selectedList = state.userAnswers[currentQuestion.questionId] ?: emptyList()

                        when (currentQuestion.type) {
                            QuestionType.MCQ, QuestionType.TRUE_FALSE -> {
                                currentQuestion.options.forEach { option ->
                                    val isSelected = selectedList.contains(option)
                                    Surface(
                                        shape = RoundedCornerShape(10.dp),
                                        color = if (isSelected) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.6f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                                        border = BorderStroke(1.dp, if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)),
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 4.dp)
                                            .clickable { viewModel.selectOption(currentQuestion.questionId, option, false) }
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(12.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            RadioButton(
                                                selected = isSelected,
                                                onClick = { viewModel.selectOption(currentQuestion.questionId, option, false) }
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(text = option, style = MaterialTheme.typography.bodyMedium)
                                        }
                                    }
                                }
                            }
                            QuestionType.MULTI_SELECT -> {
                                currentQuestion.options.forEach { option ->
                                    val isSelected = selectedList.contains(option)
                                    Surface(
                                        shape = RoundedCornerShape(10.dp),
                                        color = if (isSelected) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.6f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                                        border = BorderStroke(1.dp, if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)),
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 4.dp)
                                            .clickable { viewModel.selectOption(currentQuestion.questionId, option, true) }
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(12.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Checkbox(
                                                checked = isSelected,
                                                onCheckedChange = { viewModel.selectOption(currentQuestion.questionId, option, true) }
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(text = option, style = MaterialTheme.typography.bodyMedium)
                                        }
                                    }
                                }
                            }
                            QuestionType.SHORT_ANSWER -> {
                                OutlinedTextField(
                                    value = selectedList.firstOrNull() ?: "",
                                    onValueChange = { viewModel.setTextInputAnswer(currentQuestion.questionId, it) },
                                    label = { Text("Your answer") },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(12.dp)
                                )
                            }
                            QuestionType.LONG_ANSWER -> {
                                OutlinedTextField(
                                    value = selectedList.firstOrNull() ?: "",
                                    onValueChange = { viewModel.setTextInputAnswer(currentQuestion.questionId, it) },
                                    label = { Text("Write your descriptive answer here...") },
                                    minLines = 4,
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(12.dp)
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.weight(1f))

                // Bottom Buttons
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    if (currentIndex > 0) {
                        OutlinedButton(
                            onClick = { viewModel.previousQuestion() },
                            modifier = Modifier.weight(1f).heightIn(min = 48.dp),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Previous")
                        }
                    }

                    if (currentIndex < questions.size - 1) {
                        Button(
                            onClick = { viewModel.nextQuestion() },
                            modifier = Modifier.weight(1f).heightIn(min = 48.dp),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Next")
                        }
                    } else {
                        Button(
                            onClick = { showConfirmSubmit = true },
                            modifier = Modifier.weight(1f).heightIn(min = 48.dp),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = ClassAiEmerald)
                        ) {
                            Text("Submit Test", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        } else {
            LoadingState(message = "Preparing test questions...")
        }
    }

    if (showConfirmSubmit) {
        AlertDialog(
            onDismissRequest = { showConfirmSubmit = false },
            title = { Text("Submit Assessment?") },
            text = { Text("You have answered ${state.userAnswers.size} of ${questions.size} questions. Once submitted, your responses cannot be modified.") },
            confirmButton = {
                Button(
                    onClick = {
                        showConfirmSubmit = false
                        viewModel.submitTest(testId) {}
                    }
                ) {
                    Text("Confirm Submit")
                }
            },
            dismissButton = {
                TextButton(onClick = { showConfirmSubmit = false }) {
                    Text("Review More")
                }
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateTestScreen(
    classroomId: String,
    viewModel: TestViewModel,
    onNavigateBack: () -> Unit
) {
    val state by viewModel.creationState.collectAsState()

    var newQuestionText by remember { mutableStateOf("") }
    var newQuestionMarks by remember { mutableIntStateOf(2) }
    var newOption1 by remember { mutableStateOf("") }
    var newOption2 by remember { mutableStateOf("") }
    var newOption3 by remember { mutableStateOf("") }
    var newOption4 by remember { mutableStateOf("") }
    var correctOption by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Create Assessment", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(padding)
                .padding(horizontal = 16.dp)
                .testTag("create_test_screen"),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(top = 8.dp, bottom = 96.dp)
        ) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Test Configuration", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedTextField(
                            value = state.title,
                            onValueChange = { viewModel.updateCreationTitle(it) },
                            label = { Text("Test Title (e.g. Unit 3: Deadlocks Quiz)") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = state.description,
                            onValueChange = { viewModel.updateCreationDesc(it) },
                            label = { Text("Instructions / Description") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 2
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            OutlinedTextField(
                                value = state.durationMinutes.toString(),
                                onValueChange = { it.toIntOrNull()?.let { v -> viewModel.updateCreationDuration(v) } },
                                label = { Text("Duration (Mins)") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = state.deadline,
                                onValueChange = { },
                                label = { Text("Deadline") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Show Score Immediately", style = MaterialTheme.typography.bodyMedium)
                            Switch(checked = state.showScoreImmediately, onCheckedChange = { viewModel.toggleShowScore(it) })
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Shuffle Questions", style = MaterialTheme.typography.bodyMedium)
                            Switch(checked = state.shuffleQuestions, onCheckedChange = { viewModel.toggleShuffle(it) })
                        }
                    }
                }
            }

            // Question Builder Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Add Multiple Choice Question", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = newQuestionText,
                            onValueChange = { newQuestionText = it },
                            label = { Text("Question statement") },
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(value = newOption1, onValueChange = { newOption1 = it }, label = { Text("Option A") }, modifier = Modifier.fillMaxWidth())
                        Spacer(modifier = Modifier.height(6.dp))
                        OutlinedTextField(value = newOption2, onValueChange = { newOption2 = it }, label = { Text("Option B") }, modifier = Modifier.fillMaxWidth())
                        Spacer(modifier = Modifier.height(6.dp))
                        OutlinedTextField(value = newOption3, onValueChange = { newOption3 = it }, label = { Text("Option C") }, modifier = Modifier.fillMaxWidth())
                        Spacer(modifier = Modifier.height(6.dp))
                        OutlinedTextField(value = newOption4, onValueChange = { newOption4 = it }, label = { Text("Option D") }, modifier = Modifier.fillMaxWidth())

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = correctOption,
                            onValueChange = { correctOption = it },
                            label = { Text("Exact Correct Option Text") },
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedButton(
                            onClick = {
                                if (newQuestionText.isNotBlank() && newOption1.isNotBlank()) {
                                    val q = Question(
                                        questionId = "q_${System.currentTimeMillis()}",
                                        testId = "draft",
                                        type = QuestionType.MCQ,
                                        questionText = newQuestionText,
                                        options = listOf(newOption1, newOption2, newOption3, newOption4).filter { it.isNotBlank() },
                                        correctAnswers = listOf(correctOption.ifBlank { newOption1 }),
                                        marks = newQuestionMarks,
                                        order = state.questions.size + 1
                                    )
                                    viewModel.addQuestionToCreation(q)
                                    newQuestionText = ""
                                    newOption1 = ""
                                    newOption2 = ""
                                    newOption3 = ""
                                    newOption4 = ""
                                    correctOption = ""
                                }
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("+ Add This Question (${state.questions.size} Added)")
                        }
                    }
                }
            }

            // Actions
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = { viewModel.saveTest(classroomId, false, onNavigateBack) },
                        modifier = Modifier.weight(1f).heightIn(min = 48.dp)
                    ) {
                        Text("Save Draft")
                    }

                    Button(
                        onClick = { viewModel.saveTest(classroomId, true, onNavigateBack) },
                        modifier = Modifier.weight(1f).heightIn(min = 48.dp)
                    ) {
                        Text("Publish Test")
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TestAnalyticsScreen(
    testId: String,
    viewModel: TestViewModel,
    onNavigateBack: () -> Unit
) {
    val analyticsFlow = remember(testId) { viewModel.getAnalytics(testId) }
    val analytics by analyticsFlow.collectAsState(initial = null)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Assessment Analytics", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        analytics?.let { data ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.background)
                    .padding(padding)
                    .padding(horizontal = 16.dp)
                    .testTag("test_analytics_screen"),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(top = 8.dp, bottom = 96.dp)
            ) {
                item {
                    Text(data.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("Total Enrolled: ${data.totalStudents} Students", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }

                // Summary Numbers Card
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text("Average", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("${data.averageScore}", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                }
                                Column {
                                    Text("High", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("${data.highestScore}", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = ClassAiEmerald)
                                }
                                Column {
                                    Text("Low", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("${data.lowestScore}", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = ClassAiRose)
                                }
                                Column {
                                    Text("Submitted", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("${data.submittedCount}/${data.totalStudents}", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }

                // Question Performance Breakdown
                item {
                    SectionHeader(title = "Question Breakdown & Difficulty")
                }

                items(data.questionAnalysis) { q ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = BorderStroke(1.dp, if (q.needsAttention) ClassAiRose.copy(alpha = 0.5f) else MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Q${q.order}. ${q.questionText}",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.weight(1f)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = if (q.needsAttention) ClassAiRose.copy(alpha = 0.12f) else ClassAiEmerald.copy(alpha = 0.12f)
                                ) {
                                    Text(
                                        text = "${q.percentCorrect}% Correct",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = if (q.needsAttention) ClassAiRose else ClassAiEmerald,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }

                            if (q.needsAttention) {
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "⚠️ Needs Attention: Over 60% of students missed this question.",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = ClassAiRose,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }

                // Student Responses
                item {
                    SectionHeader(title = "Submitted Student Responses (${data.responses.size})")
                }

                items(data.responses) { att ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(att.studentName, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                                Text("Submitted: ${att.submissionTime}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }

                            Text(
                                text = "${att.score ?: 0} / ${att.totalMarks}",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }
        } ?: LoadingState(message = "Loading analytics...")
    }
}
