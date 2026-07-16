package com.b1nd.dodam.student.watch.feature.meal

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Text
import com.b1nd.dodam.student.watch.shared.WatchCardEmptyText
import com.b1nd.dodam.student.watch.shared.WatchColor
import com.b1nd.dodam.student.watch.shared.WatchPageCard

@Composable
fun MealCardView(mealType: MealType, state: MealCardState) {
  val kcalText = (state as? MealCardState.Loaded)?.let { "${it.meal.calorie.toInt()}Kcal" }

  WatchPageCard(badgeLabel = mealType.label, badgeTrailingText = kcalText) {
    when {
      state is MealCardState.Loaded && state.meal.menus.isNotEmpty() -> {
        Column(modifier = Modifier.fillMaxSize(), verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(4.dp)) {
          state.meal.menus.forEach { menu ->
            Text(text = menu, fontSize = 12.sp, color = WatchColor.labelNormal, maxLines = 1)
          }
        }
      }
      state is MealCardState.Loaded -> WatchCardEmptyText(text = "급식이 없어요")
      state is MealCardState.Empty -> WatchCardEmptyText(text = "급식이 없어요")
      else -> WatchCardEmptyText(text = "급식을\n불러올 수 없어요")
    }
  }
}
