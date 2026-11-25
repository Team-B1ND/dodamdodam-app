import Foundation
import WidgetKit

@objc(RNInAppWidgetModule)
class RNInAppWidgetModule: NSObject {

  @objc(saveInApps:)
  func saveInApps(json: String) {
    let defaults = UserDefaults(suiteName: "group.com.b1nd.dodam.student.shared")
    let previous = defaults?.string(forKey: "widgetInApps")
    defaults?.set(json, forKey: "widgetInApps")
    // 목록 구성이나 순서가 바뀌면 위젯 페이지를 첫 페이지로 되돌린다.
    if previous != json {
      for layout in ["small", "medium", "large"] {
        defaults?.set(0, forKey: "appInWidgetPage.\(layout)")
      }
    }
    WidgetCenter.shared.reloadTimelines(ofKind: "AppInWidget")
  }
}
