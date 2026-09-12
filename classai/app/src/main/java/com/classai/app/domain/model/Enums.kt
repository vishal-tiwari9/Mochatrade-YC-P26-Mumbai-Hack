package com.classai.app.domain.model

enum class UserRole {
    TEACHER,
    STUDENT
}

enum class AttendanceStatus {
    PRESENT,
    ABSENT
}

enum class LectureStatus {
    DRAFT,
    PROCESSING,
    READY_FOR_REVIEW,
    PUBLISHED,
    FAILED
}

enum class TestStatus {
    DRAFT,
    PUBLISHED,
    CLOSED
}

enum class QuestionType {
    MCQ,
    MULTI_SELECT,
    TRUE_FALSE,
    SHORT_ANSWER,
    LONG_ANSWER
}

enum class AttemptStatus {
    IN_PROGRESS,
    SUBMITTED,
    GRADED
}

enum class ResourceType {
    PDF,
    IMAGE,
    DOCUMENT,
    LINK,
    LECTURE_PDF
}

enum class NotificationType {
    LECTURE_NOTES_PUBLISHED,
    TEST_PUBLISHED,
    TEST_DEADLINE,
    UPCOMING_TOPIC,
    ABSENT_CATCHUP_READY,
    RESOURCE_UPLOADED
}
