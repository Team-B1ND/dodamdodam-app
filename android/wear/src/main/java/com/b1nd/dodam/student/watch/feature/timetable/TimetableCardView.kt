package com.b1nd.dodam.student.watch.feature.timetable

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Text
import com.b1nd.dodam.student.watch.shared.WatchCardEmptyText
import com.b1nd.dodam.student.watch.shared.WatchColor
import com.b1nd.dodam.student.watch.shared.WatchPageCard

@Composable
fun TimetableCardView(state: TimetableCardState, isStale: Boolean = false) {
  val badgeLabel = when (state) {
    is TimetableCardState.Loaded -> state.dayLabel
    is TimetableCardState.Weekend -> "주말"
    is TimetableCardState.Empty -> state.dayLabel
  }
  val badgeTrailingText = if (isStale && state is TimetableCardState.Loaded) "⚠️ 오래된 정보" else null

  WatchPageCard(badgeLabel = badgeLabel, badgeTrailingText = badgeTrailingText, badgeCentered = badgeTrailingText == null) {
    when (state) {
      is TimetableCardState.Loaded -> {
        Column(modifier = androidx.compose.ui.Modifier.fillMaxSize()) {
          state.periods.forEach { item ->
            val isCurrent = item.period == state.currentPeriod
            Row(
              modifier = androidx.compose.ui.Modifier.height(17.dp),
              verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
            ) {
              Text(
                text = "${item.period}교시",
                fontSize = 12.sp,
                fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Normal,
                color = if (isCurrent) WatchColor.primaryNormal else WatchColor.labelAlternative,
                modifier = androidx.compose.ui.Modifier.width(38.dp),
              )
              Text(
                text = item.subject,
                fontSize = 12.sp,
                fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Normal,
                color = if (isCurrent) WatchColor.primaryNormal else WatchColor.labelNormal,
                maxLines = 1,
              )
            }
          }
        }
      }
      is TimetableCardState.Weekend -> WatchCardEmptyText(text = "주말에는\n시간표가 없어요")
      is TimetableCardState.Empty -> WatchCardEmptyText(text = "등록된\n시간표가 없어요")
    }
  }
}
