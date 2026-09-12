package com.example

import android.os.Bundle
import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.content.ContextCompat
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.classai.app.core.ui.theme.ClassAiTheme
import com.classai.app.navigation.Screen
import com.classai.app.ui.auth.*
import com.classai.app.ui.main.MainScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1001)
        }
        enableEdgeToEdge()
        setContent {
            ClassAiTheme {
                ClassAiApp()
            }
        }
    }
}

@Composable
fun ClassAiApp() {
    val rootNavController = rememberNavController()
    val authViewModel: AuthViewModel = viewModel()

    NavHost(
        navController = rootNavController,
        startDestination = Screen.Splash.route,
        modifier = Modifier.fillMaxSize()
    ) {
        // Splash
        composable(Screen.Splash.route) {
            SplashScreen(
                onSplashFinished = {
                    rootNavController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        // Onboarding
        composable(Screen.Onboarding.route) {
            OnboardingScreen(
                onGetStarted = {
                    rootNavController.navigate(Screen.Login.route)
                },
                onLoginClick = {
                    rootNavController.navigate(Screen.Login.route)
                }
            )
        }

        // Login
        composable(Screen.Login.route) {
            LoginScreen(
                viewModel = authViewModel,
                onNavigateToForgotPassword = {
                    rootNavController.navigate(Screen.ForgotPassword.route)
                },
                onLoginSuccess = {
                    rootNavController.navigate(Screen.Main.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        // Register
        composable(Screen.Register.route) {
            RegisterScreen(
                viewModel = authViewModel,
                onNavigateBack = { rootNavController.popBackStack() },
                onRegisterSuccess = {
                    rootNavController.navigate(Screen.EmailVerification.route)
                }
            )
        }

        // Forgot Password
        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                viewModel = authViewModel,
                onNavigateBack = { rootNavController.popBackStack() }
            )
        }

        // Email Verification
        composable(Screen.EmailVerification.route) {
            EmailVerificationScreen(
                viewModel = authViewModel,
                onNavigateBack = {
                    rootNavController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Register.route) { inclusive = true }
                    }
                }
            )
        }

        // Main Navigation (Bottom Tabs & In-app Detail screens)
        composable(Screen.Main.route) {
            MainScreen(
                onLogout = {
                    authViewModel.logout {
                        rootNavController.navigate(Screen.Login.route) {
                            popUpTo(Screen.Main.route) { inclusive = true }
                        }
                    }
                }
            )
        }
    }
}
