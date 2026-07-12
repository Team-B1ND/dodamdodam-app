import Foundation

struct TimetablePeriod: Identifiable {
  let id = UUID()
  let period: Int
  let subject: String
}

enum TimetableCardState {
  case loaded(dayLabel: String, periods: [TimetablePeriod], currentPeriod: Int?)
  case weekend
  case empty(dayLabel: String)
}
