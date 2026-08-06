package com.b1nd.dodam.student.nativemodules

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class RNTimetableWidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNTimetableWidgetModule"

  @ReactMethod
  fun saveTimetable(json: String) {
    WatchDataSender.send(reactApplicationContext, "/dodam/timetable", json)
  }
}
