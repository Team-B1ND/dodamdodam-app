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

  var body: some View {
    WatchPageCard(badgeLabel: mealType.label, badgeTrailingText: kcalText) {
      switch state {
      case .loaded(let meal) where !meal.menus.isEmpty:
        VStack(alignment: .leading, spacing: 4) {
          ForEach(meal.menus, id: \.self) { menu in
            Text(menu)
              .font(.footnote)
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
