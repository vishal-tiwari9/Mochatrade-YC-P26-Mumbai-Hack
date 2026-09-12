package com.classai.app.data.mock

import com.classai.app.core.utils.AttendanceCalculator
import com.classai.app.domain.model.*

object MockDataProvider {

    val teacherUser = User(
        id = "teacher_sharma",
        name = "Prof. Sharma",
        email = "sharma@university.edu",
        rollOrEmpId = "EMP-2041",
        role = UserRole.TEACHER
    )

    val studentUser = User(
        id = "student_dev",
        name = "Dev Kanojiya",
        email = "kanojiyadev54@gmail.com",
        rollOrEmpId = "CS-2021-042",
        role = UserRole.STUDENT
    )

    var currentUser: User = studentUser

    val classrooms = mutableListOf(
        Classroom(
            classroomId = "class_os_01",
            className = "Operating Systems",
            subjectName = "Operating Systems",
            subjectCode = "CS601",
            semester = "6",
            division = "A",
            teacherId = teacherUser.id,
            teacherName = teacherUser.name,
            joinCode = "OS7X92",
            createdAt = "2026-08-15",
            studentCount = 42
        ),
        Classroom(
            classroomId = "class_db_02",
            className = "Database Management Systems",
            subjectName = "DBMS",
            subjectCode = "CS602",
            semester = "6",
            division = "A",
            teacherId = teacherUser.id,
            teacherName = "Prof. Mehta",
            joinCode = "DB8Y41",
            createdAt = "2026-08-16",
            studentCount = 40
        ),
        Classroom(
            classroomId = "class_cn_03",
            className = "Computer Networks",
            subjectName = "Networks",
            subjectCode = "CS603",
            semester = "6",
            division = "A",
            teacherId = "teacher_verma",
            teacherName = "Prof. Verma",
            joinCode = "CN9Z15",
            createdAt = "2026-08-18",
            studentCount = 41
        )
    )

    var upcomingTopic = UpcomingTopic(
        topicId = "topic_deadlocks",
        classroomId = "class_os_01",
        topic = "Deadlocks",
        lectureDate = "Tomorrow • 10:00 AM",
        description = "Deadlock detection and prevention. Resource allocation graphs and Banker's algorithm.",
        teacherId = teacherUser.id
    )

    val lectures = mutableListOf(
        Lecture(
            lectureId = "lec_01",
            classroomId = "class_os_01",
            title = "Processes & Thread Management",
            topic = "Processes",
            teacherId = teacherUser.id,
            lectureDate = "08 Sep",
            status = LectureStatus.PUBLISHED,
            summary = "Fundamental process lifecycle: New, Ready, Running, Waiting, Terminated. Explored Process Control Block (PCB), context switching overhead, fork() system call mechanics, and multithreading models.",
            transcriptAvailable = true,
            pdfAvailable = true,
            pdfUrl = "https://example.com/classai/pdfs/processes_lecture_notes.pdf",
            createdAt = "2026-09-08",
            publishedAt = "2026-09-08",
            studentAttendance = AttendanceStatus.PRESENT
        ),
        Lecture(
            lectureId = "lec_02",
            classroomId = "class_os_01",
            title = "CPU Scheduling Algorithms",
            topic = "CPU Scheduling",
            teacherId = teacherUser.id,
            lectureDate = "11 Sep",
            status = LectureStatus.PUBLISHED,
            summary = "Comparative analysis of preemptive and non-preemptive schedulers. Covered First-Come First-Served (FCFS), Shortest Job First (SJF), Priority Scheduling, and Round Robin (RR) with time quantum tuning.",
            transcriptAvailable = true,
            pdfAvailable = true,
            pdfUrl = "https://example.com/classai/pdfs/cpu_scheduling_complete.pdf",
            createdAt = "2026-09-11",
            publishedAt = "2026-09-11",
            studentAttendance = AttendanceStatus.ABSENT // Dev was absent!
        ),
        Lecture(
            lectureId = "lec_03",
            classroomId = "class_os_01",
            title = "Deadlocks & Resource Allocation",
            topic = "Deadlocks",
            teacherId = teacherUser.id,
            lectureDate = "14 Sep",
            status = LectureStatus.PUBLISHED,
            summary = "Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. Safe states, Banker's algorithm matrices (Allocation, Max, Available, Need), and recovery strategies.",
            transcriptAvailable = true,
            pdfAvailable = true,
            pdfUrl = "https://example.com/classai/pdfs/deadlocks_notes.pdf",
            createdAt = "2026-09-14",
            publishedAt = "2026-09-14",
            studentAttendance = AttendanceStatus.PRESENT
        )
    )

