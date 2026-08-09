import SwiftUI

struct MealPagerView: View {
  let states: [MealType: MealCardState]

  @Environment(\.scenePhase) private var scenePhase
  @State private var selection: MealType = MealType.from(Date())

  var body: some View {
    TabView(selection: $selection) {
      ForEach(MealType.allCases, id: \.self) { type in
        MealCardView(mealType: type, state: states[type] ?? .unavailable)
          .tag(type)
      }
    }
    .tabViewStyle(.verticalPage)
    .onChange(of: scenePhase) { _, newPhase in
      // watchOS는 앱이 메모리에 상주하므로, 다시 활성화될 때마다 현재 시각 기준 페이지로 재설정한다.
      if newPhase == .active {
        selection = MealType.from(Date())
      }
    }
  }
}
