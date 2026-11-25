//
//  TimetableWidget.swift
//  dodamwidgetExtension
//
//  Created by 김은찬 on 3/27/26.
//

import SwiftUI
import WidgetKit

// 시간표 전용 화면이 없어 시간표 카드가 있는 홈 탭으로 연다.
// src/app/navigation/deepLinkConfig의 Home 경로와 맞춘다.
private let timetableDeepLink = URL(string: "dodamdodam://home")

struct TimetableWidget: Widget {
  let kind: String = "TimetableWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: TimetableProvider()) { entry in
      TimetableWidgetView(entry: entry)
        .widgetURL(timetableDeepLink)
    }
    .configurationDisplayName("도담도담 시간표 위젯")
    .description("오늘 또는 주간 시간표를 확인해요")
    .contentMarginsDisabled()
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}
