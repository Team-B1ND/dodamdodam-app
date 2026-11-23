//
//  ChangeAppInPageIntent.swift
//  dodamwidgetExtension
//
//  앱인도담 위젯의 이전·다음 버튼. 위젯 크기마다 페이지를 따로 기억한다.
//

import AppIntents
import WidgetKit

struct ChangeAppInPageIntent: AppIntent {
  static var title: LocalizedStringResource = "앱인도담 페이지 넘기기"
  static var isDiscoverable: Bool = false

  @Parameter(title: "위젯 크기")
  var layout: String

  @Parameter(title: "이동할 페이지 수")
  var offset: Int

  init() {}

  init(layout: AppInLayout, offset: Int) {
    self.layout = layout.rawValue
    self.offset = offset
  }

  func perform() async throws -> some IntentResult {
    if let layout = AppInLayout(rawValue: layout) {
      AppInStore.movePage(for: layout, by: offset)
    }
    // 인텐트가 끝나면 WidgetKit이 이 위젯의 타임라인을 다시 만든다.
    return .result()
  }
}