    val notebookEntries = mutableListOf(
        NotebookEntry(
            lectureId = "lec_03",
            date = "14 Sep",
            title = "Deadlocks",
            topic = "Deadlock detection and prevention",
            attendance = AttendanceStatus.PRESENT,
            hasPdf = true,
            hasSummary = true,
            hasCatchUp = false
        ),
        NotebookEntry(
            lectureId = "lec_02",
            date = "11 Sep",
            title = "CPU Scheduling",
            topic = "Preemptive and non-preemptive schedulers",
            attendance = AttendanceStatus.ABSENT,
            hasPdf = true,
            hasSummary = true,
            hasCatchUp = true
        ),
        NotebookEntry(
            lectureId = "lec_01",
            date = "08 Sep",
            title = "Processes",
            topic = "Process states, PCB and context switching",
            attendance = AttendanceStatus.PRESENT,
            hasPdf = true,
            hasSummary = true,
            hasCatchUp = false
        )
    )

    val tests = mutableListOf(
        Test(
            testId = "test_unit3_quiz",
            classroomId = "class_os_01",
            lectureId = "lec_02",
            title = "Unit 3 Quiz",
            description = "Evaluation covering CPU Scheduling and Process Synchronization fundamentals.",
            totalMarks = 20,
            durationMinutes = 20,
            startAt = "Today • 09:00 AM",
            deadlineAt = "Today • 8:00 PM",
            status = TestStatus.PUBLISHED,
            showScoreImmediately = true,
            shuffleQuestions = false,
            oneAttemptOnly = true,
            createdBy = teacherUser.name,
            createdAt = "2026-09-11",
            questionCount = 10,
            isAttempted = false
        ),
        Test(
            testId = "test_catchup_cpu",
            classroomId = "class_os_01",
            lectureId = "lec_02",
            title = "CPU Scheduling Catch-Up Quiz",
            description = "Quick 5-question mastery checkpoint for missed Lecture 11.",
            totalMarks = 10,
            durationMinutes = 10,
            startAt = "2026-09-11",
            deadlineAt = "2026-09-20",
            status = TestStatus.PUBLISHED,
            showScoreImmediately = true,
            shuffleQuestions = false,
            oneAttemptOnly = false,
            createdBy = teacherUser.name,
            createdAt = "2026-09-11",
            questionCount = 5,
            isAttempted = false
        )
    )

