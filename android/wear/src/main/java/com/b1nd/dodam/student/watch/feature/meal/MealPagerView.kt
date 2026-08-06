package com.b1nd.dodam.student.watch.feature.meal

import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.pager.VerticalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp
import com.b1nd.dodam.student.watch.shared.PageDot
import kotlinx.coroutines.launch
import java.util.Calendar

@Composable
fun MealPagerView(states: Map<MealType, MealCardState>) {
  val types = MealType.entries
  val pagerState = rememberPagerState(initialPage = MealType.from(Calendar.getInstance()).ordinal) { types.size }
  val scope = rememberCoroutineScope()

  // watchOS의 scenePhase == .active와 동일하게, 화면이 다시 활성화될 때마다 현재 시각 기준 페이지로 재설정한다.
  LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
    scope.launch { pagerState.scrollToPage(MealType.from(Calendar.getInstance()).ordinal) }
  }

  Box(modifier = Modifier.fillMaxSize()) {
    VerticalPager(state = pagerState, modifier = Modifier.fillMaxSize()) { page ->
      val type = types[page]
      MealCardView(mealType = type, state = states[type] ?: MealCardState.Unavailable)
    }
    Column(
      modifier = Modifier.align(Alignment.CenterEnd).padding(end = 6.dp),
      verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
      types.forEachIndexed { i, _ -> PageDot(active = i == pagerState.currentPage) }
    }
  }
}
