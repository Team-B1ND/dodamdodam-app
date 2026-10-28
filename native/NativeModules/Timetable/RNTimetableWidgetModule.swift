import Foundation
import WidgetKit

@objc(RNTimetableWidgetModule)
class RNTimetableWidgetModule: NSObject {

  @objc(saveTimetable:)
  func saveTimetable(json: String) {
    UserDefaults(suiteName: "group.com.b1nd.dodam.student.shared")?.set(json, forKey: "widgetTimetable")
    WidgetCenter.shared.reloadAllTimelines()
    WatchConnectivityBridge.shared.send(key: "timetable", json: json)
  }
}
