import Foundation

enum MealType: String, CaseIterable {
  case breakfast
  case lunch
  case dinner

  var label: String {
    switch self {
    case .breakfast: return "아침"
    case .lunch: return "점심"
    case .dinner: return "저녁"
    }
  }

  var apiRawValue: String {
    switch self {
    case .breakfast: return "BREAKFAST"
    case .lunch: return "LUNCH"
    case .dinner: return "DINNER"
    }
  }

  static func from(_ date: Date) -> Self {
    var calendar = Calendar.current
    calendar.locale = Locale(identifier: "ko_KR")
    let hour = calendar.component(.hour, from: date)
    let minute = calendar.component(.minute, from: date)
    let currentTime = hour * 100 + minute

    if currentTime <= 820 {
      return .breakfast
    } else if currentTime <= 1330 {
      return .lunch
    } else if currentTime <= 1910 {
      return .dinner
    } else {
      return .breakfast
    }
  }
}

struct Meal {
  let mealType: MealType
  let calorie: Double
  let menus: [String]
}

enum MealCardState {
  case loaded(Meal)
  case empty
  case unavailable
}
