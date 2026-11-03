//
//  MealWidget.swift
//  MealWidget
//
//  Created by 김은찬 on 3/26/26.
//

import WidgetKit
import SwiftUI

@main
struct AppMainWidget: WidgetBundle {
  var body: some Widget {
    MealWidget()
    TimetableWidget()
#if DEBUG
    DeepLinkTestWidget()
    InAppTestWidget()
#endif
  }
}
