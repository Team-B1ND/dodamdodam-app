//
//  ContentView.swift
//  dodamdodamappWatch Watch App
//

import SwiftUI

struct ContentView: View {
  @StateObject private var connectivity = WatchConnectivityReceiver.shared

  var body: some View {
    TimelineView(.everyMinute) { _ in
      TabView {
        TimetableCardView(state: connectivity.timetableState, isStale: connectivity.isTimetableStale)
        MealPagerView(states: connectivity.mealStates)
      }
      .tabViewStyle(.page)
    }
  }
}

#Preview {
  ContentView()
}
