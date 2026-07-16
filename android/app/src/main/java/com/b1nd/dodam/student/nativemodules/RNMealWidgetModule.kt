package com.b1nd.dodam.student.nativemodules

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class RNMealWidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNMealWidgetModule"

  @ReactMethod
  fun saveMeals(json: String) {
    WatchDataSender.send(reactApplicationContext, "/dodam/meals", json)
  }
}
