package com.b1nd.dodam.student.widget

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import android.content.SharedPreferences
import android.content.res.ColorStateList
import android.content.res.Configuration
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.Window
import android.view.WindowInsets
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.glance.appwidget.GlanceAppWidgetManager
import com.b1nd.dodam.student.MainActivity
import com.b1nd.dodam.student.R
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/** The launcher owns this flow; only a completed selection returns RESULT_OK. */
class AidWidgetConfigureActivity : Activity() {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var widgetId = AppWidgetManager.INVALID_APPWIDGET_ID
  private var saving = false
  private var errorMessage: String? = null
  private lateinit var content: LinearLayout
  private val preferenceListener = SharedPreferences.OnSharedPreferenceChangeListener { _, _ ->
    runOnUiThread {
      if (!isFinishing && !isDestroyed && !saving) render()
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    requestWindowFeature(Window.FEATURE_NO_TITLE)
    widgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
    setResult(RESULT_CANCELED, resultIntent())
    if (!hasValidWidget()) {
      finish()
      return
    }

    val dark = resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK == Configuration.UI_MODE_NIGHT_YES
    @Suppress("DEPRECATION")
    window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
      View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
      (if (dark) 0 else View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR) or
      (if (!dark && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR else 0)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) window.setDecorFitsSystemWindows(false)

    content = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(dp(20), dp(16), dp(20), dp(16))
    }
    val scroll = ScrollView(this).apply {
      isFillViewport = true
      setBackgroundColor(getColor(R.color.widget_background_neutral))
      addView(content)
      setOnApplyWindowInsetsListener { _, insets ->
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          val bars = insets.getInsets(WindowInsets.Type.systemBars() or WindowInsets.Type.displayCutout())
          content.setPadding(dp(20) + bars.left, dp(16) + bars.top, dp(20) + bars.right, dp(16) + bars.bottom)
        } else {
          @Suppress("DEPRECATION")
          content.setPadding(dp(20) + insets.systemWindowInsetLeft, dp(16) + insets.systemWindowInsetTop, dp(20) + insets.systemWindowInsetRight, dp(16) + insets.systemWindowInsetBottom)
        }
        insets
      }
    }
    setContentView(scroll)
    scroll.requestApplyInsets()
    render()
  }

  override fun onStart() {
    super.onStart()
    if (::content.isInitialized) AidWidgetStore.preferences(this).registerOnSharedPreferenceChangeListener(preferenceListener)
  }

  override fun onResume() {
    super.onResume()
    if (::content.isInitialized && !saving) render()
  }

  override fun onStop() {
    AidWidgetStore.preferences(this).unregisterOnSharedPreferenceChangeListener(preferenceListener)
    super.onStop()
  }

  override fun onDestroy() {
    scope.cancel()
    super.onDestroy()
  }

  private fun render() {
    content.removeAllViews()
    content.addView(Button(this).apply {
      setText(android.R.string.cancel)
      isAllCaps = false
      isEnabled = !saving
      setTextColor(getColor(R.color.widget_label_alternative))
      backgroundTintList = ColorStateList.valueOf(getColor(R.color.widget_background_neutral))
      setOnClickListener { finish() }
    }, LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, dp(48)))
    content.addView(label(getString(R.string.aid_widget_configure_title), 28f, bold = true).apply {
      setPadding(0, dp(20), 0, dp(12))
    })
    content.addView(label(getString(R.string.aid_widget_configure_description), 16f).apply {
      setPadding(0, 0, 0, dp(24))
    })

    if (saving) {
      content.addView(label(getString(R.string.aid_widget_saving), 16f))
      return
    }
    errorMessage?.let { message ->
      content.addView(label(message, 16f).apply {
        accessibilityLiveRegion = View.ACCESSIBILITY_LIVE_REGION_POLITE
        setPadding(0, 0, 0, dp(20))
      })
    }

    val apps = AidWidgetStore.apps(this)
    if (apps.isEmpty()) {
      content.addView(label(getString(R.string.aid_widget_empty_catalogue), 16f).apply {
        setPadding(0, 0, 0, dp(24))
      })
      content.addView(openAppButton())
      return
    }

    val selected = AidWidgetStore.selection(this, widgetId)
    apps.forEach { app ->
      val title = if (app.appId == selected?.appId) getString(R.string.aid_widget_current_service, app.name) else app.name
      content.addView(label(title, 18f, bold = true).apply {
        minHeight = dp(64)
        gravity = Gravity.CENTER_VERTICAL
        setPadding(dp(20), dp(16), dp(20), dp(16))
        background = RippleDrawable(
          ColorStateList.valueOf(0x220083F0),
          GradientDrawable().apply {
            setColor(getColor(R.color.widget_background_normal))
            cornerRadius = dp(16).toFloat()
          },
          null,
        )
        isFocusable = true
        setOnClickListener { selectApp(app) }
      }, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
        bottomMargin = dp(12)
      })
    }
    content.addView(label(getString(R.string.aid_widget_refresh_hint), 14f).apply {
      setPadding(0, dp(16), 0, dp(12))
    })
    content.addView(openAppButton())
  }

  private fun selectApp(app: AidWidgetApp) {
    if (saving) return
    if (!hasValidWidget()) {
      finish()
      return
    }
    saving = true
    errorMessage = null
    render()

    scope.launch {
      try {
        withContext(Dispatchers.IO) {
          val currentApp = AidWidgetStore.apps(applicationContext).firstOrNull { it.appId == app.appId }
            ?: error("The selected AID service is no longer available")
          val previous = AidWidgetStore.selection(applicationContext, widgetId)
          AidWidgetStore.select(applicationContext, widgetId, currentApp)
          try {
            val glanceId = GlanceAppWidgetManager(applicationContext).getGlanceIdBy(widgetId)
            AidWidget.resetPage(applicationContext, glanceId)
            AidWidget().update(applicationContext, glanceId)
          } catch (error: Exception) {
            AidWidgetStore.select(applicationContext, widgetId, previous)
            throw error
          }
        }
        setResult(RESULT_OK, resultIntent())
        finish()
      } catch (error: CancellationException) {
        throw error
      } catch (error: Exception) {
        saving = false
        errorMessage = getString(R.string.aid_widget_save_error)
        render()
      }
    }
  }

  private fun openAppButton() = Button(this).apply {
    setText(R.string.aid_widget_open_app)
    isAllCaps = false
    minHeight = dp(48)
    setTextColor(getColor(android.R.color.white))
    backgroundTintList = ColorStateList.valueOf(getColor(R.color.widget_primary))
    setOnClickListener {
      // Leave configuration alive so Back can return here after login/catalogue sync.
      startActivity(Intent(this@AidWidgetConfigureActivity, MainActivity::class.java)
        .setAction(Intent.ACTION_MAIN)
        .addCategory(Intent.CATEGORY_LAUNCHER)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
  }

  private fun label(value: String, size: Float, bold: Boolean = false) = TextView(this).apply {
    text = value
    textSize = size
    setTextColor(getColor(R.color.widget_label_normal))
    if (bold) setTypeface(typeface, Typeface.BOLD)
  }

  private fun hasValidWidget(): Boolean = widgetId != AppWidgetManager.INVALID_APPWIDGET_ID &&
    AppWidgetManager.getInstance(this).getAppWidgetInfo(widgetId)?.provider == ComponentName(this, AidWidgetProvider::class.java)

  private fun resultIntent() = Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)
  private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
}
