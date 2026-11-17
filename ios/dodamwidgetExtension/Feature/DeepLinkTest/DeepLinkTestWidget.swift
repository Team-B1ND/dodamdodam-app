//
//  DeepLinkTestWidget.swift
//  dodamwidgetExtension
//
//  딥링크 경로 수동 검증용 위젯. Debug 빌드에만 포함된다.
//

#if DEBUG
import SwiftUI
import WidgetKit

struct DeepLinkTestWidget: Widget {
  let kind: String = "DeepLinkTestWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: DeepLinkTestProvider()) { _ in
      DeepLinkTestWidgetView()
    }
    .configurationDisplayName("딥링크 테스트 (Debug)")
    .description("dodamdodam:// 딥링크 경로를 눌러 바로 열어요")
    .contentMarginsDisabled()
    .supportedFamilies([.systemLarge])
  }
}

struct DeepLinkTestEntry: TimelineEntry {
  let date: Date
}

struct DeepLinkTestProvider: TimelineProvider {
  func placeholder(in context: Context) -> DeepLinkTestEntry {
    DeepLinkTestEntry(date: .now)
  }

  func getSnapshot(in context: Context, completion: @escaping (DeepLinkTestEntry) -> Void) {
    completion(DeepLinkTestEntry(date: .now))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<DeepLinkTestEntry>) -> Void) {
    completion(Timeline(entries: [DeepLinkTestEntry(date: .now)], policy: .never))
  }
}

private struct DeepLinkTarget: Identifiable {
  let label: String
  let path: String

  var id: String { path }
  var url: URL { URL(string: "dodamdodam://\(path)")! }
}

// src/app/navigation의 딥링크 경로와 맞춘다. Android DeepLinkTestWidgetProvider와 같은 순서를 유지한다.
private let deepLinkTargets: [DeepLinkTarget] = [
  DeepLinkTarget(label: "홈", path: "home"),
  DeepLinkTarget(label: "외박", path: "out-sleeping"),
  DeepLinkTarget(label: "심자", path: "night-study"),
  DeepLinkTarget(label: "더보기", path: "more"),
  DeepLinkTarget(label: "급식", path: "meal"),
  DeepLinkTarget(label: "알림", path: "notifications"),
  DeepLinkTarget(label: "외박 신청", path: "out-sleeping/apply"),
  DeepLinkTarget(label: "심자 신청 (개인)", path: "night-study/apply?tab=personal"),
  DeepLinkTarget(label: "심자 신청 (프로젝트)", path: "night-study/apply?tab=project"),
  DeepLinkTarget(label: "심자 신청 (잘못된 tab)", path: "night-study/apply?tab=foo"),
  DeepLinkTarget(label: "대문자 · 끝 슬래시", path: "MEAL/"),
  DeepLinkTarget(label: "미등록 경로", path: "unknown"),
]

struct DeepLinkTestWidgetView: View {
  private var rows: [[DeepLinkTarget]] {
    stride(from: 0, to: deepLinkTargets.count, by: 2).map {
      Array(deepLinkTargets[$0..<min($0 + 2, deepLinkTargets.count)])
    }
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text("딥링크 테스트")
        .font(.system(size: 13, weight: .bold))
        .foregroundStyle(WidgetColor.labelNormal)

      ForEach(rows.indices, id: \.self) { index in
        HStack(spacing: 6) {
          ForEach(rows[index]) { target in
            Link(destination: target.url) {
              DeepLinkCell(target: target)
            }
          }
        }
      }
    }
    .padding(12)
    .containerBackground(WidgetColor.backgroundNeutral, for: .widget)
  }
}

private struct DeepLinkCell: View {
  let target: DeepLinkTarget

  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text(target.label)
        .font(.system(size: 12, weight: .bold))
        .foregroundStyle(WidgetColor.labelNormal)
      Text(target.path)
        .font(.system(size: 10))
        .foregroundStyle(WidgetColor.labelAlternative)
    }
    .lineLimit(1)
    .minimumScaleFactor(0.8)
    .padding(.horizontal, 10)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    .background(WidgetColor.backgroundNormal, in: RoundedRectangle(cornerRadius: 14))
  }
}
#endif
