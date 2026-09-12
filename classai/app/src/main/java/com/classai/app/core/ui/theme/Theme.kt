package com.classai.app.core.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val LightColorScheme = lightColorScheme(
    primary = ClassAiBluePrimary,
    onPrimary = androidx.compose.ui.graphics.Color.White,
    primaryContainer = androidx.compose.ui.graphics.Color(0xFFDBEAFE),
    onPrimaryContainer = androidx.compose.ui.graphics.Color(0xFF1E3A8A),
    secondary = ClassAiBlueSecondary,
    onSecondary = androidx.compose.ui.graphics.Color.White,
    secondaryContainer = androidx.compose.ui.graphics.Color(0xFFF1F5F9),
    onSecondaryContainer = androidx.compose.ui.graphics.Color(0xFF1E293B),
    tertiary = ClassAiAmber,
    onTertiary = androidx.compose.ui.graphics.Color.White,
    tertiaryContainer = androidx.compose.ui.graphics.Color(0xFFFEF3C7),
    onTertiaryContainer = androidx.compose.ui.graphics.Color(0xFF78350F),
    background = LightBackground,
    onBackground = LightOnSurface,
    surface = LightSurface,
    onSurface = LightOnSurface,
    surfaceVariant = LightSurfaceVariant,
    onSurfaceVariant = LightOnSurfaceVariant,
    outline = LightOutline,
    error = ClassAiRose,
    onError = androidx.compose.ui.graphics.Color.White,
    errorContainer = androidx.compose.ui.graphics.Color(0xFFFEE2E2),
    onErrorContainer = androidx.compose.ui.graphics.Color(0xFF7F1D1D)
)

private val DarkColorScheme = darkColorScheme(
    primary = ClassAiBluePrimaryDark,
    onPrimary = androidx.compose.ui.graphics.Color(0xFF0F172A),
    primaryContainer = androidx.compose.ui.graphics.Color(0xFF1E3A8A),
    onPrimaryContainer = androidx.compose.ui.graphics.Color(0xFFDBEAFE),
    secondary = ClassAiBlueSecondaryDark,
    onSecondary = androidx.compose.ui.graphics.Color(0xFF0F172A),
    secondaryContainer = androidx.compose.ui.graphics.Color(0xFF1E293B),
    onSecondaryContainer = androidx.compose.ui.graphics.Color(0xFFE2E8F0),
    tertiary = ClassAiAmberDark,
    onTertiary = androidx.compose.ui.graphics.Color(0xFF0F172A),
    tertiaryContainer = androidx.compose.ui.graphics.Color(0xFF78350F),
    onTertiaryContainer = androidx.compose.ui.graphics.Color(0xFFFEF3C7),
    background = DarkBackground,
    onBackground = DarkOnSurface,
    surface = DarkSurface,
    onSurface = DarkOnSurface,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = DarkOnSurfaceVariant,
    outline = DarkOutline,
    error = ClassAiRoseDark,
    onError = androidx.compose.ui.graphics.Color(0xFF450A0A),
    errorContainer = androidx.compose.ui.graphics.Color(0xFF7F1D1D),
    onErrorContainer = androidx.compose.ui.graphics.Color(0xFFFEE2E2)
)

@Composable
fun ClassAiTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = ClassAiTypography,
        content = content
    )
}
