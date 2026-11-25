//
//  AppInProvider.swift
//  dodamwidgetExtension
//

import UIKit
import WidgetKit

struct AppInProvider: TimelineProvider {
  func placeholder(in context: Context) -> AppInEntry {
    AppInEntry(date: .now, content: .apps(.sample(AppInLayout(family: context.family))))
  }

  func getSnapshot(in context: Context, completion: @escaping (AppInEntry) -> Void) {
    Task {
      let entry = await makeEntry(layout: AppInLayout(family: context.family))
      // 위젯 갤러리에서는 표시할 앱이 없어도 실제 모습을 미리 보여준다.
      if context.isPreview {
        if case .apps = entry.content {
          completion(entry)
        } else {
          completion(placeholder(in: context))
        }
      } else {
        completion(entry)
      }
    }
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<AppInEntry>) -> Void) {
    // 목록이 바뀌면 앱이, 페이지를 넘기면 인텐트가 갱신하므로 주기 갱신은 하지 않는다.
    Task {
      let entry = await makeEntry(layout: AppInLayout(family: context.family))
      completion(Timeline(entries: [entry], policy: .never))
    }
  }

  private func makeEntry(layout: AppInLayout) async -> AppInEntry {
    guard let items = AppInStore.loadApps() else {
      return AppInEntry(date: .now, content: .unavailable)
    }
    guard !items.isEmpty else {
      return AppInEntry(date: .now, content: .empty)
    }

    let index = AppInStore.page(for: layout, itemCount: items.count)
    let start = index * layout.pageSize
    let pageItems = Array(items[start..<min(start + layout.pageSize, items.count)])

    let page = AppInPage(
      apps: await loadApps(pageItems),
      index: index,
      count: AppInStore.pageCount(itemCount: items.count, layout: layout)
    )
    return AppInEntry(date: .now, content: .apps(page))
  }

  /// 위젯에선 AsyncImage가 동작하지 않아 지금 페이지의 아이콘만 미리 받아 둔다.
  private func loadApps(_ items: [AppInItem]) async -> [AppInApp] {
    await withTaskGroup(of: (Int, AppInApp).self) { group in
      for (offset, item) in items.enumerated() {
        group.addTask {
          async let icon = loadIcon(item.iconUrl)
          async let darkIcon = loadIcon(item.darkIconUrl)
          let app = AppInApp(
            id: item.appId,
            name: item.name,
            subtitle: item.subtitle,
            icon: await icon,
            darkIcon: await darkIcon
          )
          return (offset, app)
        }
      }

      var apps = [AppInApp?](repeating: nil, count: items.count)
      for await (offset, app) in group { apps[offset] = app }
      return apps.compactMap { $0 }
    }
  }

  private func loadIcon(_ urlString: String?) async -> UIImage? {
    guard let urlString, let url = URL(string: urlString),
          let (data, _) = try? await URLSession.shared.data(from: url)
    else { return nil }
    // 위젯 익스텐션은 메모리 한도가 작으므로 원본 대신 표시 크기에 맞춘 썸네일만 들고 있는다.
    return UIImage(data: data)?.preparingThumbnail(of: AppInLayout.iconPixelSize)
  }
}
