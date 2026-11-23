//
//  AppInComponents.swift
//  dodamwidgetExtension
//
//  Figma "App In Dodam Widget / Deep link"의 공통 요소.
//

import SwiftUI
import WidgetKit

/// "앱인도담" 라벨과 오른쪽 "전체보기" 링크.
struct AppInHeader: View {
  var showsMore = true

  var body: some View {
    HStack {
      Text("앱인도담")
        .font(.system(size: 14, weight: .medium))
        .tracking(0.28)
        .foregroundStyle(.white)
        .padding(.horizontal, 10)
        .padding(.vertical, 2)
        .background(WidgetColor.primaryNormal, in: Capsule())

      Spacer(minLength: 0)

      if showsMore {
        Link(destination: AppInDeepLink.list) {
          HStack(spacing: 2) {
            Text("전체보기")
              .font(.system(size: 12, weight: .medium))
            Image(systemName: "chevron.right")
              .font(.system(size: 10, weight: .semibold))
              .frame(width: 12, height: 12)
          }
          .foregroundStyle(WidgetColor.labelAssistive)
        }
      }
    }
    .frame(height: 24)
  }
}

/// 이전·다음 페이지 버튼. 누르면 위젯 안에서 페이지가 넘어간다.
struct AppInNavButton: View {
  enum Direction {
    case prev
    case next

    var offset: Int { self == .prev ? -1 : 1 }
    var symbol: String { self == .prev ? "chevron.left" : "chevron.right" }
  }

  let direction: Direction
  let layout: AppInLayout

  var body: some View {
    Button(intent: ChangeAppInPageIntent(layout: layout, offset: direction.offset)) {
      Image(systemName: direction.symbol)
        .font(.system(size: 10, weight: .heavy))
        .foregroundStyle(WidgetColor.labelNeutral)
        .frame(width: 24, height: 24)
        .background(WidgetColor.fillNeutral, in: Circle())
    }
    .buttonStyle(.plain)
  }
}

struct AppInPageIndicator: View {
  /// 점 5개(45pt)를 넘으면 Small 위젯에서 좌우 이동 버튼이 잘릴 수 있어 숫자 표기로 바꾼다.
  private static let maxDotCount = 5

  let page: AppInPage

  var body: some View {
    if page.count <= Self.maxDotCount {
      HStack(spacing: 5) {
        ForEach(0..<page.count, id: \.self) { index in
          Circle()
            .fill(index == page.index ? WidgetColor.primaryNormal : WidgetColor.fillAlternative)
            .frame(width: 5, height: 5)
        }
      }
    } else {
      Text("\(page.index + 1) / \(page.count)")
        .font(.system(size: 11, weight: .medium))
        .monospacedDigit()
        .foregroundStyle(WidgetColor.labelAssistive)
        .lineLimit(1)
        .fixedSize()
    }
  }
}

/// 미니앱 아이콘. 아이콘을 못 받았으면 회색 자리 표시자를 그린다.
struct AppInIcon: View {
  let app: AppInApp
  let size: CGFloat
  let cornerRadius: CGFloat
  @Environment(\.colorScheme) private var colorScheme

  private var image: UIImage? {
    colorScheme == .dark ? app.darkIcon ?? app.icon : app.icon
  }

  var body: some View {
    Group {
      if let image {
        Image(uiImage: image).resizable().scaledToFill()
      } else {
        WidgetColor.fillAlternative
      }
    }
    .frame(width: size, height: size)
    .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
  }
}

/// 아이콘 아래에 이름이 붙은 미니앱 칸. Small(large 크기)·Medium(medium 크기)에서 쓴다.
struct AppInTile: View {
  enum Size {
    case medium
    case large

    var iconSize: CGFloat { self == .large ? 56 : 48 }
    var cornerRadius: CGFloat { self == .large ? 14 : 12 }
    var fontSize: CGFloat { self == .large ? 13 : 11 }
  }

  let app: AppInApp
  let size: Size

  var body: some View {
    VStack(spacing: 6) {
      AppInIcon(app: app, size: size.iconSize, cornerRadius: size.cornerRadius)
      Text(app.name)
        .font(.system(size: size.fontSize, weight: .medium))
        .foregroundStyle(WidgetColor.labelNormal)
        .lineLimit(1)
    }
    // 이름이 아이콘보다 조금 길어도 잘리지 않게 칸 너비를 아이콘보다 넓게 잡는다.
    .frame(width: size.iconSize + 12)
  }
}

/// Large 목록의 한 줄.
struct AppInListRow: View {
  let app: AppInApp

  var body: some View {
    HStack(spacing: 12) {
      AppInIcon(app: app, size: 40, cornerRadius: 10)

      VStack(alignment: .leading, spacing: 2) {
        Text(app.name)
          .font(.system(size: 14, weight: .bold))
          .foregroundStyle(WidgetColor.labelNormal)
        Text(app.subtitle)
          .font(.system(size: 12))
          .foregroundStyle(WidgetColor.labelAssistive)
      }
      .lineLimit(1)
      .frame(maxWidth: .infinity, alignment: .leading)

      Image(systemName: "chevron.right")
        .font(.system(size: 12, weight: .heavy))
        .foregroundStyle(WidgetColor.labelAssistive)
        .frame(width: 16, height: 16)
    }
  }
}

/// 미니앱 목록을 불러오지 못했을 때. 위젯을 누르면 앱의 미니앱 탭이 열려 목록을 다시 받는다.
struct AppInUnavailableView: View {
  let iconSize: CGFloat
  let message: String

  var body: some View {
    VStack(spacing: 6) {
      AppInUnavailableIcon(size: iconSize)
        .padding(.bottom, iconSize > 32 ? 2 : 0)

      Text(message)
        .font(.system(size: 12, weight: .medium))
        .foregroundStyle(WidgetColor.labelAlternative)
        .multilineTextAlignment(.center)

      Text("탭해서 다시 불러오기")
        .font(.system(size: 11))
        .foregroundStyle(WidgetColor.labelAssistive)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
}

/// 회색 아이콘 자리에 노란 경고 배지를 붙인 "이용 불가" 아이콘.
private struct AppInUnavailableIcon: View {
  let size: CGFloat

  var body: some View {
    RoundedRectangle(cornerRadius: size / 4, style: .continuous)
      .fill(WidgetColor.fillNeutral)
      .frame(width: size, height: size)
      .overlay(alignment: .bottomTrailing) {
        Image(systemName: "exclamationmark.circle.fill")
          .font(.system(size: 11))
          .symbolRenderingMode(.palette)
          .foregroundStyle(.white, WidgetColor.statusWarning)
          .frame(width: 14.4, height: 14.4)
          // 배지 둘레를 위젯 배경색으로 감싸 아이콘과 떼어 보이게 한다.
          .background(WidgetColor.backgroundNormal, in: Circle())
          .offset(x: 2.4, y: 2.4)
      }
  }
}
