package com.b1nd.dodam.student.nativemodules

import com.b1nd.dodam.student.widget.TimetableWidgetProvider
import com.b1nd.dodam.student.widget.WidgetPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class RNTimetableWidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNTimetableWidgetModule"

  @ReactMethod
  fun saveTimetable(json: String) {
    reactApplicationContext
      .getSharedPreferences(WidgetPreferences.NAME, 0)
      .edit()
      .putString(WidgetPreferences.TIMETABLE_KEY, json)
      .apply()
    TimetableWidgetProvider.updateAll(reactApplicationContext)
    WatchDataSender.send(reactApplicationContext, "/dodam/timetable", json)
  }
}
