package com.b1nd.dodam.student.nativemodules

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import com.b1nd.dodam.student.widget.WidgetPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

// 미니앱 테스트 위젯은 debug 소스셋에만 있어 클래스를 직접 참조할 수 없다. 이름으로 찾아 갱신 브로드캐스트를 보낸다.
private const val INAPP_TEST_WIDGET_CLASS = "com.b1nd.dodam.student.widget.InAppTestWidgetProvider"

class RNInAppWidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNInAppWidgetModule"

  @ReactMethod
  fun saveInApps(json: String) {
    reactApplicationContext
      .getSharedPreferences(WidgetPreferences.NAME, 0)
      .edit()
      .putString(WidgetPreferences.INAPPS_KEY, json)
      .apply()

    val component = ComponentName(reactApplicationContext, INAPP_TEST_WIDGET_CLASS)
    val ids = AppWidgetManager.getInstance(reactApplicationContext).getAppWidgetIds(component)
    if (ids.isEmpty()) return
    reactApplicationContext.sendBroadcast(
      Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
        .setComponent(component)
        .putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids),
    )
  }
}
