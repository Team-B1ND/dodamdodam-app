import SwiftUI

struct WatchCardContainer<Content: View>: View {
  @ViewBuilder var content: Content

  var body: some View {
    content
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
      .padding(10)
      .background(WatchColor.backgroundNormal)
      .clipShape(RoundedRectangle(cornerRadius: 14))
  }
}

struct WatchPageCard<Content: View>: View {
  let badgeLabel: String
  var badgeTrailingText: String? = nil
  var cardHeight: CGFloat? = nil
  @ViewBuilder var content: Content

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      WatchCardBadge(label: badgeLabel, trailingText: badgeTrailingText)
      WatchCardContainer { content }
        .frame(height: cardHeight)
    }
    .padding(12)
  }
}

struct WatchCardEmptyText: View {
  let text: String

  var body: some View {
    Text(text)
      .font(.footnote)
      .multilineTextAlignment(.center)
      .lineSpacing(4)
      .foregroundStyle(WatchColor.labelNormal)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
  }
}
