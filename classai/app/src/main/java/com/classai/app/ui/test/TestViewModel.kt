package com.classai.app.ui.test

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.classai.app.di.AppContainer
import com.classai.app.domain.model.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class TestTakingUiState(
    val test: Test? = null,
    val questions: List<Question> = emptyList(),
    val currentQuestionIndex: Int = 0,
    val userAnswers: Map<String, List<String>> = emptyMap(),
    val remainingSeconds: Int = 1200,
    val isSubmitted: Boolean = false,
    val attemptResult: TestAttempt? = null,
    val isSubmitting: Boolean = false,
    val message: String? = null
)

data class TestCreationUiState(
    val title: String = "",
    val description: String = "",
    val totalMarks: Int = 20,
    val durationMinutes: Int = 20,
    val deadline: String = "Tomorrow, 5:00 PM",
    val showScoreImmediately: Boolean = true,
    val shuffleQuestions: Boolean = false,
    val singleResponseOnly: Boolean = true,
    val questions: List<Question> = emptyList(),
    val isSaving: Boolean = false,
    val isSuccess: Boolean = false
)

class TestViewModel : ViewModel() {

    private val testRepo = AppContainer.testRepository

    private val _takingState = MutableStateFlow(TestTakingUiState())
    val takingState: StateFlow<TestTakingUiState> = _takingState.asStateFlow()

    private val _creationState = MutableStateFlow(TestCreationUiState())
    val creationState: StateFlow<TestCreationUiState> = _creationState.asStateFlow()

    private var timerJob: Job? = null

    fun loadTestForTaking(testId: String) {
        viewModelScope.launch {
            testRepo.getTestById(testId).collect { test ->
                _takingState.value = _takingState.value.copy(
                    test = test,
                    remainingSeconds = (test?.durationMinutes ?: 20) * 60
                )
            }
        }
        viewModelScope.launch {
            testRepo.getQuestionsForTest(testId).collect { questions ->
                _takingState.value = _takingState.value.copy(questions = questions)
            }
        }
        startTimer()
    }

    private fun startTimer() {
        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            while (_takingState.value.remainingSeconds > 0 && !_takingState.value.isSubmitted) {
                delay(1000)
                _takingState.value = _takingState.value.copy(
                    remainingSeconds = _takingState.value.remainingSeconds - 1
                )
            }
        }
    }

    fun selectOption(questionId: String, option: String, isMultiSelect: Boolean) {
        val currentAnswers = _takingState.value.userAnswers.toMutableMap()
        if (isMultiSelect) {
            val list = (currentAnswers[questionId] ?: emptyList()).toMutableList()
            if (list.contains(option)) list.remove(option) else list.add(option)
            currentAnswers[questionId] = list
        } else {
            currentAnswers[questionId] = listOf(option)
        }
        _takingState.value = _takingState.value.copy(userAnswers = currentAnswers)
    }

    fun setTextInputAnswer(questionId: String, text: String) {
        val currentAnswers = _takingState.value.userAnswers.toMutableMap()
        currentAnswers[questionId] = listOf(text)
        _takingState.value = _takingState.value.copy(userAnswers = currentAnswers)
    }

    fun nextQuestion() {
        if (_takingState.value.currentQuestionIndex < _takingState.value.questions.size - 1) {
            _takingState.value = _takingState.value.copy(
                currentQuestionIndex = _takingState.value.currentQuestionIndex + 1
            )
        }
    }

    fun previousQuestion() {
        if (_takingState.value.currentQuestionIndex > 0) {
            _takingState.value = _takingState.value.copy(
                currentQuestionIndex = _takingState.value.currentQuestionIndex - 1
            )
        }
    }

    fun submitTest(testId: String, onFinished: (TestAttempt) -> Unit) {
        timerJob?.cancel()
        viewModelScope.launch {
            _takingState.value = _takingState.value.copy(isSubmitting = true)
            val result = testRepo.submitTestAttempt(testId, _takingState.value.userAnswers)
            _takingState.value = _takingState.value.copy(
                isSubmitting = false,
                isSubmitted = true,
                attemptResult = result.getOrNull()
            )
            result.getOrNull()?.let { onFinished(it) }
        }
    }

    // Teacher Creation methods
    fun updateCreationTitle(v: String) { _creationState.value = _creationState.value.copy(title = v) }
    fun updateCreationDesc(v: String) { _creationState.value = _creationState.value.copy(description = v) }
    fun updateCreationDuration(v: Int) { _creationState.value = _creationState.value.copy(durationMinutes = v) }
    fun toggleShowScore(v: Boolean) { _creationState.value = _creationState.value.copy(showScoreImmediately = v) }
    fun toggleShuffle(v: Boolean) { _creationState.value = _creationState.value.copy(shuffleQuestions = v) }

    fun addQuestionToCreation(q: Question) {
        val updated = _creationState.value.questions + q
        _creationState.value = _creationState.value.copy(questions = updated)
    }

    fun saveTest(classroomId: String, publish: Boolean, onSaved: () -> Unit) {
        viewModelScope.launch {
            _creationState.value = _creationState.value.copy(isSaving = true)
            val newTest = Test(
                testId = "test_${System.currentTimeMillis()}",
                classroomId = classroomId,
                title = _creationState.value.title.ifBlank { "Operating Systems Quiz" },
                description = _creationState.value.description.ifBlank { "Unit assessment on synchronization & deadlock concepts." },
                durationMinutes = _creationState.value.durationMinutes,
                totalMarks = _creationState.value.questions.sumOf { it.marks }.coerceAtLeast(10),
                questionCount = _creationState.value.questions.size.coerceAtLeast(3),
                startAt = "Today, 10:00 AM",
                deadlineAt = _creationState.value.deadline,
                status = if (publish) TestStatus.PUBLISHED else TestStatus.DRAFT,
                createdBy = "Prof. Sharma",
                createdAt = "Just now"
            )
            val result = testRepo.createTest(newTest, _creationState.value.questions)
            result.onSuccess { created ->
                if (publish) testRepo.publishTest(created.testId)
                _creationState.value = _creationState.value.copy(isSaving = false, isSuccess = true)
                onSaved()
            }.onFailure {
                _creationState.value = _creationState.value.copy(isSaving = false)
            }
        }
    }

    fun getAnalytics(testId: String) = testRepo.getTestAnalytics(testId)
}
