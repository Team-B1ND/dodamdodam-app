//
//  WatchConnectivityBridge.swift
//  dodamdodamapp
//
//  Created by chanwoo on 7/12/26.
//

import Foundation
import WatchConnectivity

final class WatchConnectivityBridge: NSObject, WCSessionDelegate {
  static let shared = WatchConnectivityBridge()

  /// 마지막으로 보내려던 값. 워치 앱이 앱 실행 뒤에 설치되는 경우가 있어서
  /// 전송 성공 후에도 비우지 않고 들고 있다가 상태가 바뀌면 다시 보낸다.
  private var latestContext: [String: String] = [:]
  /// latestContext는 RN 모듈 큐와 WCSession 델리게이트 큐 양쪽에서 건드린다.
  private let queue = DispatchQueue(label: "com.b1nd.dodam.watch-connectivity")

  private override init() {
    super.init()
    if WCSession.isSupported() {
      WCSession.default.delegate = self
      WCSession.default.activate()
    }
  }

  func send(key: String, json: String) {
    guard WCSession.isSupported() else { return }
    queue.async {
      self.latestContext[key] = json
      self.flush()
    }
  }

  private func flush() {
    let session = WCSession.default
    guard !latestContext.isEmpty, session.activationState == .activated else { return }

    // 일시적인 실패는 무시한다. 값은 latestContext에 남아 있으니 다음 상태 변경 때 재전송된다.
    try? session.updateApplicationContext(latestContext)
  }

  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: (any Error)?) {
    queue.async { self.flush() }
  }

  /// 워치 앱이 뒤늦게 설치되거나 재설치될 때 밀린 데이터를 다시 보낸다.
  func sessionWatchStateDidChange(_ session: WCSession) {
    queue.async { self.flush() }
  }

  func sessionDidBecomeInactive(_ session: WCSession) {}

  func sessionDidDeactivate(_ session: WCSession) {
    session.activate()
  }
}