    val questionsMap = mutableMapOf<String, List<Question>>(
        "test_unit3_quiz" to listOf(
            Question(
                questionId = "q1",
                testId = "test_unit3_quiz",
                type = QuestionType.MCQ,
                questionText = "Which of the following is NOT one of Coffman's four conditions for deadlock?",
                options = listOf("Mutual Exclusion", "Hold and Wait", "Preemption Allowed", "Circular Wait"),
                correctAnswers = listOf("Preemption Allowed"),
                marks = 2,
                order = 1
            ),
            Question(
                questionId = "q2",
                testId = "test_unit3_quiz",
                type = QuestionType.MCQ,
                questionText = "Which CPU scheduling algorithm is non-preemptive by definition?",
                options = listOf("Round Robin", "First-Come First-Served (FCFS)", "Shortest Remaining Time First", "Multilevel Feedback Queue"),
                correctAnswers = listOf("First-Come First-Served (FCFS)"),
                marks = 2,
                order = 2
            ),
            Question(
                questionId = "q3",
                testId = "test_unit3_quiz",
                type = QuestionType.TRUE_FALSE,
                questionText = "In a system with single resource instances of each type, a cycle in the Resource Allocation Graph is both necessary and sufficient for deadlock.",
                options = listOf("True", "False"),
                correctAnswers = listOf("True"),
                marks = 2,
                order = 3
            ),
            Question(
                questionId = "q4",
                testId = "test_unit3_quiz",
                type = QuestionType.MCQ,
                questionText = "What core data structure is used by the operating system kernel to maintain all state info about an active process?",
                options = listOf("Thread Control Block", "Process Control Block (PCB)", "Page Directory", "Inode Entry"),
                correctAnswers = listOf("Process Control Block (PCB)"),
                marks = 2,
                order = 4
            ),
            Question(
                questionId = "q5",
                testId = "test_unit3_quiz",
                type = QuestionType.MULTI_SELECT,
                questionText = "Select all algorithms specifically designed for deadlock avoidance:",
                options = listOf("Banker's Algorithm", "Resource-Allocation Graph Algorithm", "Round Robin Scheduling", "First-Fit Memory Allocation"),
                correctAnswers = listOf("Banker's Algorithm", "Resource-Allocation Graph Algorithm"),
                marks = 2,
                order = 5
            ),
            Question(
                questionId = "q6",
                testId = "test_unit3_quiz",
                type = QuestionType.MCQ,
                questionText = "What is the primary action performed during an OS context switch?",
                options = listOf("Clearing all cache lines", "Saving current process state and loading next process state", "Resetting physical RAM registers", "Disabling interrupt vectors permanently"),
                correctAnswers = listOf("Saving current process state and loading next process state"),
                marks = 2,
                order = 6
            ),
            Question(
                questionId = "q7",
                testId = "test_unit3_quiz",
                type = QuestionType.TRUE_FALSE,
                questionText = "Round Robin scheduling with an excessively large time quantum degrades into First-Come First-Served (FCFS).",
                options = listOf("True", "False"),
                correctAnswers = listOf("True"),
                marks = 2,
                order = 7
            ),
            Question(
                questionId = "q8",
                testId = "test_unit3_quiz",
                type = QuestionType.SHORT_ANSWER,
                questionText = "Name the CPU scheduling algorithm that gives each process a fixed slice of time called a quantum.",
                options = emptyList(),
                correctAnswers = listOf("Round Robin", "RR"),
                marks = 2,
                order = 8
            ),
            Question(
                questionId = "q9",
                testId = "test_unit3_quiz",
                type = QuestionType.MCQ,
                questionText = "In Banker's Algorithm, if the system can allocate resources to all processes in at least one sequence without deadlock, the state is:",
                options = listOf("Safe state", "Unsafe state", "Deadlocked state", "Starved state"),
                correctAnswers = listOf("Safe state"),
                marks = 2,
                order = 9
            ),
            Question(
                questionId = "q10",
                testId = "test_unit3_quiz",
                type = QuestionType.LONG_ANSWER,
                questionText = "Explain the fundamental difference between turnaround time and waiting time in CPU scheduling evaluation.",
                options = emptyList(),
                correctAnswers = emptyList(),
                marks = 2,
                order = 10
            )
        )
    )

    val resources = mutableListOf(
        ResourceItem(
            resourceId = "res_01",
            classroomId = "class_os_01",
            lectureId = "lec_03",
            title = "AI Note: Deadlock Coffman Conditions Summary",
            description = "Synthesized overview of deadlock conditions and Banker's safety state matrix.",
            resourceType = ResourceType.LECTURE_PDF,
            fileUrl = "https://example.com/classai/pdfs/deadlock_summary.pdf",
            uploadedBy = "ClassAI Engine",
            createdAt = "2026-09-14"
        ),
        ResourceItem(
            resourceId = "res_02",
            classroomId = "class_os_01",
            lectureId = "lec_02",
            title = "AI Note: CPU Scheduling Algorithms Cheat Sheet",
            description = "Gantt chart comparison of FCFS, SJF, and Round Robin metrics.",
            resourceType = ResourceType.LECTURE_PDF,
            fileUrl = "https://example.com/classai/pdfs/scheduling_cheatsheet.pdf",
            uploadedBy = "ClassAI Engine",
            createdAt = "2026-09-11"
        ),
        ResourceItem(
            resourceId = "res_03",
            classroomId = "class_os_01",
            lectureId = null,
            title = "Prof. Sharma Lecture Slides - Unit 3 (PDF)",
            description = "Official classroom slides with annotated diagrams and exercises.",
            resourceType = ResourceType.PDF,
            fileUrl = "https://example.com/classai/files/unit3_slides.pdf",
            uploadedBy = teacherUser.name,
            createdAt = "2026-09-10"
        ),
        ResourceItem(
            resourceId = "res_04",
            classroomId = "class_os_01",
            lectureId = null,
            title = "Operating Systems Concepts Reference Handbook",
            description = "Silberschatz companion reading notes and formula guide.",
            resourceType = ResourceType.DOCUMENT,
            fileUrl = "https://example.com/classai/files/os_handbook.docx",
            uploadedBy = teacherUser.name,
            createdAt = "2026-08-28"
        ),
        ResourceItem(
            resourceId = "res_05",
            classroomId = "class_os_01",
            lectureId = null,
            title = "Silberschatz OS Official Companion Portal",
            description = "Online simulations for memory paging and scheduling visualization.",
            resourceType = ResourceType.LINK,
            fileUrl = "https://codex.cs.yale.edu/avi/os-book/",
            uploadedBy = teacherUser.name,
            createdAt = "2026-08-20"
        )
    )

