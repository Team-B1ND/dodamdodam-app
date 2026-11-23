//
//  AppInWidget.swift
//  dodamwidgetExtension
//
//  앱인도담 미니앱을 홈 화면에서 바로 여는 위젯.
//  Figma: 도담도담 > App In Dodam Widget / Deep link
//

import SwiftUI
import WidgetKit

struct AppInWidget: Widget {
  // RNInAppWidgetModule이 목록을 저장한 뒤 이 kind로 갱신한다.
  let kind: String = "AppInWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: AppInProvider()) { entry in
      AppInWidgetView(entry: entry)
    }
    .configurationDisplayName("앱인도담")
    .description("미니앱을 위젯에서 바로 열어요")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    .contentMarginsDisabled()
  }
}
