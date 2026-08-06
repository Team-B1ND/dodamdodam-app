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

  private var pendingContext: [String: String] = [:]

  private override init() {
    super.init()
    if WCSession.isSupported() {
      WCSession.default.delegate = self
      WCSession.default.activate()
    }
  }

  func send(key: String, json: String) {
    guard WCSession.isSupported() else { return }
    pendingContext[key] = json
    flushPendingContext()
  }

  private func flushPendingContext() {
    guard !pendingContext.isEmpty else { return }
    let session = WCSession.default
    guard session.activationState == .activated else { return }

    var context = session.applicationContext
    for (key, value) in pendingContext {
      context[key] = value
    }

    do {
      try session.updateApplicationContext(context)
      pendingContext.removeAll()
    } catch {
      // 일시적인 오류(워치 미연결 등)인 경우 pendingContext를 남겨두고 다음 flush에서 재전송한다.
    }
  }

  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: (any Error)?) {
    if activationState == .activated {
      flushPendingContext()
    }
  }
  func sessionDidBecomeInactive(_ session: WCSession) {}
  func sessionDidDeactivate(_ session: WCSession) {
    session.activate()
  }
}
