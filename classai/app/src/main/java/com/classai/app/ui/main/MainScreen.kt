package com.classai.app.ui.main

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.*
import com.classai.app.di.AppContainer
import com.classai.app.navigation.BottomNavTab
import com.classai.app.navigation.Screen
import com.classai.app.ui.attendance.AttendanceScreen
import com.classai.app.ui.attendance.AttendanceViewModel
import com.classai.app.ui.classroom.ClassroomDetailScreen
import com.classai.app.ui.classroom.ClassroomListScreen
import com.classai.app.ui.classroom.ClassroomViewModel
import com.classai.app.ui.home.StudentHomeScreen
import com.classai.app.ui.lecture.CatchUpScreen
import com.classai.app.ui.lecture.LectureDetailScreen
import com.classai.app.ui.lecture.LectureViewModel
import com.classai.app.ui.notifications.NotificationScreen
import com.classai.app.ui.pdf.PdfViewerScreen
import com.classai.app.ui.profile.ProfileScreen
import com.classai.app.ui.test.*

@Composable
fun MainScreen(
    onLogout: () -> Unit
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val userFlow = AppContainer.authRepository.getCurrentUser().collectAsState(initial = null)
    val currentUser = userFlow.value
    if (currentUser == null) {
        Box(Modifier.fillMaxSize().wrapContentSize()) { CircularProgressIndicator() }
        return
    }
    val tabs = listOf(
        BottomNavTab.Home,
        BottomNavTab.Classrooms,
        BottomNavTab.Tests,
        BottomNavTab.Attendance,
        BottomNavTab.Profile
    )

    val showBottomBar = tabs.any { it.route == currentRoute }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    tonalElevation = 8.dp,
                    modifier = Modifier.testTag("bottom_navigation_bar")
                ) {
                    tabs.forEach { tab ->
                        val selected = currentRoute == tab.route
                        NavigationBarItem(
                            icon = {
                                Icon(
                                    imageVector = tab.studentIcon,
                                    contentDescription = tab.title
                                )
                            },
                            label = { Text(tab.title) },
                            selected = selected,
                            onClick = {
                                if (currentRoute != tab.route) {
                                    navController.navigate(tab.route) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = BottomNavTab.Home.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Tab 1: Home
            composable(BottomNavTab.Home.route) {
                StudentHomeScreen(
                    onNavigateToClassroom = { navController.navigate(Screen.ClassroomDetail.createRoute(it)) },
                    onNavigateToLecture = { navController.navigate(Screen.LectureDetail.createRoute(it)) },
                    onNavigateToTest = { navController.navigate(Screen.TakeTest.createRoute(it)) },
                    onNavigateToCatchUp = { navController.navigate(Screen.CatchUp.createRoute(it)) },
                    onNavigateToNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateToAttendance = { navController.navigate(BottomNavTab.Attendance.route) }
                )
            }

            // Tab 2: Classrooms
            composable(BottomNavTab.Classrooms.route) {
                ClassroomListScreen(
                    onNavigateToDetail = { navController.navigate(Screen.ClassroomDetail.createRoute(it)) },
                    onNavigateToCreateClass = { }
                )
            }

            // Tab 3: Tests
            composable(BottomNavTab.Tests.route) {
                TestListScreen(
                    onNavigateToTakeTest = { navController.navigate(Screen.TakeTest.createRoute(it)) },
                    onNavigateToCreateTest = { },
                    onNavigateToAnalytics = { }
                )
            }

            // Tab 4: Attendance
            composable(BottomNavTab.Attendance.route) {
                val attendanceViewModel: AttendanceViewModel = viewModel()
                AttendanceScreen(
                    viewModel = attendanceViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToCatchUp = { navController.navigate(Screen.CatchUp.createRoute(it)) }
                )
            }

            // Tab 5: Profile
            composable(BottomNavTab.Profile.route) {
                ProfileScreen(
                    onLogout = onLogout
                )
            }

            // Sub-screen: Classroom Detail
            composable(Screen.ClassroomDetail.route) { backStackEntry ->
                val classroomId = backStackEntry.arguments?.getString("classroomId") ?: return@composable
                val classroomViewModel: ClassroomViewModel = viewModel()
                ClassroomDetailScreen(
                    classroomId = classroomId,
                    viewModel = classroomViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToLecture = { navController.navigate(Screen.LectureDetail.createRoute(it)) },
                    onNavigateToCatchUp = { navController.navigate(Screen.CatchUp.createRoute(it)) },
                    onNavigateToTakeTest = { navController.navigate(Screen.TakeTest.createRoute(it)) },
                    onNavigateToCreateTest = { },
                    onNavigateToAttendance = { navController.navigate(BottomNavTab.Attendance.route) },
                    onNavigateToPdf = { title, url -> navController.navigate(Screen.PdfViewer.createRoute(title, url)) }
                )
            }

            // Sub-screen: Lecture Detail
            composable(Screen.LectureDetail.route) { backStackEntry ->
                val lectureId = backStackEntry.arguments?.getString("lectureId") ?: return@composable
                val lectureViewModel: LectureViewModel = viewModel()
                LectureDetailScreen(
                    lectureId = lectureId,
                    viewModel = lectureViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToPdf = { title, url -> navController.navigate(Screen.PdfViewer.createRoute(title, url)) },
                    onNavigateToTakeTest = { navController.navigate(Screen.TakeTest.createRoute(it)) },
                    onNavigateToCatchUp = { navController.navigate(Screen.CatchUp.createRoute(it)) }
                )
            }

            // Sub-screen: Catch-Up Hub
            composable(Screen.CatchUp.route) { backStackEntry ->
                val lectureId = backStackEntry.arguments?.getString("lectureId") ?: return@composable
                val lectureViewModel: LectureViewModel = viewModel()
                CatchUpScreen(
                    lectureId = lectureId,
                    viewModel = lectureViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToPdf = { title, url -> navController.navigate(Screen.PdfViewer.createRoute(title, url)) },
                    onNavigateToTakeTest = { navController.navigate(Screen.TakeTest.createRoute(it)) }
                )
            }

            // Sub-screen: Take Test
            composable(Screen.TakeTest.route) { backStackEntry ->
                val testId = backStackEntry.arguments?.getString("testId") ?: return@composable
                val testViewModel: TestViewModel = viewModel()
                TakeTestScreen(
                    testId = testId,
                    viewModel = testViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // Sub-screen: PDF Viewer
            composable(Screen.PdfViewer.route) { backStackEntry ->
                val title = backStackEntry.arguments?.getString("title") ?: "Lecture Notes"
                val url = backStackEntry.arguments?.getString("url") ?: return@composable
                PdfViewerScreen(
                    title = java.net.URLDecoder.decode(title, "UTF-8"),
                    url = java.net.URLDecoder.decode(url, "UTF-8"),
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // Sub-screen: Notifications
            composable(Screen.Notifications.route) {
                NotificationScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }
        }
    }
}
