//
//  AppInStore.swift
//  dodamwidgetExtension
//
//  App Group에 저장된 미니앱 목록과 위젯 크기별 현재 페이지를 읽고 쓴다.
//

import Foundation

enum AppInStore {
  private static let defaults = UserDefaults(suiteName: "group.com.b1nd.dodam.student.shared")
  // RNInAppWidgetModule이 저장하는 키와 맞춘다.
  private static let appsKey = "widgetInApps"

  static func loadApps() -> [AppInItem] {
    guard let json = defaults?.string(forKey: appsKey),
          let data = json.data(using: .utf8)
    else { return [] }

    return (try? JSONDecoder().decode([AppInItem].self, from: data)) ?? []
  }

  static func pageCount(itemCount: Int, layout: AppInLayout) -> Int {
    max(1, (itemCount + layout.pageSize - 1) / layout.pageSize)
  }

  /// 목록이 줄어 저장된 페이지가 범위를 벗어나면 마지막 페이지로 맞춘다.
  static func page(for layout: AppInLayout, itemCount: Int) -> Int {
    let saved = defaults?.integer(forKey: pageKey(layout)) ?? 0
    return min(max(saved, 0), pageCount(itemCount: itemCount, layout: layout) - 1)
  }

  /// 끝에서 넘기면 반대쪽 끝으로 돌아간다.
  static func movePage(for layout: AppInLayout, by offset: Int) {
    let itemCount = loadApps().count
    let count = pageCount(itemCount: itemCount, layout: layout)
    let current = page(for: layout, itemCount: itemCount)
    let next = ((current + offset) % count + count) % count
    defaults?.set(next, forKey: pageKey(layout))
  }

  private static func pageKey(_ layout: AppInLayout) -> String {
    "appInWidgetPage.\(layout.rawValue)"
  }
}
