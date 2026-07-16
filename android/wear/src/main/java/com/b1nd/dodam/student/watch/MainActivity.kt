package com.b1nd.dodam.student.watch

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import com.b1nd.dodam.student.watch.feature.meal.MealPagerView
import com.b1nd.dodam.student.watch.feature.timetable.TimetableCardView
import com.b1nd.dodam.student.watch.shared.PageDot
import com.b1nd.dodam.student.watch.shared.WatchDataRepository
import kotlinx.coroutines.delay
import java.util.Calendar

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    WatchDataRepository.init(applicationContext)
    setContent { DodamWatchApp() }
  }
}

@Composable
private fun DodamWatchApp() {
  // 워치가 새 데이터를 받을 때마다 재구성되도록 구독
  val timetableJson by WatchDataRepository.timetableJson.collectAsState()
  val mealsJson by WatchDataRepository.mealsJson.collectAsState()

  // SwiftUI의 TimelineView(.everyMinute)와 동일: 매 분마다 재계산되도록 tick
  val tick by produceState(initialValue = System.currentTimeMillis()) {
    while (true) {
      delay(60_000)
      value = System.currentTimeMillis()
    }
  }

  val now = Calendar.getInstance().apply { timeInMillis = tick }
  val pageCount = 2
  val pagerState = rememberPagerState(initialPage = 0) { pageCount }

  Box(modifier = Modifier.fillMaxSize()) {
    HorizontalPager(state = pagerState, modifier = Modifier.fillMaxSize()) { page ->
      when (page) {
        0 -> TimetableCardView(
          state = WatchDataRepository.timetableState(now),
          isStale = WatchDataRepository.isTimetableStale(),
        )
        else -> MealPagerView(states = WatchDataRepository.mealStates(now))
      }
    }
    Row(
      modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 6.dp),
      horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
      repeat(pageCount) { i -> PageDot(active = i == pagerState.currentPage) }
    }
  }
}
