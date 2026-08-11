package com.b1nd.dodam.student.widget

import android.content.Context
import android.content.Intent
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.LocalSize
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.appWidgetBackground
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.updateAll
import androidx.glance.background
import androidx.glance.color.ColorProvider
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import com.b1nd.dodam.student.MainActivity
import org.json.JSONArray
import java.util.Calendar

private val timetableBackground = ColorProvider(Color(0xFFF5F5F5), Color(0xFF191A1A))
private val timetableCard = ColorProvider(Color.White, Color(0xFF232424))
private val timetableNormal = ColorProvider(Color(0xFF0F0F10), Color(0xFFF5F5F5))
private val timetableAlternative = ColorProvider(Color(0xFF5D5F60), Color(0xFFC4C5C6))
private val timetablePrimary = ColorProvider(Color(0xFF0083F0), Color(0xFF0083F0))
private val timetableWhite = ColorProvider(Color.White, Color.White)

class TimetableWidgetProvider : GlanceAppWidgetReceiver() {
  override val glanceAppWidget: GlanceAppWidget = TimetableWidget()

  companion object {
    const val PREFERENCES_NAME = MealWidgetProvider.PREFERENCES_NAME
    const val TIMETABLE_KEY = "widgetTimetable"
    fun updateAll(context: Context) = WidgetUpdateScope.launch { TimetableWidget().updateAll(context) }
  }
}

private class TimetableWidget : GlanceAppWidget() {
  override val sizeMode = SizeMode.Exact

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    val json = context.getSharedPreferences(TimetableWidgetProvider.PREFERENCES_NAME, Context.MODE_PRIVATE)
      .getString(TimetableWidgetProvider.TIMETABLE_KEY, "[]") ?: "[]"
    provideContent { TimetableContent(context, parseTimetable(json)) }
  }
}

@Composable
private fun TimetableContent(context: Context, week: List<List<String>>) {
  val size = LocalSize.current
  val showWeek = size.width >= 280.dp && size.height >= 180.dp
  val dayIndex = Calendar.getInstance().get(Calendar.DAY_OF_WEEK) - Calendar.MONDAY
  val weekday = dayIndex in 0..4

  Column(
    modifier = GlanceModifier.fillMaxSize().appWidgetBackground().background(timetableBackground).cornerRadius(24.dp).padding(12.dp)
      .clickable(actionStartActivity(Intent(context, MainActivity::class.java))),
  ) {
    if (showWeek) WeekHeader(dayIndex, size.width) else DayHeader(if (weekday) "${DAY_LABELS[dayIndex]}요일" else "주말")
    Spacer(GlanceModifier.height(8.dp))
    Column(modifier = GlanceModifier.fillMaxSize().background(timetableCard).cornerRadius(14.dp).padding(8.dp)) {
      if (showWeek) WeekTimetable(week, dayIndex, size.width, size.height) else TodayTimetable(if (weekday) week.getOrNull(dayIndex).orEmpty() else emptyList(), weekday, size.height)
    }
  }
}

@Composable
private fun DayHeader(label: String) {
  Box(
    modifier = GlanceModifier.height(28.dp).background(timetablePrimary).cornerRadius(14.dp).padding(horizontal = 12.dp),
    contentAlignment = Alignment.Center,
  ) {
    Text(label, style = TextStyle(color = timetableWhite, fontSize = 12.sp, fontWeight = FontWeight.Bold))
  }
}

@Composable
private fun WeekHeader(today: Int, widgetWidth: androidx.compose.ui.unit.Dp) {
  val cellWidth = ((widgetWidth - 78.dp) / 5).coerceAtLeast(30.dp)
  Row(modifier = GlanceModifier.fillMaxWidth().height(28.dp).padding(horizontal = 8.dp), verticalAlignment = Alignment.CenterVertically) {
    Spacer(GlanceModifier.width(38.dp))
    DAY_LABELS.forEachIndexed { index, label ->
      Box(
        modifier = GlanceModifier.width(cellWidth).height(28.dp).background(if (index == today) timetablePrimary else timetableCard).cornerRadius(14.dp),
        contentAlignment = Alignment.Center,
      ) {
        Text(label, style = TextStyle(color = if (index == today) timetableWhite else timetableAlternative, fontSize = 11.sp, fontWeight = FontWeight.Bold))
      }
    }
  }
}

