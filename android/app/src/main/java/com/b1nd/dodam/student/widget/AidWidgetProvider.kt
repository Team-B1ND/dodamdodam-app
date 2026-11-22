package com.b1nd.dodam.student.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.graphics.Bitmap
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.glance.ColorFilter
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.LocalSize
import androidx.glance.action.ActionParameters
import androidx.glance.action.actionParametersOf
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.ActionCallback
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.appWidgetBackground
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.appwidget.state.updateAppWidgetState
import androidx.glance.background
import androidx.glance.color.ColorProvider
import androidx.glance.currentState
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.ContentScale
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.state.PreferencesGlanceStateDefinition
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextAlign
import androidx.glance.text.TextStyle
import com.b1nd.dodam.student.MainActivity
import com.b1nd.dodam.student.R

private val buttonFill = ColorProvider(Color(0xFFE6E6E7), Color(0xFF383A3B))
private val buttonIcon = ColorProvider(Color(0xFF5D5F60), Color(0xFFDCDDDE))
private val iconFill = ColorProvider(Color(0xFFDCDDDE), Color(0xFF48494A))
private val assistiveLabel = ColorProvider(Color(0xFF5D5F60), Color(0xFF9B9D9F))
private val pagePreference = intPreferencesKey("aid_page")
private val requestedPage = ActionParameters.Key<Int>("page")

class AidWidgetProvider : GlanceAppWidgetReceiver() {
  override val glanceAppWidget: GlanceAppWidget = AidWidget()

  override fun onDeleted(context: Context, appWidgetIds: IntArray) {
    AidWidgetStore.delete(context, appWidgetIds)
    super.onDeleted(context, appWidgetIds)
  }
}

internal class AidWidget : GlanceAppWidget() {
  override val sizeMode = SizeMode.Exact
  override val stateDefinition = PreferencesGlanceStateDefinition

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    val widgetId = GlanceAppWidgetManager(context).getAppWidgetId(id)
    provideContent {
      val data by remember(widgetId) {
        AidWidgetStore.observe(context, widgetId)
      }.collectAsState(initial = AidWidgetStore.data(context, widgetId))
      AidWidgetContent(context, widgetId, data, currentState(pagePreference) ?: 0)
    }
  }

  companion object {
    suspend fun resetPage(context: Context, id: GlanceId) {
      updateAppWidgetState(context, id) { it.remove(pagePreference) }
    }
  }
}

internal class SelectAidWidgetPage : ActionCallback {
  override suspend fun onAction(context: Context, glanceId: GlanceId, parameters: ActionParameters) {
    val page = parameters[requestedPage] ?: return
    updateAppWidgetState(context, glanceId) { it[pagePreference] = page }
    AidWidget().update(context, glanceId)
  }
}

private fun openDodam(context: Context, path: String): Intent =
  Intent(Intent.ACTION_VIEW, Uri.parse("dodamdodam://$path"), context, MainActivity::class.java)
    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)

private fun openApp(context: Context, app: AidWidgetApp) = openDodam(context, "apps/${Uri.encode(app.appId)}")

@Composable
private fun AidWidgetContent(context: Context, widgetId: Int, data: AidWidgetData, savedPage: Int) {
  val size = LocalSize.current
  val base = GlanceModifier.fillMaxSize().appWidgetBackground()
    .background(WidgetColors.card).cornerRadius(22.dp)
  if (size.width < 110.dp || size.height < 142.dp) {
    Shortcut(context, widgetId, data.selected, base)
    return
  }

  val wide = size.width >= 280.dp
  val large = wide && size.height >= 280.dp
  val apps = data.apps.sortedBy { it.appId != data.selected?.appId }

  Column(modifier = base.padding(8.dp)) {
    Header(context, showMore = wide)
    Spacer(GlanceModifier.height(12.dp))
    Box(modifier = GlanceModifier.fillMaxWidth().defaultWeight(), contentAlignment = Alignment.Center) {
      when {
        apps.isEmpty() -> EmptyContent(context, wide)
        large -> AppList(context, apps)
        else -> Carousel(context, apps, savedPage, wide)
      }
    }
  }
}

