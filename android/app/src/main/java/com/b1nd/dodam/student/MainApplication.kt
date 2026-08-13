package com.b1nd.dodam.student

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.res.Configuration
import android.os.Build

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.common.ReleaseLevel
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint

import com.b1nd.dodam.student.nativemodules.WatchPackage
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ExpoReactHostFactory

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    ExpoReactHostFactory.getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
          add(WatchPackage())
        }
    )
  }

  override fun onCreate() {
    super.onCreate()
    DefaultNewArchitectureEntryPoint.releaseLevel = try {
      ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())
    } catch (e: IllegalArgumentException) {
      ReleaseLevel.STABLE
    }
    loadReactNative(this)
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
    createNotificationChannel()
  }

  /**
   * Android 8+는 채널 없이는 알림을 띄울 수 없다. 만들어두지 않으면 FCM이 이름 없는
   * fallback 채널로 대신 띄워서 사용자가 알림 종류를 구분하거나 끌 수 없다.
   */
  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val channel = NotificationChannel(
      DEFAULT_NOTIFICATION_CHANNEL_ID,
      getString(R.string.default_notification_channel_name),
      NotificationManager.IMPORTANCE_DEFAULT,
    )
    getSystemService(NotificationManager::class.java)?.createNotificationChannel(channel)
  }

  companion object {
    // AndroidManifest의 default_notification_channel_id 값과 반드시 같아야 한다.
    private const val DEFAULT_NOTIFICATION_CHANNEL_ID = "dodam_default"
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
