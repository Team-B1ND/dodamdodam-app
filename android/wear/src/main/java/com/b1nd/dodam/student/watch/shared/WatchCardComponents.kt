package com.b1nd.dodam.student.watch.shared

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.size
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text

@Composable
private fun BadgeChip(label: String) {
  Box(
    modifier = Modifier
      .background(WatchColor.primaryNormal, CircleShape)
      .padding(horizontal = 10.dp, vertical = 4.dp)
  ) {
    Text(text = label, color = androidx.compose.ui.graphics.Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
  }
}

// 피그마 기준: 시간표는 배지 가운데 정렬, 급식은 배지 왼쪽 + 칼로리 오른쪽.
@Composable
fun WatchCardBadge(label: String, trailingText: String? = null, centered: Boolean = false) {
  if (centered) {
    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
      BadgeChip(label)
    }
  } else {
    Row(
      // 원형 화면 모서리에 잘리지 않도록 좌우 인셋을 준다 (배지가 왼쪽 정렬이라 곡면에 더 가까움)
      modifier = Modifier.fillMaxWidth().padding(horizontal = 22.dp),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.SpaceBetween,
    ) {
      BadgeChip(label)
      if (trailingText != null) {
        Text(text = trailingText, color = WatchColor.labelAlternative, fontSize = 12.sp)
      }
    }
  }
}

@Composable
fun PageDot(active: Boolean) {
  Box(
    modifier = Modifier
      .size(4.dp)
      .background(if (active) WatchColor.labelNormal else WatchColor.backgroundNormal, CircleShape)
  )
}

@Composable
fun WatchCardEmptyText(text: String) {
  Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
    Text(text = text, color = WatchColor.labelNormal, fontSize = 13.sp, textAlign = TextAlign.Center, lineHeight = 17.sp)
  }
}

@Composable
fun WatchPageCard(
  badgeLabel: String,
  badgeTrailingText: String? = null,
  badgeCentered: Boolean = false,
  content: @Composable () -> Unit,
) {
  // 원형 화면은 사각 카드의 아래쪽 모서리가 곡면에 걸리기 쉬워서 위/옆보다 아래 여백을 더 준다.
  Column(
    modifier = Modifier.fillMaxSize().padding(start = 26.dp, end = 26.dp, top = 24.dp, bottom = 36.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.spacedBy(4.dp),
  ) {
    WatchCardBadge(label = badgeLabel, trailingText = badgeTrailingText, centered = badgeCentered)
    Box(
      modifier = Modifier
        .fillMaxSize()
        .background(WatchColor.backgroundNormal, RoundedCornerShape(20.dp))
        .padding(horizontal = 10.dp, vertical = 6.dp)
    ) {
      content()
    }
  }
}
