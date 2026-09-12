package com.classai.app.ui.lecture

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.window.Dialog
import com.classai.app.core.ui.components.*
import com.classai.app.core.ui.theme.ClassAiEmerald
import com.classai.app.core.ui.theme.ClassAiRose
import com.classai.app.di.AppContainer
import com.classai.app.domain.model.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LectureDetailScreen(
    lectureId: String,
    viewModel: LectureViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToPdf: (String, String) -> Unit,
    onNavigateToTakeTest: (String) -> Unit,
    onNavigateToCatchUp: (String) -> Unit
) {
    val state by viewModel.uiState.collectAsState()
    val userFlow = AppContainer.authRepository.getCurrentUser().collectAsState(initial = null)
    val currentUser = userFlow.value ?: return
    val isTeacher = currentUser.role == UserRole.TEACHER

    var showQuizGenDialog by remember { mutableStateOf(false) }
    var showFullTranscript by remember { mutableStateOf(false) }

    LaunchedEffect(lectureId) {
        viewModel.loadLecture(lectureId)
    }

    val lecture = state.lecture
    if (lecture == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        return
    }
    val isAbsent = lecture.studentAttendance == AttendanceStatus.ABSENT

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(lecture.title, fontWeight = FontWeight.Bold, maxLines = 1) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    if (isTeacher) {
                        FilledTonalButton(
                            onClick = { showQuizGenDialog = true },
                            modifier = Modifier.padding(end = 8.dp).defaultMinSize(minHeight = 44.dp),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(Icons.Outlined.AutoAwesome, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("AI Quiz", style = MaterialTheme.typography.labelSmall)
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
                .testTag("lecture_detail_screen"),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(top = 8.dp, bottom = 96.dp)
        ) {
            // Absent Catch-up Alert Banner if Student was absent
            if (!isTeacher && isAbsent) {
                item {
                    CatchUpCard(
                        lectureTitle = lecture.title,
                        subjectName = "Operating Systems",
                        date = lecture.lectureDate,
                        onCatchUpClick = { onNavigateToCatchUp(lecture.lectureId) }
                    )
                }
            }

            // Lecture Meta
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
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(shape = RoundedCornerShape(6.dp), color = MaterialTheme.colorScheme.primaryContainer) {
                                Text(
                                    text = lecture.topic,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                            Text(lecture.lectureDate, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(lecture.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = "Status: ${if (lecture.status == LectureStatus.PUBLISHED) "AI Processed" else "Processing"}",
                            style = MaterialTheme.typography.labelSmall,
                            color = ClassAiEmerald,
                            fontWeight = FontWeight.SemiBold
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Button(
                                onClick = { lecture.pdfUrl?.let { onNavigateToPdf(lecture.title, it) } },
                                enabled = !lecture.pdfUrl.isNullOrBlank(),
                                modifier = Modifier.weight(1f).heightIn(min = 48.dp),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(Icons.Outlined.PictureAsPdf, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Lecture PDF")
                            }

                            if (state.relatedTest != null) {
                                OutlinedButton(
                                    onClick = { onNavigateToTakeTest(state.relatedTest!!.testId) },
                                    modifier = Modifier.weight(1f).heightIn(min = 48.dp),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Icon(Icons.Outlined.Quiz, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Class Quiz")
                                }
                            }
                        }
                    }
                }
            }

            // Executive Summary
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Lecture Summary",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = lecture.summary,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface,
                            lineHeight = MaterialTheme.typography.bodyLarge.lineHeight
                        )

                        if (lecture.keyPoints.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(14.dp))
                            Text(
                                text = "Key Takeaways:",
                                style = MaterialTheme.typography.labelLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            for (point in lecture.keyPoints) {
                                Row(modifier = Modifier.padding(vertical = 3.dp)) {
                                    Text("• ", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                    Text(point, style = MaterialTheme.typography.bodyMedium)
                                }
                            }
                        }
                    }
                }
            }

            // Transcript Section
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
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Lecture Transcript",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            TextButton(onClick = { showFullTranscript = !showFullTranscript }) {
                                Text(if (showFullTranscript) "Collapse" else "Expand")
                            }
                        }

                        Text(
                            text = if (showFullTranscript) lecture.transcript else lecture.transcript.take(240) + "...",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // Teacher Resources Section
            if (state.resources.isNotEmpty()) {
                item {
                    SectionHeader(title = "Class Resources")
                }
                items(state.resources) { res ->
                    ResourceCard(resource = res, onClick = { onNavigateToPdf(res.title, res.fileUrl) })
                }
            }
        }
    }

    if (showQuizGenDialog) {
        AiQuizGeneratorDialog(
            lectureTitle = lecture.title,
            isGenerating = state.isGeneratingQuiz,
            generatedDraft = state.generatedDraft,
            onDismiss = {
                showQuizGenDialog = false
                viewModel.clearDraft()
            },
            onGenerate = { num, diff, types ->
                viewModel.generateAiQuiz(num, diff, types)
            },
            onSaveAsTest = { draft ->
                showQuizGenDialog = false
                viewModel.clearDraft()
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CatchUpScreen(
    lectureId: String,
    viewModel: LectureViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToPdf: (String, String) -> Unit,
    onNavigateToTakeTest: (String) -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(lectureId) {
        viewModel.loadLecture(lectureId)
    }

    val lecture = state.lecture
    if (lecture == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Catch-Up Hub", fontWeight = FontWeight.Bold) },
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
                .testTag("catch_up_screen"),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(top = 8.dp, bottom = 96.dp)
        ) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.4f)),
                    border = BorderStroke(1.dp, ClassAiRose.copy(alpha = 0.4f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("ABSENCE RECORDED", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = ClassAiRose)
                            Text(lecture.lectureDate, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(lecture.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "You missed this classroom session. Review the executive summary and slide notes below to catch up before the next lecture.",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("What Was Covered", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(lecture.summary, style = MaterialTheme.typography.bodyMedium)

                        Spacer(modifier = Modifier.height(14.dp))
                        Text("Core Concepts:", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(6.dp))
                        for (point in lecture.keyPoints) {
                            Row(modifier = Modifier.padding(vertical = 3.dp)) {
                                Text("✓ ", fontWeight = FontWeight.Bold, color = ClassAiEmerald)
                                Text(point, style = MaterialTheme.typography.bodyMedium)
                            }
                        }
                    }
                }
            }

            item {
                SectionHeader(title = "Catch-Up Actions")
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Button(
                        onClick = { lecture.pdfUrl?.let { onNavigateToPdf(lecture.title, it) } },
                        enabled = !lecture.pdfUrl.isNullOrBlank(),
                        modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Outlined.PictureAsPdf, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Read Lecture Notes & Slides")
                    }

                    if (state.relatedTest != null) {
                        OutlinedButton(
                            onClick = { onNavigateToTakeTest(state.relatedTest!!.testId) },
                            modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Outlined.CheckCircle, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Test Your Understanding with Quiz")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AiQuizGeneratorDialog(
    lectureTitle: String,
    isGenerating: Boolean,
    generatedDraft: QuizGenerationDraft?,
    onDismiss: () -> Unit,
    onGenerate: (Int, String, List<QuestionType>) -> Unit,
    onSaveAsTest: (QuizGenerationDraft) -> Unit
) {
    var numQuestions by remember { mutableIntStateOf(5) }
    var difficulty by remember { mutableStateOf("Medium") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .testTag("ai_quiz_gen_dialog")
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("AI Quiz Generator", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Text(
                    text = "Generate a draft test directly from: $lectureTitle",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(16.dp))

                if (generatedDraft == null) {
                    Text("Number of Questions: $numQuestions", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold)
                    Slider(
                        value = numQuestions.toFloat(),
                        onValueChange = { numQuestions = it.toInt() },
                        valueRange = 3f..15f,
                        steps = 11
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text("Difficulty Level:", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold)
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("Easy", "Medium", "Hard").forEach { diff ->
                            FilterChip(
                                selected = difficulty == diff,
                                onClick = { difficulty = diff },
                                label = { Text(diff) }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    PrimaryButton(
                        text = "Generate Quiz from Lecture",
                        onClick = {
                            onGenerate(numQuestions, difficulty, listOf(QuestionType.MCQ, QuestionType.TRUE_FALSE))
                        },
                        isLoading = isGenerating,
                        testTag = "start_ai_gen_btn"
                    )
                } else {
                    Text("Draft Generated (${generatedDraft.questions.size} Questions):", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, color = ClassAiEmerald)
                    Spacer(modifier = Modifier.height(10.dp))

                    generatedDraft.questions.take(2).forEachIndexed { i, q ->
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text("Q${i + 1}. ${q.questionText}", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
                                Text("Ans: ${q.correctAnswers.firstOrNull()}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    PrimaryButton(
                        text = "Import Questions to Test",
                        onClick = { onSaveAsTest(generatedDraft) },
                        testTag = "save_ai_quiz_btn"
                    )
                }
            }
        }
    }
}
