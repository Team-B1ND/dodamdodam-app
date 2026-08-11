package com.b1nd.dodam.student.widget

import androidx.compose.ui.graphics.Color
import androidx.glance.color.ColorProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

internal object WidgetPreferences {
  const val NAME = "dodam_widgets"
  const val MEALS_KEY = "widgetMeals"
  const val TIMETABLE_KEY = "widgetTimetable"
}

internal object WidgetColors {
  val background = ColorProvider(Color(0xFFF5F5F5), Color(0xFF191A1A))
  val card = ColorProvider(Color.White, Color(0xFF232424))
  val label = ColorProvider(Color(0xFF0F0F10), Color(0xFFF5F5F5))
  val alternativeLabel = ColorProvider(Color(0xFF5D5F60), Color(0xFFC4C5C6))
  val primary = ColorProvider(Color(0xFF0083F0), Color(0xFF0083F0))
  val white = ColorProvider(Color.White, Color.White)
}

internal object WidgetUpdateScope {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

  fun launch(block: suspend () -> Unit) {
    scope.launch { block() }
  }
}
