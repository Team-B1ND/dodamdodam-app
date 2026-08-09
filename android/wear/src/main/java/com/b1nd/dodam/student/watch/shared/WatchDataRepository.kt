package com.b1nd.dodam.student.watch.shared

import android.content.Context
import android.content.SharedPreferences
import com.b1nd.dodam.student.watch.feature.meal.Meal
import com.b1nd.dodam.student.watch.feature.meal.MealCardState
import com.b1nd.dodam.student.watch.feature.meal.MealType
import com.b1nd.dodam.student.watch.feature.timetable.TimetableCardState
import com.b1nd.dodam.student.watch.feature.timetable.TimetablePeriod
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

private data class RemoteMeal(val date: String, val mealType: String, val calorie: Double, val menus: List<String>)

object WatchDataRepository {
  private const val PREFS_NAME = "watch_data"
  private const val TIMETABLE_KEY = "cachedTimetableJSON"
  private const val MEALS_KEY = "cachedMealsJSON"
  private const val TIMETABLE_SYNC_DATE_KEY = "timetableSyncDate"
  private val STALE_THRESHOLD_MS = 7L * 24 * 60 * 60 * 1000

  private lateinit var prefs: SharedPreferences

  private val _timetableJson = MutableStateFlow<String?>(null)
  val timetableJson = _timetableJson.asStateFlow()

  private val _mealsJson = MutableStateFlow<String?>(null)
  val mealsJson = _mealsJson.asStateFlow()

  fun init(context: Context) {
    if (::prefs.isInitialized) return
    prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    _timetableJson.value = prefs.getString(TIMETABLE_KEY, null)
    _mealsJson.value = prefs.getString(MEALS_KEY, null)
    loadExistingDataItems(context)
  }

  // iOS의 receivedApplicationContext처럼, 앱이 꺼져 있는 동안 Data Layer에 쌓인 데이터를 시작 시점에 읽는다.
  private fun loadExistingDataItems(context: Context) {
    Wearable.getDataClient(context.applicationContext).dataItems
      .addOnSuccessListener { buffer ->
        android.util.Log.d("WatchDataRepo", "dataItems query returned ${buffer.count} items")
        for (item in buffer) {
          android.util.Log.d("WatchDataRepo", "item path=${item.uri}")
          val json = DataMapItem.fromDataItem(item).dataMap.getString("value") ?: continue
          when (item.uri.path) {
            "/dodam/timetable" -> applyTimetable(json)
            "/dodam/meals" -> applyMeals(json)
          }
        }
        buffer.release()
      }
      .addOnFailureListener { android.util.Log.e("WatchDataRepo", "dataItems query FAILED", it) }
  }

  fun applyTimetable(json: String) {
    prefs.edit().putString(TIMETABLE_KEY, json).putLong(TIMETABLE_SYNC_DATE_KEY, System.currentTimeMillis()).apply()
    _timetableJson.value = json
  }

  fun applyMeals(json: String) {
    prefs.edit().putString(MEALS_KEY, json).apply()
    _mealsJson.value = json
  }

  fun isTimetableStale(): Boolean {
    val syncDate = prefs.getLong(TIMETABLE_SYNC_DATE_KEY, -1L)
    if (syncDate < 0) return false
    return System.currentTimeMillis() - syncDate > STALE_THRESHOLD_MS
  }

  private fun todayLabel(calendar: Calendar): String {
    val days = listOf("월", "화", "수", "목", "금")
    val idx = calendar.get(Calendar.DAY_OF_WEEK) - Calendar.MONDAY
    if (idx !in days.indices) return "주말"
    return "${days[idx]}요일"
  }

  private fun isWeekday(calendar: Calendar): Boolean {
    val weekday = calendar.get(Calendar.DAY_OF_WEEK)
    return weekday in Calendar.MONDAY..Calendar.FRIDAY
  }

  // 08:50~16:20 사이 실제 수업 시간에만 강조, 쉬는시간/점심시간은 강조 없음.
  private fun currentPeriodIndex(calendar: Calendar): Int {
    val current = calendar.get(Calendar.HOUR_OF_DAY) * 60 + calendar.get(Calendar.MINUTE)
    val periods = listOf(
      8 * 60 + 50 to 9 * 60 + 40,
      9 * 60 + 50 to 10 * 60 + 40,
      10 * 60 + 50 to 11 * 60 + 40,
      11 * 60 + 50 to 12 * 60 + 40,
      13 * 60 + 30 to 14 * 60 + 20,
      14 * 60 + 30 to 15 * 60 + 20,
      15 * 60 + 30 to 16 * 60 + 20,
    )
    periods.forEachIndexed { i, (start, end) ->
      if (current in start..end) return i
    }
    return -1
  }

  private fun dateString(date: Date): String {
    val formatter = SimpleDateFormat("yyyy-MM-dd", Locale.KOREA)
    return formatter.format(date)
  }

  // 저녁(19:10) 이후엔 아침/점심/저녁 전부 내일 날짜 기준으로 조회한다.
  private fun effectiveDateString(calendar: Calendar, type: MealType): String {
    val currentTime = calendar.get(Calendar.HOUR_OF_DAY) * 100 + calendar.get(Calendar.MINUTE)
    if (currentTime <= 1910) return dateString(calendar.time)
    val tomorrow = calendar.clone() as Calendar
    tomorrow.add(Calendar.DAY_OF_MONTH, 1)
    return dateString(tomorrow.time)
  }

  fun timetableState(now: Calendar = Calendar.getInstance()): TimetableCardState {
    if (!isWeekday(now)) return TimetableCardState.Weekend

    val json = _timetableJson.value ?: return TimetableCardState.Empty(todayLabel(now))
    val weekTimetable = try {
      val outer = JSONArray(json)
      List(outer.length()) { i ->
        val inner = outer.getJSONArray(i)
        List(inner.length()) { j -> inner.getString(j) }
      }
    } catch (e: Exception) {
      return TimetableCardState.Empty(todayLabel(now))
    }

    val index = now.get(Calendar.DAY_OF_WEEK) - Calendar.MONDAY
    if (index !in weekTimetable.indices || weekTimetable[index].isEmpty()) {
      return TimetableCardState.Empty(todayLabel(now))
    }

    val subjects = weekTimetable[index]
    val periods = subjects.mapIndexed { i, subject -> TimetablePeriod(i + 1, subject) }
    return TimetableCardState.Loaded(todayLabel(now), periods, currentPeriodIndex(now) + 1)
  }

  fun mealStates(now: Calendar = Calendar.getInstance()): Map<MealType, MealCardState> {
    val json = _mealsJson.value
    val allMeals = if (json != null) {
      try {
        val arr = JSONArray(json)
        List(arr.length()) { i ->
          val o = arr.getJSONObject(i)
          val menus = o.getJSONArray("menus")
          RemoteMeal(
            date = o.getString("date"),
            mealType = o.getString("mealType"),
            calorie = o.getDouble("calorie"),
            menus = List(menus.length()) { j -> menus.getString(j) },
          )
        }
      } catch (e: Exception) {
        null
      }
    } else null

    if (allMeals == null) {
      return MealType.entries.associateWith { MealCardState.Unavailable }
    }

    return MealType.entries.associateWith { type ->
      val targetDate = effectiveDateString(now, type)
      val match = allMeals.firstOrNull { it.date == targetDate && it.mealType == type.apiRawValue }
      when {
        match == null -> MealCardState.Empty
        match.menus.isEmpty() -> MealCardState.Empty
        else -> MealCardState.Loaded(Meal(type, match.calorie, match.menus))
      }
    }
  }
}
