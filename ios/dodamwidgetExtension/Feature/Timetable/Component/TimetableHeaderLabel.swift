//
//  TimetableHeaderLabel.swift
//  dodamwidgetExtension
//
//  Created by 김은찬 on 3/27/26.
//

import SwiftUI
import WidgetKit

struct TimetableHeaderLabel: View {
  let label: String

  @Environment(\.widgetRenderingMode) var widgetRenderingMode

  private var isFullColor: Bool { widgetRenderingMode == .fullColor }

  var body: some View {
    // 투명(악센트) 모드에서는 단색 배경이 흰 덩어리로 렌더링되므로, 급식 위젯 칩처럼 테두리만 표시한다.
    Text(label)
      .foregroundColor(isFullColor ? .white : WidgetColor.labelAlternative)
      .padding(.horizontal, 10)
      .padding(.vertical, 4)
      .background(isFullColor ? WidgetColor.primaryNormal : Color.clear)
      .clipShape(Capsule())
      .overlay(
        Capsule()
          .strokeBorder(WidgetColor.primaryNormal, lineWidth: 1.5)
          .opacity(isFullColor ? 0 : 1)
      )
      .font(.footnote.bold())
      .widgetAccentable(true)
  }
}
