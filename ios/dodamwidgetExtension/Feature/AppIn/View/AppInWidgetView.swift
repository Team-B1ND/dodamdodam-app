//
//  AppInWidgetView.swift
//  dodamwidgetExtension
//

import SwiftUI
import WidgetKit

struct AppInWidgetView: View {
  let entry: AppInEntry
  @Environment(\.widgetFamily) private var family

  private var layout: AppInLayout { AppInLayout(family: family) }

  var body: some View {
    VStack(spacing: 12) {
      AppInHeader(showsMore: layout != .small)
      content
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    .padding(8)
    .widgetURL(widgetURL)
    .containerBackground(WidgetColor.backgroundNormal, for: .widget)
  }

  @ViewBuilder
  private var content: some View {
    switch entry.content {
    case .unavailable:
      AppInUnavailableView(
        iconSize: layout == .small ? 32 : 44,
        message: layout == .small ? "미니앱을\n불러올 수 없어요" : "미니앱을 불러올 수 없어요"
      )
    case .empty:
      AppInEmptyView(
        message: layout == .small ? "사용할 수 있는\n미니앱이 없어요" : "사용할 수 있는 미니앱이 없어요"
      )
    case .apps(let page):
      switch layout {
      case .small: AppInSmallCarousel(page: page)
      case .medium: AppInMediumCarousel(page: page)
      case .large: AppInLargeList(page: page)
      }
    }
  }

  /// 버튼·링크 밖을 눌렀을 때 열 주소. Small은 링크를 둘 수 없어 지금 보이는 미니앱을 연다.
  private var widgetURL: URL? {
    if layout == .small, case .apps(let page) = entry.content, let app = page.apps.first {
      return app.url
    }
    return AppInDeepLink.list
  }
}

private struct AppInSmallCarousel: View {
  let page: AppInPage

  var body: some View {
    HStack(spacing: 0) {
      navButton(.prev)
      Spacer(minLength: 0)
      VStack(spacing: 10) {
        if let app = page.apps.first {
          AppInTile(app: app, size: .large)
        }
        if page.hasMultiplePages {
          AppInPageIndicator(page: page)
        }
      }
      Spacer(minLength: 0)
      navButton(.next)
    }
  }

  @ViewBuilder
  private func navButton(_ direction: AppInNavButton.Direction) -> some View {
    if page.hasMultiplePages {
      AppInNavButton(direction: direction, layout: .small)
    } else {
      Color.clear.frame(width: 24, height: 24)
    }
  }
}

private struct AppInMediumCarousel: View {
  let page: AppInPage

  var body: some View {
    VStack(spacing: 12) {
      HStack(spacing: 8) {
        navButton(.prev)
        HStack(spacing: 0) {
          ForEach(0..<AppInLayout.medium.pageSize, id: \.self) { slot in
            if slot > 0 { Spacer(minLength: 0) }
            // 마지막 페이지가 덜 차도 칸 위치가 바뀌지 않게 빈 칸을 채운다.
            if slot < page.apps.count, let url = page.apps[slot].url {
              Link(destination: url) { AppInTile(app: page.apps[slot], size: .medium) }
            } else {
              Color.clear.frame(width: AppInTile.Size.medium.iconSize + 12, height: 1)
            }
          }
        }
        navButton(.next)
      }

      if page.hasMultiplePages {
        AppInPageIndicator(page: page)
      }
    }
  }

  @ViewBuilder
  private func navButton(_ direction: AppInNavButton.Direction) -> some View {
    if page.hasMultiplePages {
      AppInNavButton(direction: direction, layout: .medium)
    } else {
      Color.clear.frame(width: 24, height: 24)
    }
  }
}

private struct AppInLargeList: View {
  let page: AppInPage

  /// 페이지 바가 들어가면 다섯 줄이 함께 들어가도록 줄 높이를 줄인다.
  private var rowHeight: CGFloat { page.hasMultiplePages ? 48 : 56 }

  var body: some View {
    VStack(spacing: 0) {
      VStack(spacing: 0) {
        ForEach(0..<AppInLayout.large.pageSize, id: \.self) { slot in
          if slot > 0 { Spacer(minLength: 0) }
          if slot < page.apps.count, let url = page.apps[slot].url {
            Link(destination: url) { AppInListRow(app: page.apps[slot]) }
              .frame(height: rowHeight)
          } else {
            Color.clear.frame(height: rowHeight)
          }
        }
      }
      .frame(maxHeight: .infinity, alignment: .top)

      if page.hasMultiplePages {
        HStack(spacing: 12) {
          AppInNavButton(direction: .prev, layout: .large)
          Text("\(page.index + 1) / \(page.count)")
            .font(.system(size: 12, weight: .medium))
            .monospacedDigit()
            .foregroundStyle(WidgetColor.labelAssistive)
          AppInNavButton(direction: .next, layout: .large)
        }
        .padding(.top, 8)
      }
    }
  }
}