@Composable
private fun Shortcut(context: Context, widgetId: Int, app: AidWidgetApp?, modifier: GlanceModifier) {
  val label = app?.name ?: context.getString(R.string.aid_widget_select)
  val intent = if (app != null) openApp(context, app) else {
    Intent(context, AidWidgetConfigureActivity::class.java)
      .setAction(AppWidgetManager.ACTION_APPWIDGET_CONFIGURE)
      .setData(Uri.parse("dodamdodam-widget://configure/$widgetId"))
      .putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)
  }
  val size = LocalSize.current
  Box(
    modifier = modifier.clickable(actionStartActivity(intent)).padding(6.dp),
    contentAlignment = Alignment.Center,
  ) {
    if (app == null) {
      Text(label, style = TextStyle(color = WidgetColors.label, fontSize = 12.sp, textAlign = TextAlign.Center), maxLines = 2)
    } else {
      val iconSize = (minOf(size.width, size.height) - 12.dp).coerceIn(1.dp, 56.dp)
      AppIcon(context, app, iconSize, 12.dp, showNameIfMissing = true)
    }
  }
}

@Composable
private fun Header(context: Context, showMore: Boolean) {
  Row(modifier = GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
    Box(modifier = GlanceModifier.background(WidgetColors.primary).cornerRadius(100.dp).padding(horizontal = 10.dp, vertical = 2.dp)) {
      Text(context.getString(R.string.aid_widget_badge), style = TextStyle(color = WidgetColors.white, fontSize = 14.sp))
    }
    if (showMore) {
      Spacer(GlanceModifier.defaultWeight())
      Row(
        modifier = GlanceModifier.height(24.dp).clickable(actionStartActivity(openDodam(context, "aid"))),
        verticalAlignment = Alignment.CenterVertically,
      ) {
        Text(context.getString(R.string.aid_widget_all), style = TextStyle(color = assistiveLabel, fontSize = 12.sp))
        Spacer(GlanceModifier.width(2.dp))
        Image(ImageProvider(R.drawable.aid_widget_more), null, GlanceModifier.size(12.dp), colorFilter = ColorFilter.tint(assistiveLabel))
      }
    }
  }
}

@Composable
private fun Carousel(context: Context, apps: List<AidWidgetApp>, savedPage: Int, wide: Boolean) {
  val pages = apps.chunked(if (wide) 4 else 1)
  val page = savedPage.coerceIn(0, pages.lastIndex)
  Column(
    modifier = GlanceModifier.fillMaxSize(),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalAlignment = Alignment.CenterVertically,
  ) {
    Row(modifier = GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
      PageButton(context, if (page == 0) pages.lastIndex else page - 1, previous = true, enabled = pages.size > 1)
      Row(modifier = GlanceModifier.defaultWeight(), verticalAlignment = Alignment.CenterVertically) {
        pages[page].forEach { app ->
          Column(
            modifier = GlanceModifier.defaultWeight().clickable(actionStartActivity(openApp(context, app))),
            horizontalAlignment = Alignment.CenterHorizontally,
          ) {
            AppIcon(context, app, if (wide) 48.dp else 56.dp, if (wide) 12.dp else 14.dp)
            Spacer(GlanceModifier.height(if (wide) 6.dp else 8.dp))
            Text(app.name, style = TextStyle(color = WidgetColors.label, fontSize = if (wide) 11.sp else 13.sp, textAlign = TextAlign.Center), maxLines = 1)
          }
        }
        repeat(if (wide) 4 - pages[page].size else 0) { Spacer(GlanceModifier.defaultWeight()) }
      }
      PageButton(context, (page + 1) % pages.size, previous = false, enabled = pages.size > 1)
    }
    Spacer(GlanceModifier.height(if (wide) 12.dp else 10.dp))
    PageDots(page, pages.size)
  }
}

@Composable
private fun PageButton(context: Context, target: Int, previous: Boolean, enabled: Boolean) {
  val label = context.getString(if (previous) R.string.aid_widget_previous else R.string.aid_widget_next)
  val asset = if (previous) R.drawable.aid_widget_left else R.drawable.aid_widget_right
  val hitArea = if (enabled) GlanceModifier.clickable(actionRunCallback<SelectAidWidgetPage>(actionParametersOf(requestedPage to target))) else GlanceModifier
  Box(modifier = hitArea.width(32.dp).height(48.dp), contentAlignment = Alignment.Center) {
    Box(modifier = GlanceModifier.size(24.dp).background(buttonFill).cornerRadius(12.dp), contentAlignment = Alignment.Center) {
      Image(ImageProvider(asset), if (enabled) label else null, GlanceModifier.size(14.dp), colorFilter = ColorFilter.tint(buttonIcon))
    }
  }
}

