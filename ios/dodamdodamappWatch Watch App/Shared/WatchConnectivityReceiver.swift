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

  /// 정규수업이 16:30에 끝나므로 이 시각 이후엔 다음 수업일 시간표를 보여준다.
  private static let timetableRolloverMinutes = 17 * 60

  /// 시간표 카드가 실제로 보여줄 요일. 주말이면 nil.
  private struct DisplayDay {
    let index: Int
    let isTomorrow: Bool
  }

  private var displayDay: DisplayDay? {
    let now = Date()
    let index = Calendar.current.component(.weekday, from: now) - 2
    guard index >= 0, index <= 4 else { return nil }

    let components = Calendar.current.dateComponents([.hour, .minute], from: now)
    let minutes = (components.hour ?? 0) * 60 + (components.minute ?? 0)

    // 금요일(index 4)은 다음 주 시간표가 페이로드에 없어서 넘기지 않는다.
    guard index < 4, minutes >= Self.timetableRolloverMinutes else {
      return DisplayDay(index: index, isTomorrow: false)
    }
    return DisplayDay(index: index + 1, isTomorrow: true)
  }

  private func dayLabel(for day: DisplayDay) -> String {
    let days = ["월", "화", "수", "목", "금"]
    guard day.index >= 0, day.index < days.count else { return "주말" }
    return day.isTomorrow ? "내일 (\(days[day.index]))" : "\(days[day.index])요일"
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

    for (i, period) in periods.enumerated() {
      if current >= period.0 && current <= period.1 { return i }
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
    guard let day = displayDay else { return .weekend }
    let label = dayLabel(for: day)

    guard let json = timetableJSON,
          let data = json.data(using: .utf8),
          let weekTimetable = try? JSONDecoder().decode([[String]].self, from: data)
    else { return .empty(dayLabel: label) }

    guard day.index < weekTimetable.count, !weekTimetable[day.index].isEmpty else {
      return .empty(dayLabel: label)
    }

    let subjects = weekTimetable[day.index]
    let periods = subjects.enumerated().map { TimetablePeriod(period: $0.offset + 1, subject: $0.element) }
    // 내일 시간표에는 '지금 몇 교시'라는 개념이 없으므로 강조하지 않는다.
    let currentPeriod = day.isTomorrow ? nil : currentPeriodIndex() + 1
    return .loaded(dayLabel: label, periods: periods, currentPeriod: currentPeriod)
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
