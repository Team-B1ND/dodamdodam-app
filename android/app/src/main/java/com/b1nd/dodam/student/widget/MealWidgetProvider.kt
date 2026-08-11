package com.b1nd.dodam.student.widget

import android.content.Context
import android.content.Intent
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.LocalSize
import androidx.glance.action.ActionParameters
import androidx.glance.action.actionParametersOf
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.ActionCallback
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.state.updateAppWidgetState
import androidx.glance.appwidget.appWidgetBackground
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.updateAll
import androidx.glance.background
import androidx.glance.currentState
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.state.PreferencesGlanceStateDefinition
import com.b1nd.dodam.student.MainActivity
import org.json.JSONArray
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private val widgetBackground = WidgetColors.background
private val cardBackground = WidgetColors.card
private val normalLabel = WidgetColors.label
private val alternativeLabel = WidgetColors.alternativeLabel
private val primary = WidgetColors.primary
private val white = WidgetColors.white
private val selectedMealParameter = ActionParameters.Key<String>(WidgetPreferences.SELECTED_MEAL_KEY)
private val selectedMealPreference = stringPreferencesKey(WidgetPreferences.SELECTED_MEAL_KEY)

class MealWidgetProvider : GlanceAppWidgetReceiver() {
  override val glanceAppWidget: GlanceAppWidget = MealWidget()

  companion object {
    fun updateAll(context: Context) = WidgetUpdateScope.launch { MealWidget().updateAll(context) }
  }
}

class MealWideWidgetProvider : GlanceAppWidgetReceiver() {
  override val glanceAppWidget: GlanceAppWidget = MealWidget()
}

internal class MealWidget : GlanceAppWidget() {
  override val sizeMode = SizeMode.Exact
  override val stateDefinition = PreferencesGlanceStateDefinition

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    provideContent {
      val prefs = context.getSharedPreferences(WidgetPreferences.NAME, Context.MODE_PRIVATE)
      val mealsJson = prefs.getString(WidgetPreferences.MEALS_KEY, "[]") ?: "[]"
      val selectedMeal = currentState<Preferences>()[selectedMealPreference] ?: currentMealType()
      MealContent(context, mealsJson, selectedMeal)
    }
  }
}

internal class SelectMealAction : ActionCallback {
  override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) {
    val selectedMeal = parameters[selectedMealParameter] ?: return
    updateAppWidgetState(context, glanceId) { preferences ->
      preferences[selectedMealPreference] = selectedMeal
    }
    MealWidget().update(context, glanceId)
  }
}

@Composable
private fun MealContent(context: Context, json: String, selected: String) {
  val size = LocalSize.current
  val isWide = size.width >= 260.dp
  val showAllMeals = isWide && size.height >= 260.dp
  Column(
    modifier = GlanceModifier.fillMaxSize().appWidgetBackground().background(widgetBackground).cornerRadius(24.dp).padding(12.dp),
  ) {
    if (showAllMeals) {
      Row(modifier = GlanceModifier.fillMaxSize()) {
        MEAL_TYPES.forEachIndexed { index, type ->
          MealSummary(
            context = context,
            type = type,
            meal = findMeal(json, type.apiName),
            modifier = GlanceModifier.width((size.width - 32.dp) / 3).height(size.height - 24.dp),
            bodyHeight = size.height - 64.dp,
            maxMenus = if (size.height >= 260.dp) 8 else 5,
          )
          if (index != MEAL_TYPES.lastIndex) Spacer(GlanceModifier.width(4.dp))
        }
      }
    } else {
      val activeType = MEAL_TYPES.firstOrNull { it.apiName == selected } ?: MEAL_TYPES.first()
      Row(modifier = GlanceModifier.fillMaxWidth().height(32.dp)) {
        MEAL_TYPES.forEachIndexed { index, type ->
          if (isWide || type == activeType) {
            val tabWidth = if (isWide) (size.width - 32.dp) / 3 else size.width - 24.dp
            MealTab(type, type == activeType, GlanceModifier.width(tabWidth))
            if (isWide && index != MEAL_TYPES.lastIndex) Spacer(GlanceModifier.width(4.dp))
          }
        }
      }
      Spacer(GlanceModifier.height(8.dp))
      MealBody(
        meal = findMeal(json, activeType.apiName),
        modifier = GlanceModifier
          .fillMaxWidth()
          .height((size.height - 76.dp).coerceAtLeast(34.dp))
          .clickable(actionStartActivity(Intent(context, MainActivity::class.java))),
        maxMenus = when { size.height < 150.dp -> 3; size.height < 220.dp -> 6; else -> 10 },
        splitColumns = isWide && size.width >= 320.dp,
      )
    }
  }
}