    val notifications = mutableListOf(
        NotificationItem(
            id = "notif_01",
            type = NotificationType.LECTURE_NOTES_PUBLISHED,
            title = "New Lecture Notes",
            message = "Deadlocks notes are now available.",
            timestamp = "10m ago",
            classroomId = "class_os_01",
            relatedId = "lec_03"
        ),
        NotificationItem(
            id = "notif_02",
            type = NotificationType.ABSENT_CATCHUP_READY,
            title = "Catch Up",
            message = "You missed CPU Scheduling lecture. Catch-up material is ready.",
            timestamp = "2h ago",
            classroomId = "class_os_01",
            relatedId = "lec_02"
        ),
        NotificationItem(
            id = "notif_03",
            type = NotificationType.TEST_PUBLISHED,
            title = "New Test",
            message = "Unit 3 Quiz is available. Due Today at 8:00 PM.",
            timestamp = "4h ago",
            classroomId = "class_os_01",
            relatedId = "test_unit3_quiz"
        ),
        NotificationItem(
            id = "notif_04",
            type = NotificationType.UPCOMING_TOPIC,
            title = "Upcoming Topic",
            message = "Operating Systems: Deadlocks scheduled for tomorrow at 10:00 AM.",
            timestamp = "Yesterday",
            classroomId = "class_os_01"
        ),
        NotificationItem(
            id = "notif_05",
            type = NotificationType.RESOURCE_UPLOADED,
            title = "Resource Uploaded",
            message = "Prof. Sharma uploaded Unit 3 Lecture Slides.",
            timestamp = "2d ago",
            classroomId = "class_os_01"
        )
    )

    // Demo student list for taking attendance
    val classroomStudents = mutableListOf(
        AttendanceRecord("rec_01", "sess_demo", "class_os_01", "student_dev", "Dev Kanojiya", "CS-2021-042", AttendanceStatus.PRESENT),
        AttendanceRecord("rec_02", "sess_demo", "class_os_01", "student_02", "Aarav Gupta", "CS-2021-001", AttendanceStatus.PRESENT),
        AttendanceRecord("rec_03", "sess_demo", "class_os_01", "student_03", "Ananya Singh", "CS-2021-005", AttendanceStatus.PRESENT),
        AttendanceRecord("rec_04", "sess_demo", "class_os_01", "student_04", "Priya Mehta", "CS-2021-018", AttendanceStatus.ABSENT),
        AttendanceRecord("rec_05", "sess_demo", "class_os_01", "student_05", "Rahul Verma", "CS-2021-023", AttendanceStatus.PRESENT),
        AttendanceRecord("rec_06", "sess_demo", "class_os_01", "student_06", "Rohan Patel", "CS-2021-027", AttendanceStatus.PRESENT),
        AttendanceRecord("rec_07", "sess_demo", "class_os_01", "student_07", "Sneha Iyer", "CS-2021-035", AttendanceStatus.PRESENT),
        AttendanceRecord("rec_08", "sess_demo", "class_os_01", "student_08", "Vikram Rathore", "CS-2021-049", AttendanceStatus.ABSENT)
    )

    fun getStudentAttendanceOverview(): StudentAttendanceOverview {
        // Dev Kanojiya demo: 28 Present, 6 Absent, 34 Total
        val intel = AttendanceCalculator.calculate(presentCount = 28, absentCount = 6, thresholdPercent = 75.0)

        val subjectCards = listOf(
            SubjectAttendance("Operating Systems", "CS601", 28, 6, intel.percentage, intel.isShortage, intel.safeMisses, intel.requiredConsecutive),
            SubjectAttendance("Database Systems", "CS602", 30, 4, 88.2, false, 6, 0),
            SubjectAttendance("Computer Networks", "CS603", 22, 10, 68.75, true, 0, 8)
        )

        return StudentAttendanceOverview(
            overallPercentage = intel.percentage,
            presentCount = intel.presentCount,
            absentCount = intel.absentCount,
            totalLectures = intel.totalLectures,
            requiredThreshold = intel.requiredThreshold,
            isShortage = intel.isShortage,
            safeMisses = intel.safeMisses,
            requiredConsecutive = intel.requiredConsecutive,
            statusMessage = intel.statusMessage,
            subjects = subjectCards,
            history = listOf(
                StudentAttendanceHistoryItem("Deadlocks: Resource Allocation Graphs", "14 Sep", AttendanceStatus.PRESENT),
                StudentAttendanceHistoryItem("CPU Scheduling: SJF & Round Robin", "11 Sep", AttendanceStatus.ABSENT),
                StudentAttendanceHistoryItem("Processes & Threads Architecture", "08 Sep", AttendanceStatus.PRESENT),
                StudentAttendanceHistoryItem("Interprocess Communication & Pipes", "04 Sep", AttendanceStatus.PRESENT),
                StudentAttendanceHistoryItem("Critical Section & Semaphores", "01 Sep", AttendanceStatus.PRESENT)
            )
        )
    }

