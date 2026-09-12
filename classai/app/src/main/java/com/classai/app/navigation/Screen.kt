package com.classai.app.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.School
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String) {
    // Auth
    object Splash : Screen("splash")
    object Onboarding : Screen("onboarding")
    object Login : Screen("login")
    object Register : Screen("register")
    object ForgotPassword : Screen("forgot_password")
    object EmailVerification : Screen("email_verification")

    // Main Hubs
    object Main : Screen("main")

    // Sub-screens
    object ClassroomDetail : Screen("classroom_detail/{classroomId}") {
        fun createRoute(classroomId: String) = "classroom_detail/$classroomId"
    }

    object LectureDetail : Screen("lecture_detail/{lectureId}") {
        fun createRoute(lectureId: String) = "lecture_detail/$lectureId"
    }

    object Notebook : Screen("notebook/{classroomId}") {
        fun createRoute(classroomId: String) = "notebook/$classroomId"
    }

    object TakeTest : Screen("take_test/{testId}") {
        fun createRoute(testId: String) = "take_test/$testId"
    }

    object CreateTest : Screen("create_test/{classroomId}") {
        fun createRoute(classroomId: String) = "create_test/$classroomId"
    }

    object TestAnalytics : Screen("test_analytics/{testId}") {
        fun createRoute(testId: String) = "test_analytics/$testId"
    }

    object CatchUp : Screen("catch_up/{lectureId}") {
        fun createRoute(lectureId: String) = "catch_up/$lectureId"
    }

    object PdfViewer : Screen("pdf_viewer?title={title}&url={url}") {
        fun createRoute(title: String, url: String) =
            "pdf_viewer?title=${java.net.URLEncoder.encode(title, "UTF-8")}&url=${java.net.URLEncoder.encode(url, "UTF-8")}"
    }

    object Notifications : Screen("notifications")
}

sealed class BottomNavTab(
    val route: String,
    val title: String,
    val studentIcon: ImageVector,
    val teacherIcon: ImageVector
) {
    object Home : BottomNavTab(
        "tab_home",
        "Home",
        Icons.Filled.Home,
        Icons.Filled.Home
    )

    object Classrooms : BottomNavTab(
        "tab_classrooms",
        "Classes",
        Icons.Filled.School,
        Icons.Filled.School
    )

    object Tests : BottomNavTab(
        "tab_tests",
        "Tests",
        Icons.Filled.Assignment,
        Icons.Filled.Assignment
    )

    object Attendance : BottomNavTab(
        "tab_attendance",
        "Attendance",
        Icons.Filled.CheckCircle,
        Icons.Filled.People
    )

    object Profile : BottomNavTab(
        "tab_profile",
        "Profile",
        Icons.Filled.Person,
        Icons.Filled.Person
    )
}
