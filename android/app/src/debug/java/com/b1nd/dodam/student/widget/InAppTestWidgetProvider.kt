package com.b1nd.dodam.student.widget

import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.appWidgetBackground
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.ContentScale
import androidx.glance.layout.Row
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import com.b1nd.dodam.student.MainActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import org.json.JSONArray
import java.net.URL

// 미니앱 목록 표시와 미니앱 딥링크 검증용 위젯. debug 소스셋에만 있어 릴리스 빌드에는 포함되지 않는다.
class InAppTestWidgetProvider : GlanceAppWidgetReceiver() {
  override val glanceAppWidget: GlanceAppWidget = InAppTestWidget()
}

private data class InAppRow(val appId: String, val name: String, val subtitle: String, val icon: Bitmap?)

internal class InAppTestWidget : GlanceAppWidget() {
  override suspend fun provideGlance(context: Context, id: GlanceId) {
    val rows = loadRows(context)
    provideContent { InAppTestContent(context, rows) }
  }
}

private suspend fun loadRows(context: Context): List<InAppRow> = coroutineScope {
  val json = context.getSharedPreferences(WidgetPreferences.NAME, Context.MODE_PRIVATE)
    .getString(WidgetPreferences.INAPPS_KEY, "[]") ?: "[]"
  val isDark = (context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
  val apps = runCatching { JSONArray(json) }.getOrDefault(JSONArray())

  (0 until apps.length()).map { index ->
    val app = apps.getJSONObject(index)
    val darkIconUrl = app.optString("darkIconUrl").takeIf { isDark && it.isNotEmpty() && it != "null" }
    async {
      InAppRow(app.optString("appId"), app.optString("name"), app.optString("subtitle"), loadIcon(darkIconUrl ?: app.optString("iconUrl")))
    }
  }.awaitAll()
}

// RemoteViews로 넘기는 비트맵은 프로세스 간 전송 한도가 있어 표시 크기에 맞게 줄여 둔다.
private suspend fun loadIcon(url: String): Bitmap? = withContext(Dispatchers.IO) {
  runCatching {
    URL(url).openStream().use { BitmapFactory.decodeStream(it) }
      ?.let { Bitmap.createScaledBitmap(it, 96, 96, true) }
  }.getOrNull()
}

@Composable
private fun InAppTestContent(context: Context, rows: List<InAppRow>) {
  Column(
    modifier = GlanceModifier.fillMaxSize().appWidgetBackground().background(WidgetColors.background).cornerRadius(24.dp).padding(12.dp)
      .clickable(actionStartActivity(Intent(context, MainActivity::class.java))),
  ) {
    Text("미니앱 테스트 · ${rows.size}개", style = TextStyle(color = WidgetColors.label, fontSize = 13.sp, fontWeight = FontWeight.Bold))
    if (rows.isEmpty()) {
      Box(modifier = GlanceModifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("앱에서 미니앱 목록을 열면 여기에 표시돼요", style = TextStyle(color = WidgetColors.alternativeLabel, fontSize = 12.sp))
      }
    } else {
      // Glance의 Column은 자식이 10개를 넘으면 잘리므로 간격은 Spacer 대신 padding으로 준다.
      rows.forEach { row ->
        InAppCell(context, row, GlanceModifier.fillMaxWidth().defaultWeight().padding(top = 6.dp))
      }
    }
  }
}

@Composable
private fun InAppCell(context: Context, row: InAppRow, modifier: GlanceModifier) {
  // src/app/navigation/deepLinkConfig의 InAppLaunch 경로와 맞춘다.
  val intent = Intent(Intent.ACTION_VIEW, Uri.parse("dodamdodam://apps/${Uri.encode(row.appId)}"), context, MainActivity::class.java)
  Box(modifier = modifier.clickable(actionStartActivity(intent))) {
    Row(
      modifier = GlanceModifier.fillMaxSize().background(WidgetColors.card).cornerRadius(14.dp).padding(horizontal = 10.dp),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      if (row.icon != null) {
        Image(
          provider = ImageProvider(row.icon),
          contentDescription = row.name,
          contentScale = ContentScale.Crop,
          modifier = GlanceModifier.size(32.dp).cornerRadius(8.dp),
        )
      } else {
        Box(modifier = GlanceModifier.size(32.dp).background(WidgetColors.background).cornerRadius(8.dp)) {}
      }
      Column(modifier = GlanceModifier.padding(start = 10.dp)) {
        Text(row.name, style = TextStyle(color = WidgetColors.label, fontSize = 12.sp, fontWeight = FontWeight.Bold), maxLines = 1)
        Text(row.subtitle, style = TextStyle(color = WidgetColors.alternativeLabel, fontSize = 10.sp), maxLines = 1)
      }
    }
  }
}
