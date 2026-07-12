//
//  ContentView.swift
//  dodamdodamappWatch Watch App
//

import SwiftUI

struct ContentView: View {
  @StateObject private var connectivity = WatchConnectivityReceiver.shared

  var body: some View {
    TabView {
      TimetableCardView(state: connectivity.timetableState)
      MealPagerView(states: connectivity.mealStates)
    }
    .tabViewStyle(.page)
  }
}

#Preview {
  ContentView()
}
