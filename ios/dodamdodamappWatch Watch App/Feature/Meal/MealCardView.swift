import SwiftUI

struct MealCardView: View {
  let mealType: MealType
  let state: MealCardState

  private var kcalText: String? {
    if case .loaded(let meal) = state {
      return "\(Int(meal.calorie))Kcal"
    }
    return nil
  }

  // 카드 높이가 고정이라, 메뉴가 6개를 넘으면 마지막 자리를 "..."으로 대체한다.
  private func displayMenus(_ menus: [String]) -> [String] {
    guard menus.count > 6 else { return menus }
    return Array(menus.prefix(5)) + ["..."]
  }

  var body: some View {
    WatchPageCard(badgeLabel: mealType.label, badgeTrailingText: kcalText) {
      switch state {
      case .loaded(let meal) where !meal.menus.isEmpty:
        VStack(alignment: .leading, spacing: 4) {
          ForEach(Array(displayMenus(meal.menus).enumerated()), id: \.offset) { _, menu in
            Text(menu)
              .font(.system(size: 13))
              .foregroundStyle(WatchColor.labelNormal)
              .lineLimit(1)
          }
        }
      case .loaded:
        WatchCardEmptyText(text: "급식이 없어요")
      case .empty:
        WatchCardEmptyText(text: "급식이 없어요")
      case .unavailable:
        WatchCardEmptyText(text: "급식을\n불러올 수 없어요")
      }
    }
  }
}
