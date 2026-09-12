package com.classai.app.ui.lecture

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.classai.app.di.AppContainer
import com.classai.app.domain.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

data class LectureUiState(
    val lecture: Lecture? = null,
    val relatedTest: Test? = null,
    val resources: List<ResourceItem> = emptyList(),
    val isGeneratingQuiz: Boolean = false,
    val generatedDraft: QuizGenerationDraft? = null,
    val message: String? = null
)

class LectureViewModel : ViewModel() {

    private val lectureRepo = AppContainer.lectureRepository
    private val testRepo = AppContainer.testRepository
    private val resourceRepo = AppContainer.resourceRepository

    private val _uiState = MutableStateFlow(LectureUiState())
    val uiState: StateFlow<LectureUiState> = _uiState.asStateFlow()

    fun loadLecture(lectureId: String) {
        viewModelScope.launch {
            val lecture = lectureRepo.getLectureById(lectureId).first()
            _uiState.value = _uiState.value.copy(lecture = lecture)
            lecture?.let {
                val tests = testRepo.getClassroomTests(it.classroomId).first()
                val resources = resourceRepo.getResources(it.classroomId).first()
                _uiState.value = _uiState.value.copy(
                    relatedTest = tests.firstOrNull { test -> test.lectureId == it.lectureId },
                    resources = resources.filter { resource -> resource.lectureId == null || resource.lectureId == it.lectureId }
                )
            }
        }
    }

    fun generateAiQuiz(numQuestions: Int, difficulty: String, types: List<QuestionType>) {
        val lecture = _uiState.value.lecture ?: return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isGeneratingQuiz = true)
            val result = lectureRepo.generateAiQuiz(lecture.lectureId, numQuestions, difficulty, types)
            _uiState.value = _uiState.value.copy(
                isGeneratingQuiz = false,
                generatedDraft = result.getOrNull(),
                message = "AI Quiz Draft generated from lecture content!"
            )
        }
    }

    fun clearDraft() {
        _uiState.value = _uiState.value.copy(generatedDraft = null)
    }
}
