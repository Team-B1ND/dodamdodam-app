package com.b1nd.dodam.student.watch.feature.meal

import java.util.Calendar

enum class MealType(val label: String, val apiRawValue: String) {
  BREAKFAST("아침", "BREAKFAST"),
  LUNCH("점심", "LUNCH"),
  DINNER("저녁", "DINNER");

  companion object {
    fun from(calendar: Calendar): MealType {
      val currentTime = calendar.get(Calendar.HOUR_OF_DAY) * 100 + calendar.get(Calendar.MINUTE)
      return when {
        currentTime <= 820 -> BREAKFAST
        currentTime <= 1330 -> LUNCH
        currentTime <= 1910 -> DINNER
        else -> BREAKFAST
      }
    }
  }
}

data class Meal(val mealType: MealType, val calorie: Double, val menus: List<String>)

sealed class MealCardState {
  data class Loaded(val meal: Meal) : MealCardState()
  data object Empty : MealCardState()
  data object Unavailable : MealCardState()
}
