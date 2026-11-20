package com.b1nd.dodam.student.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import org.json.JSONArray
import org.json.JSONObject

internal data class AidWidgetApp(val appId: String, val name: String)

/** Only public service identifiers and labels belong here. Authentication stays in the app. */
internal object AidWidgetStore {
  private const val PREFERENCES = "dodam_aid_widgets"
  private const val APPS_KEY = "apps"

  fun preferences(context: Context): SharedPreferences =
    context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)

  fun apps(context: Context): List<AidWidgetApp> = runCatching {
    parseApps(preferences(context).getString(APPS_KEY, "[]") ?: "[]")
  }.getOrDefault(emptyList())

  fun updateApps(context: Context, json: String) {
    val apps = parseApps(json)
    val serialized = JSONArray().apply {
      apps.forEach { app ->
        put(JSONObject().put("appId", app.appId).put("name", app.name))
      }
    }.toString()
    val preferences = preferences(context)
    val editor = preferences.edit().putString(APPS_KEY, serialized)
    val names = apps.associate { it.appId to it.name }
    AppWidgetManager.getInstance(context)
      .getAppWidgetIds(ComponentName(context, AidWidgetProvider::class.java))
      .forEach { widgetId ->
        val selectedId = preferences.getString(idKey(widgetId), null)
        names[selectedId]?.let { editor.putString(nameKey(widgetId), it) }
      }
    check(editor.commit()) { "AID service catalogue could not be saved" }
  }

  fun selection(context: Context, widgetId: Int): AidWidgetApp? {
    val preferences = preferences(context)
    val appId = preferences.getString(idKey(widgetId), null) ?: return null
    val name = apps(context).firstOrNull { it.appId == appId }?.name
      ?: preferences.getString(nameKey(widgetId), null)
      ?: return null
    return AidWidgetApp(appId, name)
  }

  // Glance keeps a composition alive after rendering; updateAll alone does not reload its data.
  fun observeSelection(context: Context, widgetId: Int): Flow<AidWidgetApp?> = callbackFlow {
    val preferences = preferences(context)
    val listener = SharedPreferences.OnSharedPreferenceChangeListener { _, _ ->
      trySend(selection(context, widgetId))
    }
    preferences.registerOnSharedPreferenceChangeListener(listener)
    trySend(selection(context, widgetId))
    awaitClose { preferences.unregisterOnSharedPreferenceChangeListener(listener) }
  }.distinctUntilChanged()

  fun select(context: Context, widgetId: Int, app: AidWidgetApp?) {
    val editor = preferences(context).edit()
    if (app == null) {
      editor.remove(idKey(widgetId)).remove(nameKey(widgetId))
    } else {
      editor.putString(idKey(widgetId), app.appId).putString(nameKey(widgetId), app.name)
    }
    check(editor.commit()) { "AID widget selection could not be saved" }
  }

  fun delete(context: Context, widgetIds: IntArray) {
    val editor = preferences(context).edit()
    widgetIds.forEach { editor.remove(idKey(it)).remove(nameKey(it)) }
    editor.apply()
  }

  private fun parseApps(json: String): List<AidWidgetApp> {
    val array = JSONArray(json)
    val apps = linkedMapOf<String, AidWidgetApp>()
    for (index in 0 until array.length()) {
      val item = array.getJSONObject(index)
      val appId = item.getString("appId")
      val name = item.getString("name").trim()
      require(appId.isNotBlank() && name.isNotBlank()) { "AID service identifier and name are required" }
      apps[appId] = AidWidgetApp(appId, name)
    }
    return apps.values.toList()
  }

  private fun idKey(widgetId: Int) = "widget_${widgetId}_id"
  private fun nameKey(widgetId: Int) = "widget_${widgetId}_name"
}
