import SwiftUI

struct TimetableCardView: View {
  let state: TimetableCardState

  private var badgeLabel: String {
    switch state {
    case .loaded(let dayLabel, _, _): return dayLabel
    case .weekend: return "주말"
    case .empty(let dayLabel): return dayLabel
    }
  }

  var body: some View {
    WatchPageCard(badgeLabel: badgeLabel) {
      switch state {
      case .loaded(_, let periods, let currentPeriod):
        VStack(alignment: .leading, spacing: 0) {
          ForEach(periods) { item in
            let isCurrent = item.period == currentPeriod
            HStack(spacing: 4) {
              Text("\(item.period)교시")
                .font(isCurrent ? .caption2.bold() : .caption2)
                .foregroundStyle(isCurrent ? WatchColor.primaryNormal : WatchColor.labelAlternative)
                .fixedSize()
                .frame(width: 38, alignment: .leading)
              Text(item.subject)
                .font(isCurrent ? .caption2.bold() : .caption2)
                .foregroundStyle(isCurrent ? WatchColor.primaryNormal : WatchColor.labelNormal)
                .lineLimit(1)
            }
            .frame(height: 15)
          }
        }
      case .weekend:
        WatchCardEmptyText(text: "주말에는\n시간표가 없어요")
      case .empty(_):
        WatchCardEmptyText(text: "등록된\n시간표가 없어요")
      }
    }
    .offset(y: -5)
  }
}
