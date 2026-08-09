import SwiftUI

enum WatchColor {
  static let primaryNormal = Color(hex: 0x0083F0)
  static let labelNormal = Color(hex: 0xF5F5F5)
  static let labelAlternative = Color(hex: 0xC4C5C6)
  static let backgroundNormal = Color(hex: 0x232424)
  static let backgroundNeutral = Color(hex: 0x191A1A)
}

extension Color {
  init(hex: UInt, alpha: Double = 1) {
    self.init(
      .sRGB,
      red: Double((hex >> 16) & 0xff) / 255,
      green: Double((hex >> 8) & 0xff) / 255,
      blue: Double((hex >> 0) & 0xff) / 255,
      opacity: alpha
    )
  }
}
