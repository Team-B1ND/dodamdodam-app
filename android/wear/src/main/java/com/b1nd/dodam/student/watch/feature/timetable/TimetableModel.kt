package com.b1nd.dodam.student.watch.feature.timetable

data class TimetablePeriod(val period: Int, val subject: String)

sealed class TimetableCardState {
  data class Loaded(val dayLabel: String, val periods: List<TimetablePeriod>, val currentPeriod: Int?) : TimetableCardState()
  data object Weekend : TimetableCardState()
  data class Empty(val dayLabel: String) : TimetableCardState()
}
