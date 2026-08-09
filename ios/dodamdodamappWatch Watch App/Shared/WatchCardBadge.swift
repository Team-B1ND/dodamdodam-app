import SwiftUI

struct WatchCardBadge: View {
  let label: String
  var trailingText: String? = nil

  var body: some View {
    HStack {
      Text(label)
        .font(.footnote.bold())
        .foregroundStyle(.white)
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .background(WatchColor.primaryNormal)
        .clipShape(Capsule())

      if let trailingText {
        Spacer()
        Text(trailingText)
          .font(.footnote)
          .foregroundStyle(WatchColor.labelAlternative)
      }
    }
  }
}
