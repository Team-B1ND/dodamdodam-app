package com.b1nd.dodam.student.widget

import android.content.Context
import android.content.Intent
import androidx.compose.runtime.Composable
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

private val timetableBackground = WidgetColors.background
private val timetableCard = WidgetColors.card
private val timetableNormal = WidgetColors.label
private val timetableAlternative = WidgetColors.alternativeLabel
private val timetablePrimary = WidgetColors.primary
private val timetableWhite = WidgetColors.white

class TimetableWidgetProvider : GlanceAppWidgetReceiver() {
  override val glanceAppWidget: GlanceAppWidget = TimetableWidget()

  companion object {
    fun updateAll(context: Context) = WidgetUpdateScope.launch {
      TimetableWidget().updateAll(context)
      TimetableLargeWidget().updateAll(context)
    }
  }
}

class TimetableLargeWidgetProvider : GlanceAppWidgetReceiver() {
  override val glanceAppWidget: GlanceAppWidget = TimetableLargeWidget()
}

internal class TimetableWidget : GlanceAppWidget() {
  override val sizeMode = SizeMode.Exact

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    val json = context.getSharedPreferences(WidgetPreferences.NAME, Context.MODE_PRIVATE)
      .getString(WidgetPreferences.TIMETABLE_KEY, "[]") ?: "[]"
    provideContent { TimetableContent(context, parseTimetable(json), false) }
  }
}

internal class TimetableLargeWidget : GlanceAppWidget() {
  override val sizeMode = SizeMode.Exact

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    val json = context.getSharedPreferences(WidgetPreferences.NAME, Context.MODE_PRIVATE)
      .getString(WidgetPreferences.TIMETABLE_KEY, "[]") ?: "[]"
    provideContent { TimetableContent(context, parseTimetable(json), true) }
  }
}

@Composable
private fun TimetableContent(context: Context, week: List<List<String>>, forceWeekLayout: Boolean) {
  val size = LocalSize.current
  val showWeek = forceWeekLayout || (size.width >= 220.dp && size.height >= 260.dp)
  val compact = size.height < 180.dp
  val dayIndex = Calendar.getInstance().get(Calendar.DAY_OF_WEEK) - Calendar.MONDAY
  val weekday = dayIndex in 0..4
  val current = currentPeriod()

  Column(
    modifier = GlanceModifier.fillMaxSize().appWidgetBackground().background(timetableBackground).cornerRadius(24.dp).padding(if (compact) 6.dp else 12.dp)
      .clickable(actionStartActivity(Intent(context, MainActivity::class.java))),
  ) {
    if (showWeek) WeekHeader(dayIndex, size.width) else DayHeader(if (weekday) "${DAY_LABELS[dayIndex]}요일" else "주말", compact)
    Spacer(GlanceModifier.height(if (compact) 4.dp else 8.dp))
    Column(modifier = GlanceModifier.fillMaxSize().background(timetableCard).cornerRadius(14.dp).padding(if (compact) 4.dp else 8.dp)) {
      if (showWeek) WeekTimetable(week, dayIndex, current, size.width, size.height) else TodayTimetable(if (weekday) week.getOrNull(dayIndex).orEmpty() else emptyList(), weekday, current, size.height)
    }
  }
}

@Composable
private fun DayHeader(label: String, compact: Boolean) {
  Box(
    modifier = GlanceModifier.height(if (compact) 20.dp else 28.dp).background(timetablePrimary).cornerRadius(14.dp).padding(horizontal = if (compact) 8.dp else 12.dp),
    contentAlignment = Alignment.Center,
  ) {
    Text(label, style = TextStyle(color = timetableWhite, fontSize = if (compact) 10.sp else 12.sp, fontWeight = FontWeight.Bold))
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
private fun TodayTimetable(subjects: List<String>, weekday: Boolean, current: Int, widgetHeight: androidx.compose.ui.unit.Dp) {
  if (subjects.isEmpty()) {
    Box(GlanceModifier.fillMaxSize(), contentAlignment = Alignment.Center) {
      Text(if (weekday) "등록된 시간표가 없어요" else "주말에는 시간표가 없어요", style = TextStyle(color = timetableAlternative, fontSize = 11.sp))
    }
  } else {
    val compact = widgetHeight < 180.dp
    val availableHeight = (widgetHeight - if (compact) 44.dp else 76.dp).coerceAtLeast(if (compact) 63.dp else 56.dp)
    val visibleSubjects = subjects.take(7)
    val rowHeight = availableHeight / visibleSubjects.size
    TimetablePeriodColumn(visibleSubjects, 0, current, rowHeight, compact, GlanceModifier.fillMaxWidth())
  }
}

@Composable
private fun TimetablePeriodColumn(
  subjects: List<String>,
  startPeriod: Int,
  current: Int,
  rowHeight: androidx.compose.ui.unit.Dp,
  compact: Boolean,
  modifier: GlanceModifier,
) {
  Column(modifier = modifier) {
    subjects.forEachIndexed { index, subject ->
      val period = startPeriod + index
      Row(modifier = GlanceModifier.fillMaxWidth().height(rowHeight), verticalAlignment = Alignment.CenterVertically) {
        Text("${period + 1}교시", modifier = GlanceModifier.width(if (compact) 32.dp else 38.dp), style = TextStyle(color = if (period == current) timetablePrimary else timetableAlternative, fontSize = if (compact) 8.sp else 10.sp, fontWeight = FontWeight.Bold), maxLines = 1)
        Text(subject, modifier = GlanceModifier.fillMaxWidth(), style = TextStyle(color = if (period == current) timetablePrimary else timetableNormal, fontSize = if (compact) 9.sp else 12.sp), maxLines = 1)
      }
    }
  }
}

@Composable
private fun WeekTimetable(week: List<List<String>>, today: Int, current: Int, widgetWidth: androidx.compose.ui.unit.Dp, widgetHeight: androidx.compose.ui.unit.Dp) {
  val rowHeight = (widgetHeight - 76.dp).coerceAtLeast(112.dp) / 7
  val cellWidth = ((widgetWidth - 78.dp) / 5).coerceAtLeast(30.dp)
  repeat(7) { period ->
    Row(modifier = GlanceModifier.fillMaxWidth().height(rowHeight), verticalAlignment = Alignment.CenterVertically) {
      Text("${period + 1}교시", modifier = GlanceModifier.width(38.dp), style = TextStyle(color = timetableAlternative, fontSize = 10.sp, fontWeight = FontWeight.Bold))
      repeat(5) { day ->
        val highlighted = day == today && period == current
        Box(modifier = GlanceModifier.width(cellWidth).height(rowHeight).background(if (highlighted) timetablePrimary else timetableCard).cornerRadius(6.dp), contentAlignment = Alignment.Center) {
          Text(week.getOrNull(day)?.getOrNull(period) ?: "-", style = TextStyle(color = if (highlighted) timetableWhite else timetableNormal, fontSize = 11.sp, fontWeight = if (highlighted) FontWeight.Bold else FontWeight.Normal), maxLines = 1)
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
