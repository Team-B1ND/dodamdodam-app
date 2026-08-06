import Foundation
import WidgetKit

@objc(RNMealWidgetModule)
class RNMealWidgetModule: NSObject {

  @objc(saveMeals:)
  func saveMeals(json: String) {
    UserDefaults(suiteName: "group.com.b1nd.dodam.student.shared")?.set(json, forKey: "widgetMeals")
    WidgetCenter.shared.reloadAllTimelines()
    WatchConnectivityBridge.shared.send(key: "meals", json: json)
  }
}
