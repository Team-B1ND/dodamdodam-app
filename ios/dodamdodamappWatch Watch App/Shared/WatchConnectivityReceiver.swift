import Foundation
import Combine
import WatchConnectivity

private struct RemoteMealModel: Codable {
  let date: String
  let mealType: String
  let calorie: Double
  let menus: [String]
}

final class WatchConnectivityReceiver: NSObject, ObservableObject, WCSessionDelegate {
  static let shared = WatchConnectivityReceiver()

  @Published private var timetableJSON: String?
  @Published private var mealsJSON: String?

  private let defaults = UserDefaults.standard
  private let timetableCacheKey = "cachedTimetableJSON"
  private let mealsCacheKey = "cachedMealsJSON"
  private let timetableSyncDateKey = "timetableSyncDate"
  private let staleThreshold: TimeInterval = 7 * 24 * 60 * 60

  private override init() {
    timetableJSON = defaults.string(forKey: timetableCacheKey)
    mealsJSON = defaults.string(forKey: mealsCacheKey)
    super.init()
    if WCSession.isSupported() {
      WCSession.default.delegate = self
      WCSession.default.activate()
    }
  }

  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: (any Error)?) {
    applyContext(session.receivedApplicationContext)
  }

  func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
    applyContext(applicationContext)
  }

  private func applyContext(_ context: [String: Any]) {
    DispatchQueue.main.async {
      if let timetable = context["timetable"] as? String {
        self.timetableJSON = timetable
        self.defaults.set(timetable, forKey: self.timetableCacheKey)
        self.defaults.set(Date(), forKey: self.timetableSyncDateKey)
      }
      if let meals = context["meals"] as? String {
        self.mealsJSON = meals
        self.defaults.set(meals, forKey: self.mealsCacheKey)
      }
    }
  }

  // MARK: - Derived UI state

  private var todayLabel: String {
    let days = ["월", "화", "수", "목", "금"]
    let weekday = Calendar.current.component(.weekday, from: Date())
    let idx = weekday - 2
    guard idx >= 0, idx < days.count else { return "주말" }
    return "\(days[idx])요일"
  }

  private var isWeekday: Bool {
    let weekday = Calendar.current.component(.weekday, from: Date())
    return weekday >= 2 && weekday <= 6
  }

  private func currentPeriodIndex() -> Int {
    let now = Date()
    let hour = Calendar.current.component(.hour, from: now)
    let minute = Calendar.current.component(.minute, from: now)
    let current = hour * 60 + minute

    let periods = [
      (8 * 60 + 50, 9 * 60 + 40),
      (9 * 60 + 50, 10 * 60 + 40),
      (10 * 60 + 50, 11 * 60 + 40),
      (11 * 60 + 50, 12 * 60 + 40),
      (13 * 60 + 30, 14 * 60 + 20),
      (14 * 60 + 30, 15 * 60 + 20),
      (15 * 60 + 30, 16 * 60 + 20),
    ]

    guard current >= periods[0].0 else { return -1 }

    for (i, period) in periods.enumerated() {
      if current <= period.1 { return i }
    }
    return -1
  }

  private func dateString(from date: Date) -> String {
    let formatter = DateFormatter()
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.locale = Locale(identifier: "ko_KR")
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: date)
  }

  private var todayDateString: String {
    dateString(from: Date())
  }

  /// 저녁(19:10) 이후엔 아침/점심/저녁 전부 내일 날짜 기준으로 조회한다.
  private func effectiveDateString(for type: MealType) -> String {
    let hour = Calendar.current.component(.hour, from: Date())
    let minute = Calendar.current.component(.minute, from: Date())
    guard hour * 100 + minute > 1910 else { return todayDateString }

    let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()
    return dateString(from: tomorrow)
  }

  var isTimetableStale: Bool {
    guard let syncDate = defaults.object(forKey: timetableSyncDateKey) as? Date else { return false }
    return Date().timeIntervalSince(syncDate) > staleThreshold
  }

  var timetableState: TimetableCardState {
    guard isWeekday else { return .weekend }

    guard let json = timetableJSON,
          let data = json.data(using: .utf8),
          let weekTimetable = try? JSONDecoder().decode([[String]].self, from: data)
    else { return .empty(dayLabel: todayLabel) }

    let weekday = Calendar.current.component(.weekday, from: Date())
    let index = weekday - 2
    guard index >= 0, index < weekTimetable.count, !weekTimetable[index].isEmpty else {
      return .empty(dayLabel: todayLabel)
    }

    let subjects = weekTimetable[index]
    let periods = subjects.enumerated().map { TimetablePeriod(period: $0.offset + 1, subject: $0.element) }
    return .loaded(dayLabel: todayLabel, periods: periods, currentPeriod: currentPeriodIndex() + 1)
  }

  var mealStates: [MealType: MealCardState] {
    guard let json = mealsJSON,
          let data = json.data(using: .utf8),
          let allMeals = try? JSONDecoder().decode([RemoteMealModel].self, from: data)
    else {
      return Dictionary(uniqueKeysWithValues: MealType.allCases.map { ($0, .unavailable) })
    }

    var result: [MealType: MealCardState] = [:]
    for type in MealType.allCases {
      let targetDate = effectiveDateString(for: type)
      if let match = allMeals.first(where: { $0.date == targetDate && $0.mealType == type.apiRawValue }) {
        result[type] = match.menus.isEmpty
          ? .empty
          : .loaded(Meal(mealType: type, calorie: match.calorie, menus: match.menus))
      } else {
        result[type] = .empty
      }
    }
    return result
  }
}
