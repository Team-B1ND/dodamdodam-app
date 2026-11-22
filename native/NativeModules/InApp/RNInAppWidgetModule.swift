import Foundation
import WidgetKit

@objc(RNInAppWidgetModule)
class RNInAppWidgetModule: NSObject {

  @objc(saveInApps:)
  func saveInApps(json: String) {
    UserDefaults(suiteName: "group.com.b1nd.dodam.student.shared")?.set(json, forKey: "widgetInApps")
    WidgetCenter.shared.reloadTimelines(ofKind: "InAppTestWidget")
  }
}
