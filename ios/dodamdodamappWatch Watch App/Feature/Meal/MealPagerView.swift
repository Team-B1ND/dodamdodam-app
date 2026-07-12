import SwiftUI

struct MealPagerView: View {
  let states: [MealType: MealCardState]

  @State private var selection: MealType = MealType.from(Date())

  var body: some View {
    TabView(selection: $selection) {
      ForEach(MealType.allCases, id: \.self) { type in
        MealCardView(mealType: type, state: states[type] ?? .unavailable)
          .tag(type)
      }
    }
    .tabViewStyle(.verticalPage)
  }
}
