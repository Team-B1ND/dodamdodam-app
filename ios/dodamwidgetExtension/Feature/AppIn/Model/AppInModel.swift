//
//  AppInModel.swift
//  dodamwidgetExtension
//
//  앱인도담 위젯이 표시하는 미니앱 목록과 페이지 상태.
//

import UIKit
import WidgetKit

/// 위젯 크기별 배치. 한 페이지에 보여줄 미니앱 수와 페이지 저장 키를 정한다.
enum AppInLayout: String {
  case small
  case medium
  case large

  init(family: WidgetFamily) {
    switch family {
    case .systemMedium: self = .medium
    case .systemLarge: self = .large
    default: self = .small
    }
  }

  var pageSize: Int {
    switch self {
    case .small: 1
    case .medium: 4
    case .large: 5
    }
  }

  /// 아이콘을 받아 둘 픽셀 크기. 가장 큰 표시 크기(56pt)의 3배.
  static let iconPixelSize = CGSize(width: 168, height: 168)
}

/// RN의 InApp 타입 중 위젯이 쓰는 필드만 받는다.
struct AppInItem: Decodable {
  let appId: String
  let name: String
  let subtitle: String
  let iconUrl: String
  let darkIconUrl: String?
}

struct AppInApp: Identifiable {
  let id: String
  let name: String
  let subtitle: String
  let icon: UIImage?
  let darkIcon: UIImage?

  // src/app/navigation/deepLinkConfig의 InAppLaunch 경로와 맞춘다.
  var url: URL? {
    id.addingPercentEncoding(withAllowedCharacters: .alphanumerics)
      .flatMap { URL(string: "dodamdodam://apps/\($0)") }
  }
}

struct AppInPage {
  let apps: [AppInApp]
  let index: Int
  let count: Int

  var hasMultiplePages: Bool { count > 1 }
}

struct AppInEntry: TimelineEntry {
  enum Content {
    case apps(AppInPage)
    case unavailable
  }

  let date: Date
  let content: Content
}

enum AppInDeepLink {
  // src/app/navigation/deepLinkConfig의 Main > Aid 경로와 맞춘다.
  static let list = URL(string: "dodamdodam://aid")!
}

extension AppInPage {
  /// 위젯 갤러리와 placeholder에서 쓰는 예시 목록.
  static func sample(_ layout: AppInLayout) -> AppInPage {
    let samples = [
      ("외박관리", "외출·외박을 신청하고 확인해요"),
      ("심자관리", "심야 자습을 신청하고 관리해요"),
      ("기상송", "듣고 싶은 기상송을 신청해요"),
      ("모주", "미니앱 한 줄 설명이 들어가요"),
      ("낙강수", "미니앱 한 줄 설명이 들어가요"),
    ]
    let apps = samples.prefix(layout.pageSize).map {
      AppInApp(id: $0.0, name: $0.0, subtitle: $0.1, icon: nil, darkIcon: nil)
    }
    return AppInPage(apps: Array(apps), index: 0, count: 3)
  }
}
