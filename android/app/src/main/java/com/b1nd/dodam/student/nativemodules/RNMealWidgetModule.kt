package com.b1nd.dodam.student.nativemodules

import com.b1nd.dodam.student.widget.MealWidgetProvider
import com.b1nd.dodam.student.widget.WidgetPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class RNMealWidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNMealWidgetModule"

  @ReactMethod
  fun saveMeals(json: String) {
    reactApplicationContext
      .getSharedPreferences(WidgetPreferences.NAME, 0)
      .edit()
      .putString(WidgetPreferences.MEALS_KEY, json)
      .apply()
    MealWidgetProvider.updateAll(reactApplicationContext)
    WatchDataSender.send(reactApplicationContext, "/dodam/meals", json)
  }
}