@Composable
private fun TodayTimetable(subjects: List<String>, weekday: Boolean, widgetHeight: androidx.compose.ui.unit.Dp) {
  if (subjects.isEmpty()) {
    Box(GlanceModifier.fillMaxSize(), contentAlignment = Alignment.Center) {
      Text(if (weekday) "등록된 시간표가 없어요" else "주말에는 시간표가 없어요", style = TextStyle(color = timetableAlternative, fontSize = 11.sp))
    }
  } else {
    val availableHeight = (widgetHeight - 76.dp).coerceAtLeast(28.dp)
    val visibleCount = (availableHeight.value / 28f).toInt().coerceIn(1, 7).coerceAtMost(subjects.size)
    val visibleSubjects = subjects.take(visibleCount)
    val rowHeight = availableHeight / visibleCount
    visibleSubjects.forEachIndexed { period, subject ->
      Row(modifier = GlanceModifier.fillMaxWidth().height(rowHeight), verticalAlignment = Alignment.CenterVertically) {
        Text("${period + 1}교시", modifier = GlanceModifier.width(38.dp), style = TextStyle(color = if (period == currentPeriod()) timetablePrimary else timetableAlternative, fontSize = 10.sp, fontWeight = FontWeight.Bold))
        Text(subject, modifier = GlanceModifier.fillMaxWidth(), style = TextStyle(color = if (period == currentPeriod()) timetablePrimary else timetableNormal, fontSize = 12.sp), maxLines = 1)
      }
    }
  }
}

@Composable
private fun WeekTimetable(week: List<List<String>>, today: Int, widgetWidth: androidx.compose.ui.unit.Dp, widgetHeight: androidx.compose.ui.unit.Dp) {
  val rowHeight = (widgetHeight - 76.dp).coerceAtLeast(112.dp) / 7
  val cellWidth = ((widgetWidth - 78.dp) / 5).coerceAtLeast(30.dp)
  repeat(7) { period ->
    Row(modifier = GlanceModifier.fillMaxWidth().height(rowHeight), verticalAlignment = Alignment.CenterVertically) {
      Text("${period + 1}교시", modifier = GlanceModifier.width(38.dp), style = TextStyle(color = timetableAlternative, fontSize = 9.sp, fontWeight = FontWeight.Bold))
      repeat(5) { day ->
        val highlighted = day == today && period == currentPeriod()
        Box(modifier = GlanceModifier.width(cellWidth).height(rowHeight).background(if (highlighted) timetablePrimary else timetableCard).cornerRadius(6.dp), contentAlignment = Alignment.Center) {
          Text(week.getOrNull(day)?.getOrNull(period) ?: "-", style = TextStyle(color = if (highlighted) timetableWhite else timetableNormal, fontSize = 9.sp, fontWeight = if (highlighted) FontWeight.Bold else FontWeight.Normal), maxLines = 1)
        }
      }
    }
  }
}

private val DAY_LABELS = listOf("월", "화", "수", "목", "금")

private fun parseTimetable(json: String): List<List<String>> = runCatching {
  val outer = JSONArray(json)
  (0 until outer.length()).map { day -> val inner = outer.getJSONArray(day); (0 until inner.length()).map { inner.optString(it) } }
}.getOrDefault(emptyList())

private fun currentPeriod(): Int {
  val now = Calendar.getInstance().let { it.get(Calendar.HOUR_OF_DAY) * 60 + it.get(Calendar.MINUTE) }
  return listOf(9 * 60 + 40, 10 * 60 + 40, 11 * 60 + 40, 12 * 60 + 40, 14 * 60 + 20, 15 * 60 + 20, 16 * 60 + 20).indexOfFirst { now <= it }
}