@Composable
private fun PageDots(page: Int, count: Int) {
  val start = (page - 2).coerceIn(0, (count - 5).coerceAtLeast(0))
  Row(horizontalAlignment = Alignment.CenterHorizontally) {
    for (index in start until minOf(start + 5, count)) {
      if (index > start) Spacer(GlanceModifier.width(5.dp))
      Box(modifier = GlanceModifier.size(5.dp).background(if (index == page) WidgetColors.primary else iconFill).cornerRadius(3.dp)) {}
    }
  }
}

@Composable
private fun AppList(context: Context, apps: List<AidWidgetApp>) {
  val rowCount = ((LocalSize.current.height.value - 52) / 56).toInt().coerceIn(1, 5)
  val visibleApps = apps.take(rowCount)
  Column(modifier = GlanceModifier.fillMaxSize()) {
    visibleApps.forEachIndexed { index, app ->
      if (index > 0) Spacer(GlanceModifier.defaultWeight())
      Row(
        modifier = GlanceModifier.fillMaxWidth().height(56.dp).clickable(actionStartActivity(openApp(context, app))),
        verticalAlignment = Alignment.CenterVertically,
      ) {
        AppIcon(context, app, 40.dp, 10.dp)
        Spacer(GlanceModifier.width(12.dp))
        Column(modifier = GlanceModifier.defaultWeight()) {
          Text(app.name, style = TextStyle(color = WidgetColors.label, fontSize = 14.sp, fontWeight = FontWeight.Bold), maxLines = 1)
          if (app.subtitle.isNotBlank()) {
            Spacer(GlanceModifier.height(2.dp))
            Text(app.subtitle, style = TextStyle(color = assistiveLabel, fontSize = 12.sp), maxLines = 1)
          }
        }
        Image(ImageProvider(R.drawable.aid_widget_row), null, GlanceModifier.size(16.dp), colorFilter = ColorFilter.tint(assistiveLabel))
      }
    }
  }
}

@Composable
private fun EmptyContent(context: Context, wide: Boolean) {
  val size = if (wide) 44.dp else 32.dp
  Column(
    modifier = GlanceModifier.fillMaxSize().clickable(actionStartActivity(openDodam(context, "aid"))),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalAlignment = Alignment.CenterVertically,
  ) {
    Box(modifier = GlanceModifier.size(size + 2.dp), contentAlignment = Alignment.BottomEnd) {
      Box(modifier = GlanceModifier.fillMaxSize().background(buttonFill).cornerRadius(size / 4)) {}
      Box(modifier = GlanceModifier.size(size * .45f), contentAlignment = Alignment.Center) {
        Image(ImageProvider(R.drawable.aid_widget_ring), null, GlanceModifier.fillMaxSize(), colorFilter = ColorFilter.tint(WidgetColors.card))
        Box(modifier = GlanceModifier.size(size * .16f).background(WidgetColors.white)) {}
        Image(ImageProvider(R.drawable.aid_widget_warn), null, GlanceModifier.size(size * .29f))
      }
    }
    Spacer(GlanceModifier.height(if (wide) 8.dp else 6.dp))
    Text(
      context.getString(if (wide) R.string.aid_widget_empty_message else R.string.aid_widget_empty_message_small),
      style = TextStyle(color = WidgetColors.alternativeLabel, fontSize = if (wide) 13.sp else 12.sp, textAlign = TextAlign.Center),
    )
    Spacer(GlanceModifier.height(6.dp))
    Text(context.getString(R.string.aid_widget_retry), style = TextStyle(color = assistiveLabel, fontSize = 11.sp))
  }
}

@Composable
private fun AppIcon(context: Context, app: AidWidgetApp, size: Dp, radius: Dp, showNameIfMissing: Boolean = false) {
  val dark = (context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
  val darkUrl = app.darkIconUrl.takeIf { dark }
  key(app.appId, darkUrl, app.iconUrl) {
    val icon by produceState<Bitmap?>(null) {
      value = darkUrl?.let { AidWidgetIcons.load(context, it) } ?: app.iconUrl?.let { AidWidgetIcons.load(context, it) }
    }
    val bitmap = icon
    if (bitmap != null) {
      Image(ImageProvider(bitmap), if (showNameIfMissing) app.name else null, GlanceModifier.size(size).cornerRadius(radius), contentScale = ContentScale.Crop)
    } else if (showNameIfMissing) {
      Text(app.name, style = TextStyle(color = WidgetColors.label, fontSize = 12.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center), maxLines = 2)
    } else {
      Box(modifier = GlanceModifier.size(size).background(iconFill).cornerRadius(radius)) {}
    }
  }
}