    fun getTeacherAttendanceAnalytics(): TeacherAttendanceAnalytics {
        val studentSummaries = listOf(
            StudentAttendanceRecordSummary("student_dev", "Dev Kanojiya", "CS-2021-042", 28, 34, 82.4, false),
            StudentAttendanceRecordSummary("student_02", "Aarav Gupta", "CS-2021-001", 33, 34, 97.0, false),
            StudentAttendanceRecordSummary("student_03", "Ananya Singh", "CS-2021-005", 31, 34, 91.2, false),
            StudentAttendanceRecordSummary("student_07", "Sneha Iyer", "CS-2021-035", 27, 34, 79.4, false),
            StudentAttendanceRecordSummary("student_05", "Rahul Verma", "CS-2021-023", 24, 34, 70.6, false), // Below 75%
            StudentAttendanceRecordSummary("student_04", "Priya Mehta", "CS-2021-018", 23, 34, 67.6, false), // Below 75%
            StudentAttendanceRecordSummary("student_08", "Vikram Rathore", "CS-2021-049", 20, 34, 58.8, true), // Critical <60%
            StudentAttendanceRecordSummary("student_09", "Ankit Singh", "CS-2021-011", 18, 34, 52.9, true) // Critical <60%
        )

        return TeacherAttendanceAnalytics(
            classroomId = "class_os_01",
            className = "Operating Systems",
            classAverage = 78.4,
            totalStudents = 42,
            below75Count = 4,
            below60Count = 2,
            students = studentSummaries
        )
    }

    fun getTeacherTestAnalytics(testId: String): TeacherTestAnalytics {
        return TeacherTestAnalytics(
            testId = testId,
            title = "Unit 3 Quiz",
            totalStudents = 42,
            submittedCount = 38,
            pendingCount = 4,
            averageScore = 15.6,
            highestScore = 20,
            lowestScore = 8,
            questionAnalysis = listOf(
                QuestionStat("q1", 1, "Coffman conditions", 91, false),
                QuestionStat("q2", 2, "FCFS non-preemption", 76, false),
                QuestionStat("q3", 3, "Cycle in RAG", 39, true), // Needs attention!
                QuestionStat("q4", 4, "Process Control Block (PCB)", 82, false),
                QuestionStat("q5", 5, "Deadlock avoidance algorithms", 68, false),
                QuestionStat("q6", 6, "Context switch mechanics", 85, false),
                QuestionStat("q7", 7, "Round Robin quantum limit", 79, false),
                QuestionStat("q8", 8, "Round Robin naming", 88, false),
                QuestionStat("q9", 9, "Safe state in Banker's algorithm", 71, false),
                QuestionStat("q10", 10, "Turnaround vs Waiting time", 64, false)
            ),
            responses = listOf(
                StudentTestResponseSummary("student_dev", "Dev Kanojiya", 16, 20, "Today • 11:20 AM", AttemptStatus.GRADED),
                StudentTestResponseSummary("student_02", "Aarav Gupta", 20, 20, "Today • 10:15 AM", AttemptStatus.GRADED),
                StudentTestResponseSummary("student_03", "Ananya Singh", 18, 20, "Today • 10:45 AM", AttemptStatus.GRADED),
                StudentTestResponseSummary("student_04", "Priya Mehta", 12, 20, "Today • 11:40 AM", AttemptStatus.GRADED),
                StudentTestResponseSummary("student_05", "Rahul Verma", 14, 20, "Today • 12:05 PM", AttemptStatus.GRADED)
            )
        )
    }
}