@Composable
private fun MealTab(type: MealType, selected: Boolean, modifier: GlanceModifier) {
  Box(
    modifier = modifier
      .height(32.dp)
      .background(if (selected) primary else cardBackground)
      .cornerRadius(16.dp)
      .clickable(actionRunCallback<SelectMealAction>(actionParametersOf(selectedMealParameter to type.apiName))),
    contentAlignment = Alignment.Center,
  ) {
    Text(type.label, style = TextStyle(color = if (selected) white else alternativeLabel, fontSize = 12.sp, fontWeight = FontWeight.Bold))
  }
}

@Composable
private fun MealSummary(context: Context, type: MealType, meal: Meal?, modifier: GlanceModifier, bodyHeight: androidx.compose.ui.unit.Dp, maxMenus: Int) {
  Column(modifier = modifier) {
    MealTab(type, selected = true, modifier = GlanceModifier.fillMaxWidth())
    Spacer(GlanceModifier.height(8.dp))
    MealBody(
      meal = meal,
      modifier = GlanceModifier
        .fillMaxWidth()
        .height(bodyHeight)
        .clickable(actionStartActivity(Intent(context, MainActivity::class.java))),
      maxMenus = maxMenus,
      splitColumns = false,
    )
  }
}

@Composable
private fun MealBody(meal: Meal?, modifier: GlanceModifier, maxMenus: Int, splitColumns: Boolean) {
  val roomy = LocalSize.current.height >= 220.dp
  Column(modifier = modifier.background(cardBackground).cornerRadius(14.dp).padding(10.dp)) {
    if (meal == null) {
      Text("급식 정보가 없어요", style = TextStyle(color = alternativeLabel, fontSize = 12.sp))
      return@Column
    }
    meal.calorie?.let {
      Text("${it.toInt()}Kcal", style = TextStyle(color = alternativeLabel, fontSize = 10.sp), maxLines = 1)
      Spacer(GlanceModifier.height(4.dp))
    }
    val menus = meal.menus.take(maxMenus)
    if (menus.isEmpty()) {
      Text("오늘은 급식이 없어요", style = TextStyle(color = alternativeLabel, fontSize = 12.sp))
    } else if (splitColumns && menus.size >= 4) {
      val half = (menus.size + 1) / 2
      Row(modifier = GlanceModifier.fillMaxWidth()) {
        MealMenuList(menus.take(half), GlanceModifier.width((LocalSize.current.width - 48.dp) / 2), roomy)
        Spacer(GlanceModifier.width(8.dp))
        MealMenuList(menus.drop(half), GlanceModifier.fillMaxWidth(), roomy)
      }
    } else {
      MealMenuList(menus, GlanceModifier.fillMaxWidth(), roomy)
    }
  }
}

@Composable
private fun MealMenuList(menus: List<String>, modifier: GlanceModifier, roomy: Boolean) {
  Column(modifier = modifier) {
    menus.forEach { menu ->
      Row(modifier = GlanceModifier.fillMaxWidth().height(if (roomy) 30.dp else 22.dp)) {
        Text(
          text = "• $menu",
          style = TextStyle(color = normalLabel, fontSize = if (roomy) 14.sp else 12.sp),
          maxLines = 2,
        )
      }
    }
  }
}

private data class Meal(val calorie: Double?, val menus: List<String>)
private data class MealType(val apiName: String, val label: String)
private val MEAL_TYPES = listOf(MealType("BREAKFAST", "아침"), MealType("LUNCH", "점심"), MealType("DINNER", "저녁"))

private fun findMeal(json: String, type: String): Meal? = runCatching {
  val today = SimpleDateFormat("yyyy-MM-dd", Locale.KOREA).format(Date())
  val array = JSONArray(json)
  (0 until array.length()).asSequence().map { array.getJSONObject(it) }
    .firstOrNull { it.optString("date") == today && it.optString("mealType") == type }?.let { item ->
      val menus = item.optJSONArray("menus") ?: JSONArray()
      val calorie = item.optDouble("calorie", Double.NaN).takeIf { it.isFinite() && it > 0.0 }
      Meal(calorie, (0 until menus.length()).map { menus.optString(it) })
    }
}.getOrNull()

private fun currentMealType(): String {
  val time = SimpleDateFormat("HHmm", Locale.KOREA).format(Date()).toIntOrNull() ?: 0
  return when { time <= 820 -> "BREAKFAST"; time <= 1330 -> "LUNCH"; time <= 1910 -> "DINNER"; else -> "BREAKFAST" }
}
