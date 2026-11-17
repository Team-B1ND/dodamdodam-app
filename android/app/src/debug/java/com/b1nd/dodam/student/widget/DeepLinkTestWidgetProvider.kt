package com.b1nd.dodam.student.widget

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.appWidgetBackground
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxHeight
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import com.b1nd.dodam.student.MainActivity

// 딥링크 경로 수동 검증용 위젯. debug 소스셋에만 있어 릴리스 빌드에는 포함되지 않는다.
class DeepLinkTestWidgetProvider : GlanceAppWidgetReceiver() {
  override val glanceAppWidget: GlanceAppWidget = DeepLinkTestWidget()
}

private data class DeepLinkTarget(val label: String, val path: String)

// src/app/navigation의 딥링크 경로와 맞춘다. iOS DeepLinkTestWidget과 같은 순서를 유지한다.
private val DEEP_LINK_TARGETS = listOf(
  DeepLinkTarget("홈", "home"),
  DeepLinkTarget("외박", "out-sleeping"),
  DeepLinkTarget("심자", "night-study"),
  DeepLinkTarget("더보기", "more"),
  DeepLinkTarget("급식", "meal"),
  DeepLinkTarget("알림", "notifications"),
  DeepLinkTarget("외박 신청", "out-sleeping/apply"),
  DeepLinkTarget("심자 신청 (개인)", "night-study/apply?tab=personal"),
  DeepLinkTarget("심자 신청 (프로젝트)", "night-study/apply?tab=project"),
  DeepLinkTarget("심자 신청 (잘못된 tab)", "night-study/apply?tab=foo"),
  DeepLinkTarget("대문자 · 끝 슬래시", "MEAL/"),
  DeepLinkTarget("미등록 경로", "unknown"),
)

internal class DeepLinkTestWidget : GlanceAppWidget() {
  override suspend fun provideGlance(context: Context, id: GlanceId) {
    provideContent { DeepLinkTestContent(context) }
  }
}

// Glance의 Column/Row는 자식이 10개를 넘으면 잘리므로 간격은 Spacer 대신 padding으로 준다.
@Composable
private fun DeepLinkTestContent(context: Context) {
  Column(
    modifier = GlanceModifier.fillMaxSize().appWidgetBackground().background(WidgetColors.background).cornerRadius(24.dp).padding(12.dp),
  ) {
    Text("딥링크 테스트", style = TextStyle(color = WidgetColors.label, fontSize = 13.sp, fontWeight = FontWeight.Bold))
    Spacer(GlanceModifier.height(2.dp))
    DEEP_LINK_TARGETS.chunked(2).forEach { row ->
      Row(modifier = GlanceModifier.fillMaxWidth().defaultWeight().padding(top = 6.dp)) {
        row.forEachIndexed { index, target ->
          if (index > 0) Spacer(GlanceModifier.width(6.dp))
          DeepLinkCell(context, target, GlanceModifier.defaultWeight().fillMaxHeight())
        }
      }
    }
  }
}

@Composable
private fun DeepLinkCell(context: Context, target: DeepLinkTarget, modifier: GlanceModifier) {
  val intent = Intent(Intent.ACTION_VIEW, Uri.parse("dodamdodam://${target.path}"), context, MainActivity::class.java)
  Column(
    modifier = modifier
      .background(WidgetColors.card)
      .cornerRadius(14.dp)
      .padding(horizontal = 10.dp, vertical = 4.dp)
      .clickable(actionStartActivity(intent)),
    verticalAlignment = Alignment.CenterVertically,
  ) {
    Text(target.label, style = TextStyle(color = WidgetColors.label, fontSize = 12.sp, fontWeight = FontWeight.Bold), maxLines = 1)
    Text(target.path, style = TextStyle(color = WidgetColors.alternativeLabel, fontSize = 10.sp), maxLines = 1)
  }
}
