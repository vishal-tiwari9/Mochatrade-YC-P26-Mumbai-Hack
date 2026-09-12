package com.classai.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.classai.app.di.AppContainer
import com.classai.app.domain.model.User
import com.classai.app.domain.model.UserRole
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val currentUser: User? = null,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val successMessage: String? = null,
    val isVerificationSent: Boolean = false
)

class AuthViewModel : ViewModel() {

    private val authRepo = AppContainer.authRepository

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            authRepo.getCurrentUser().collect { user ->
                _uiState.value = _uiState.value.copy(currentUser = user)
            }
        }
    }

    fun login(email: String, pass: String, onSuccess: () -> Unit) {
        if (email.isBlank() || pass.isBlank()) {
            _uiState.value = _uiState.value.copy(errorMessage = "Please enter email and password.")
            return
        }
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = authRepo.login(email, pass)
            _uiState.value = _uiState.value.copy(isLoading = false)
            result.onSuccess {
                onSuccess()
            }.onFailure {
                _uiState.value = _uiState.value.copy(errorMessage = it.message ?: "Authentication failed")
            }
        }
    }

    fun register(
        name: String,
        email: String,
        pass: String,
        confirmPass: String,
        rollOrEmpId: String,
        role: UserRole,
        onSuccess: () -> Unit
    ) {
        if (name.isBlank() || email.isBlank() || pass.isBlank() || rollOrEmpId.isBlank()) {
            _uiState.value = _uiState.value.copy(errorMessage = "Please complete all fields.")
            return
        }
        if (pass != confirmPass) {
            _uiState.value = _uiState.value.copy(errorMessage = "Passwords do not match.")
            return
        }
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = authRepo.register(name, email, pass, rollOrEmpId, role)
            _uiState.value = _uiState.value.copy(isLoading = false)
            result.onSuccess {
                onSuccess()
            }.onFailure {
                _uiState.value = _uiState.value.copy(errorMessage = it.message ?: "Registration failed")
            }
        }
    }

    fun forgotPassword(email: String) {
        if (email.isBlank()) {
            _uiState.value = _uiState.value.copy(errorMessage = "Enter your email address.")
            return
        }
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = authRepo.forgotPassword(email)
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                successMessage = "Password reset instructions sent to $email"
            )
        }
    }

    fun sendEmailVerification() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            authRepo.sendEmailVerification()
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                isVerificationSent = true,
                successMessage = "Verification email sent!"
            )
        }
    }

    fun logout(onLoggedOut: () -> Unit) {
        viewModelScope.launch {
            authRepo.logout()
            onLoggedOut()
        }
    }

    fun switchRole(role: UserRole) {
        authRepo.switchUserRole(role)
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(errorMessage = null, successMessage = null)
    }
}
