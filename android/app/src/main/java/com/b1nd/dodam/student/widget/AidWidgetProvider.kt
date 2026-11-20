package com.b1nd.dodam.student.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.LocalSize
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.appWidgetBackground
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import com.b1nd.dodam.student.MainActivity
import com.b1nd.dodam.student.R

class AidWidgetProvider : GlanceAppWidgetReceiver() {
  override val glanceAppWidget: GlanceAppWidget = AidWidget()

  override fun onDeleted(context: Context, appWidgetIds: IntArray) {
    AidWidgetStore.delete(context, appWidgetIds)
    super.onDeleted(context, appWidgetIds)
  }
}

internal class AidWidget : GlanceAppWidget() {
  override val sizeMode = SizeMode.Exact

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    val widgetId = GlanceAppWidgetManager(context).getAppWidgetId(id)
    provideContent {
      val selected by remember(widgetId) {
        AidWidgetStore.observeSelection(context, widgetId)
      }.collectAsState(initial = AidWidgetStore.selection(context, widgetId))
      AidWidgetContent(context, widgetId, selected)
    }
  }
}

@Composable
private fun AidWidgetContent(context: Context, widgetId: Int, selected: AidWidgetApp?) {
  val compact = LocalSize.current.height < 160.dp
  val intent = if (selected == null) {
    Intent(context, AidWidgetConfigureActivity::class.java)
      .setAction(AppWidgetManager.ACTION_APPWIDGET_CONFIGURE)
      .setData(Uri.parse("dodamdodam-widget://configure/$widgetId"))
      .putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)
  } else {
    Intent(Intent.ACTION_VIEW, Uri.parse("dodamdodam://apps/${Uri.encode(selected.appId)}"), context, MainActivity::class.java)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
  }

  Column(
    modifier = GlanceModifier.fillMaxSize().appWidgetBackground()
      .background(WidgetColors.background).cornerRadius(24.dp)
      .clickable(actionStartActivity(intent)).padding(if (compact) 12.dp else 16.dp),
  ) {
    Box(
      modifier = GlanceModifier.background(WidgetColors.primary).cornerRadius(10.dp)
        .padding(horizontal = 10.dp, vertical = 4.dp),
      contentAlignment = Alignment.Center,
    ) {
      Text(context.getString(R.string.aid_widget_badge), style = TextStyle(color = WidgetColors.white, fontSize = 12.sp, fontWeight = FontWeight.Bold))
    }
    Spacer(GlanceModifier.height(if (compact) 6.dp else 12.dp))
    Text(
      selected?.name ?: context.getString(R.string.aid_widget_select),
      modifier = GlanceModifier.fillMaxWidth(),
      style = TextStyle(color = WidgetColors.label, fontSize = if (compact) 16.sp else 20.sp, fontWeight = FontWeight.Bold),
      maxLines = if (compact) 1 else 2,
    )
    Spacer(GlanceModifier.defaultWeight())
    Text(
      context.getString(if (selected == null) R.string.aid_widget_configure_hint else R.string.aid_widget_open_hint),
      style = TextStyle(color = WidgetColors.alternativeLabel, fontSize = 12.sp),
      maxLines = 1,
    )
  }
}
