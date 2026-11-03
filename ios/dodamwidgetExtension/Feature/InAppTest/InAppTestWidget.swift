//
//  InAppTestWidget.swift
//  dodamwidgetExtension
//
//  미니앱 목록 표시 검증용 위젯. Debug 빌드에만 포함된다.
//

#if DEBUG
import SwiftUI
import UIKit
import WidgetKit

struct InAppTestWidget: Widget {
  let kind: String = "InAppTestWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: InAppTestProvider()) { entry in
      InAppTestWidgetView(entry: entry)
    }
    .configurationDisplayName("미니앱 테스트 (Debug)")
    .description("앱이 저장한 미니앱 목록을 보여줘요")
    .contentMarginsDisabled()
    .supportedFamilies([.systemLarge])
  }
}

/// RN의 InApp 타입 중 위젯이 쓰는 필드만 받는다.
private struct InAppItem: Decodable {
  let appId: String
  let name: String
  let subtitle: String
  let iconUrl: String
  let darkIconUrl: String?
}

struct InAppTestRow: Identifiable {
  let id: String
  let name: String
  let subtitle: String
  let icon: UIImage?
  let darkIcon: UIImage?
}

struct InAppTestEntry: TimelineEntry {
  let date: Date
  let rows: [InAppTestRow]
}

struct InAppTestProvider: TimelineProvider {
  func placeholder(in context: Context) -> InAppTestEntry {
    InAppTestEntry(date: .now, rows: [])
  }

  func getSnapshot(in context: Context, completion: @escaping (InAppTestEntry) -> Void) {
    Task { completion(await makeEntry()) }
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<InAppTestEntry>) -> Void) {
    // 목록이 바뀌면 앱이 직접 reload하므로 주기 갱신은 하지 않는다.
    Task { completion(Timeline(entries: [await makeEntry()], policy: .never)) }
  }

  private func makeEntry() async -> InAppTestEntry {
    var rows: [InAppTestRow] = []
    for item in loadInApps() {
      // 위젯에선 AsyncImage가 동작하지 않아 타임라인을 만들 때 아이콘을 미리 받아 둔다.
      async let icon = loadIcon(item.iconUrl)
      async let darkIcon = loadIcon(item.darkIconUrl)
      rows.append(InAppTestRow(id: item.appId, name: item.name, subtitle: item.subtitle, icon: await icon, darkIcon: await darkIcon))
    }
    return InAppTestEntry(date: .now, rows: rows)
  }

  private func loadInApps() -> [InAppItem] {
    guard let json = UserDefaults(suiteName: "group.com.b1nd.dodam.student.shared")?
      .string(forKey: "widgetInApps"),
          let data = json.data(using: .utf8)
    else { return [] }

    return (try? JSONDecoder().decode([InAppItem].self, from: data)) ?? []
  }

  private func loadIcon(_ urlString: String?) async -> UIImage? {
    guard let urlString, let url = URL(string: urlString),
          let (data, _) = try? await URLSession.shared.data(from: url)
    else { return nil }
    // 위젯 익스텐션은 메모리 한도가 작으므로 원본 대신 표시 크기에 맞춘 썸네일만 들고 있는다.
    return UIImage(data: data)?.preparingThumbnail(of: CGSize(width: 96, height: 96))
  }
}

struct InAppTestWidgetView: View {
  let entry: InAppTestEntry

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text("미니앱 테스트 · \(entry.rows.count)개")
        .font(.system(size: 13, weight: .bold))
        .foregroundStyle(WidgetColor.labelNormal)

      if entry.rows.isEmpty {
        Text("앱에서 미니앱 목록을 열면 여기에 표시돼요")
          .font(.system(size: 12))
          .foregroundStyle(WidgetColor.labelAlternative)
          .frame(maxWidth: .infinity, maxHeight: .infinity)
      } else {
        ForEach(entry.rows) { row in
          InAppTestCell(row: row)
        }
      }
    }
    .padding(12)
    .containerBackground(WidgetColor.backgroundNeutral, for: .widget)
  }
}

private struct InAppTestCell: View {
  let row: InAppTestRow
  @Environment(\.colorScheme) private var colorScheme

  private var icon: UIImage? {
    colorScheme == .dark ? row.darkIcon ?? row.icon : row.icon
  }

  var body: some View {
    HStack(spacing: 10) {
      Group {
        if let icon {
          Image(uiImage: icon).resizable().scaledToFill()
        } else {
          WidgetColor.backgroundNeutral
        }
      }
      .frame(width: 32, height: 32)
      .clipShape(RoundedRectangle(cornerRadius: 8))

      VStack(alignment: .leading, spacing: 2) {
        Text(row.name)
          .font(.system(size: 12, weight: .bold))
          .foregroundStyle(WidgetColor.labelNormal)
        Text(row.subtitle)
          .font(.system(size: 10))
          .foregroundStyle(WidgetColor.labelAlternative)
      }
      .lineLimit(1)
    }
    .padding(.horizontal, 10)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    .background(WidgetColor.backgroundNormal, in: RoundedRectangle(cornerRadius: 14))
  }
}
#endif
