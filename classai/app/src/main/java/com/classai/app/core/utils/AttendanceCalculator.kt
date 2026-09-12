package com.classai.app.core.utils

import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.max

data class AttendanceIntelligence(
    val presentCount: Int,
    val absentCount: Int,
    val totalLectures: Int,
    val percentage: Double,
    val requiredThreshold: Double = 75.0,
    val isShortage: Boolean,
    val safeMisses: Int,
    val requiredConsecutive: Int,
    val statusMessage: String
)

object AttendanceCalculator {

    const val DEFAULT_THRESHOLD = 75.0

    fun calculate(
        presentCount: Int,
        absentCount: Int,
        thresholdPercent: Double = DEFAULT_THRESHOLD
    ): AttendanceIntelligence {
        val total = presentCount + absentCount
        if (total == 0) {
            return AttendanceIntelligence(
                presentCount = 0,
                absentCount = 0,
                totalLectures = 0,
                percentage = 100.0,
                requiredThreshold = thresholdPercent,
                isShortage = false,
                safeMisses = 0,
                requiredConsecutive = 0,
                statusMessage = "No lectures recorded yet."
            )
        }

        val percentage = (presentCount.toDouble() / total.toDouble()) * 100.0
        val thresholdRatio = thresholdPercent / 100.0
        val isShortage = percentage < thresholdPercent

        val safeMisses = if (!isShortage) {
            // present / (total + m) >= thresholdRatio
            // m <= (present / thresholdRatio) - total
            val maxM = floor((presentCount / thresholdRatio) - total).toInt()
            max(0, maxM)
        } else {
            0
        }

        val requiredConsecutive = if (isShortage) {
            // (present + k) / (total + k) >= thresholdRatio
            // k * (1 - thresholdRatio) >= thresholdRatio * total - present
            // k >= (thresholdRatio * total - present) / (1 - thresholdRatio)
            val needed = (thresholdRatio * total - presentCount) / (1.0 - thresholdRatio)
            max(1, ceil(needed).toInt())
        } else {
            0
        }

        val statusMessage = if (!isShortage) {
            if (safeMisses > 0) {
                "You can miss approximately $safeMisses more lecture${if (safeMisses > 1) "s" else ""} while remaining above ${thresholdPercent.toInt()}%."
            } else {
                "You are right at the threshold. Attend upcoming lectures to maintain eligibility."
            }
        } else {
            "Attend the next $requiredConsecutive lecture${if (requiredConsecutive > 1) "s" else ""} continuously to reach ${thresholdPercent.toInt()}%."
        }

        return AttendanceIntelligence(
            presentCount = presentCount,
            absentCount = absentCount,
            totalLectures = total,
            percentage = percentage,
            requiredThreshold = thresholdPercent,
            isShortage = isShortage,
            safeMisses = safeMisses,
            requiredConsecutive = requiredConsecutive,
            statusMessage = statusMessage
        )
    }
}
