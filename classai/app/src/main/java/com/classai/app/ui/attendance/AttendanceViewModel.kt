package com.classai.app.ui.attendance

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.classai.app.di.AppContainer
import com.classai.app.domain.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.launch

data class AttendanceUiState(
    val studentOverview: StudentAttendanceOverview? = null,
    val teacherAnalytics: TeacherAttendanceAnalytics? = null,
    val studentRecords: List<AttendanceRecord> = emptyList(),
    val isSubmitting: Boolean = false,
    val submissionSuccess: Boolean = false,
    val message: String? = null
)

class AttendanceViewModel : ViewModel() {

    private val attendanceRepo = AppContainer.attendanceRepository

    private val _uiState = MutableStateFlow(AttendanceUiState())
    val uiState: StateFlow<AttendanceUiState> = _uiState.asStateFlow()
    private var activeClassroomId: String? = null

    init {
        viewModelScope.launch {
            val classroomId = AppContainer.classroomRepository.getClassrooms().first().firstOrNull()?.classroomId
            if (classroomId != null) loadData(classroomId)
        }
    }

    fun loadData(classroomId: String) {
        activeClassroomId = classroomId
        viewModelScope.launch {
            val user = AppContainer.authRepository.getCurrentUser().filterNotNull().first()
            if (user.role == UserRole.STUDENT) {
                attendanceRepo.getStudentAttendanceOverview(user.id).collect { ov ->
                    _uiState.value = _uiState.value.copy(studentOverview = ov)
                }
            } else {
                attendanceRepo.getTeacherAttendanceAnalytics(classroomId).collect { an ->
                    _uiState.value = _uiState.value.copy(teacherAnalytics = an)
                }
                attendanceRepo.getClassroomStudentsForAttendance(classroomId).collect { recs ->
                    _uiState.value = _uiState.value.copy(studentRecords = recs)
                }
            }
        }
    }

    fun toggleStudentAttendance(studentId: String) {
        val updated = _uiState.value.studentRecords.map { rec ->
            if (rec.studentId == studentId) {
                val nextStatus = if (rec.status == AttendanceStatus.PRESENT) AttendanceStatus.ABSENT else AttendanceStatus.PRESENT
                rec.copy(status = nextStatus)
            } else rec
        }
        _uiState.value = _uiState.value.copy(studentRecords = updated)
    }

    fun markAllPresent() {
        val updated = _uiState.value.studentRecords.map { it.copy(status = AttendanceStatus.PRESENT) }
        _uiState.value = _uiState.value.copy(studentRecords = updated)
    }

    fun submitAttendance(onSubmitted: () -> Unit) {
        val classroomId = activeClassroomId ?: return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSubmitting = true)
            val result = attendanceRepo.submitAttendance("sess_today", classroomId, _uiState.value.studentRecords)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(isSubmitting = false, submissionSuccess = true, message = "Attendance saved successfully!")
                onSubmitted()
            }.onFailure {
                _uiState.value = _uiState.value.copy(isSubmitting = false, message = it.message ?: "Could not save attendance.")
            }
        }
    }
}
