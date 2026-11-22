//
//  MealWidget.swift
//  dodamwidgetExtension
//
//  Created by 김은찬 on 3/27/26.
//

import SwiftUI
import WidgetKit

// src/app/navigation/deepLinkConfig의 Meal 경로와 맞춘다.
private let mealDeepLink = URL(string: "dodamdodam://meal")

struct MealWidget: Widget {
  let kind: String = "MealWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: MealProvider()) { entry in
      // 식사 선택 버튼은 그대로 위젯 안에서 동작하고, 나머지 영역을 누르면 급식 화면이 열린다.
      MealWidgetView(entry: entry)
        .widgetURL(mealDeepLink)
    }
    .configurationDisplayName("도담도담 급식 위젯")
    .description("오늘의 급식 정보를 확인해보세요!")
    .supportedFamilies([.systemSmall, .systemMedium])
    .contentMarginsDisabled()
  }
}
