import WidgetKit
import Foundation

/// 정규수업이 16:30에 끝나므로 이 시각 이후엔 다음 수업일 시간표를 보여준다.
private let timetableRolloverMinutes = 17 * 60

struct TimetableEntry: TimelineEntry {
  let date: Date
  /// 단일 일자 뷰(small/medium)가 보여줄 시간표. 17시 이후엔 다음 수업일 것이 들어온다.
  let daySubjects: [String]
  let dayLabel: String
  /// 단일 일자 뷰에서 강조할 교시. 내일을 보여줄 땐 -1.
  let dayCurrentPeriod: Int
  let weekTimetable: [[String]]
  /// 주간 뷰(large)의 오늘 열. 한 주가 모두 보이므로 롤오버와 무관하게 항상 오늘이다.
  let weekday: Int
  let currentPeriod: Int
}

/// 시간표 카드가 실제로 보여줄 요일. 주말이면 nil.
private struct DisplayDay {
  let index: Int
  let isTomorrow: Bool
}

private func displayDay(at date: Date) -> DisplayDay? {
  let index = Calendar.current.component(.weekday, from: date) - 2
  guard index >= 0, index <= 4 else { return nil }

  let components = Calendar.current.dateComponents([.hour, .minute], from: date)
  let minutes = (components.hour ?? 0) * 60 + (components.minute ?? 0)

  // 금요일(index 4)은 다음 주 시간표가 페이로드에 없어서 넘기지 않는다.
  guard index < 4, minutes >= timetableRolloverMinutes else {
    return DisplayDay(index: index, isTomorrow: false)
  }
  return DisplayDay(index: index + 1, isTomorrow: true)
}

private func dayLabel(for day: DisplayDay?) -> String {
  let days = ["월", "화", "수", "목", "금"]
  guard let day, day.index >= 0, day.index < days.count else { return "주말" }
  return day.isTomorrow ? "내일 (\(days[day.index]))" : "\(days[day.index])요일"
}

struct TimetableProvider: TimelineProvider {
  func placeholder(in context: Context) -> TimetableEntry {
    TimetableEntry(
      date: Date(),
      daySubjects: [],
      dayLabel: "월요일",
      dayCurrentPeriod: 2,
      weekTimetable: [],
      weekday: 0,
      currentPeriod: 2
    )
  }

  func getSnapshot(in context: Context, completion: @escaping (TimetableEntry) -> ()) {
    completion(makeEntry(at: Date()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<TimetableEntry>) -> ()) {
    let now = Date()
    var entries = [makeEntry(at: now)]

    // 15분 주기 갱신만으로는 전환이 최대 15분 늦어진다. 17:00 엔트리를 미리 넣어 정시에 바뀌게 한다.
    if let rollover = nextRollover(after: now) {
      entries.append(makeEntry(at: rollover))
    }

    let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: now) ?? now
    completion(Timeline(entries: entries, policy: .after(nextUpdate)))
  }

  /// 오늘 17:00이 아직 오지 않았다면 그 시각. 이미 지났거나 전환 대상이 아니면 nil.
  private func nextRollover(after date: Date) -> Date? {
    guard let day = displayDay(at: date), !day.isTomorrow, day.index < 4 else { return nil }
    guard let rollover = Calendar.current.date(
      bySettingHour: timetableRolloverMinutes / 60,
      minute: timetableRolloverMinutes % 60,
      second: 0,
      of: date
    ) else { return nil }
    return rollover > date ? rollover : nil
  }

  private func makeEntry(at date: Date) -> TimetableEntry {
    let timetable = loadTimetable()
    let day = displayDay(at: date)
    let dayIndex = day?.index ?? 0
    let subjects = dayIndex < timetable.count ? timetable[dayIndex] : []

    let todayIndex = max(0, min(4, Calendar.current.component(.weekday, from: date) - 2))
    let period = currentPeriodIndex(at: date)

    return TimetableEntry(
      date: date,
      daySubjects: subjects,
      dayLabel: dayLabel(for: day),
      // 내일 시간표에는 '지금 몇 교시'라는 개념이 없으므로 강조하지 않는다.
      dayCurrentPeriod: day?.isTomorrow == true ? -1 : period,
      weekTimetable: timetable,
      weekday: todayIndex,
      currentPeriod: period
    )
  }

  private func currentPeriodIndex(at date: Date) -> Int {
    let hour = Calendar.current.component(.hour, from: date)
    let minute = Calendar.current.component(.minute, from: date)
    let current = hour * 60 + minute

    let periods = [
      (8*60+50, 9*60+40),
      (9*60+50, 10*60+40),
      (10*60+50, 11*60+40),
      (11*60+50, 12*60+40),
      (13*60+30, 14*60+20),
      (14*60+30, 15*60+20),
      (15*60+30, 16*60+20),
    ]

    for (i, period) in periods.enumerated() {
      if current <= period.1 { return i }
    }
    return -1
  }
}
