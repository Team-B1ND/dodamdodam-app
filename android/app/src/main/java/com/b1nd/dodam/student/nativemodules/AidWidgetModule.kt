package com.b1nd.dodam.student.nativemodules

import androidx.glance.appwidget.updateAll
import com.b1nd.dodam.student.widget.AidWidget
import com.b1nd.dodam.student.widget.AidWidgetStore
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class AidWidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

  override fun getName() = "AidWidget"

  @ReactMethod
  fun updateApps(appsJson: String, promise: Promise) {
    scope.launch {
      try {
        AidWidgetStore.updateApps(reactApplicationContext, appsJson)
        AidWidget().updateAll(reactApplicationContext)
        promise.resolve(null)
      } catch (error: CancellationException) {
        throw error
      } catch (error: Exception) {
        promise.reject("AID_WIDGET_UPDATE_FAILED", "AID 위젯의 서비스 목록을 갱신하지 못했어요.", error)
      }
    }
  }

  override fun invalidate() {
    scope.cancel()
    super.invalidate()
  }
}
