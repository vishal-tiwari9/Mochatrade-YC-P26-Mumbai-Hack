package com.classai.app.ui.classroom

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.classai.app.di.AppContainer
import com.classai.app.domain.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ClassroomDetailUiState(
    val classroom: Classroom? = null,
    val upcomingTopic: UpcomingTopic? = null,
    val lectures: List<Lecture> = emptyList(),
    val notebookEntries: List<NotebookEntry> = emptyList(),
    val tests: List<Test> = emptyList(),
    val members: List<User> = emptyList(),
    val resources: List<ResourceItem> = emptyList(),
    val isLoading: Boolean = false,
    val newlyCreatedJoinCode: String? = null,
    val message: String? = null
)

class ClassroomViewModel : ViewModel() {

    private val classroomRepo = AppContainer.classroomRepository
    private val lectureRepo = AppContainer.lectureRepository
    private val testRepo = AppContainer.testRepository
    private val resourceRepo = AppContainer.resourceRepository

    private val _uiState = MutableStateFlow(ClassroomDetailUiState())
    val uiState: StateFlow<ClassroomDetailUiState> = _uiState.asStateFlow()

    fun loadClassroom(classroomId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            launch {
                classroomRepo.getClassroomById(classroomId).collect { cls ->
                    _uiState.value = _uiState.value.copy(classroom = cls)
                }
            }

            launch {
                classroomRepo.getUpcomingTopic(classroomId).collect { topic ->
                    _uiState.value = _uiState.value.copy(upcomingTopic = topic)
                }
            }

            launch {
                lectureRepo.getLectures(classroomId).collect { lecs ->
                    _uiState.value = _uiState.value.copy(lectures = lecs)
                }
            }

            launch {
                lectureRepo.getNotebookEntries(classroomId).collect { nb ->
                    _uiState.value = _uiState.value.copy(notebookEntries = nb)
                }
            }

            launch {
                testRepo.getClassroomTests(classroomId).collect { tsts ->
                    _uiState.value = _uiState.value.copy(tests = tsts)
                }
            }

            launch {
                classroomRepo.getClassroomMembers(classroomId).collect { mbrs ->
                    _uiState.value = _uiState.value.copy(members = mbrs)
                }
            }

            launch {
                resourceRepo.getResources(classroomId).collect { res ->
                    _uiState.value = _uiState.value.copy(resources = res, isLoading = false)
                }
            }
        }
    }

    fun createClassroom(
        name: String,
        subject: String,
        code: String,
        semester: String,
        division: String,
        onCreated: (String) -> Unit
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val result = classroomRepo.createClassroom(name, subject, code, semester, division)
            _uiState.value = _uiState.value.copy(isLoading = false)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(
                    newlyCreatedJoinCode = it.joinCode,
                    message = "Class created successfully!"
                )
                onCreated(it.joinCode)
            }
        }
    }

    fun joinClassroom(code: String, onJoined: (Classroom) -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val result = classroomRepo.joinClassroom(code)
            _uiState.value = _uiState.value.copy(isLoading = false)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(message = "Joined ${it.className}!")
                onJoined(it)
            }
        }
    }

    fun setUpcomingTopic(classroomId: String, topic: String, date: String, description: String) {
        viewModelScope.launch {
            classroomRepo.setUpcomingTopic(classroomId, topic, date, description)
            _uiState.value = _uiState.value.copy(message = "Upcoming topic updated!")
        }
    }

    fun clearNewJoinCode() {
        _uiState.value = _uiState.value.copy(newlyCreatedJoinCode = null)
    }
}
