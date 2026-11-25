import SwiftUI

enum WidgetColor {
  static let primaryNormal = Color(hex: 0x0083F0)
  
  static let statusWarning = Color(hex: 0xFBD300)

  static var labelAssistive: Color { adaptive(light: 0x747678, dark: 0x9B9D9F) }
  static var labelAlternative: Color { adaptive(light: 0x5D5F60, dark: 0xC4C5C6) }
  static var labelNeutral: Color { adaptive(light: 0x383A3B, dark: 0xDCDDDE) }
  static var labelNormal: Color { adaptive(light: 0x0F0F10, dark: 0xF5F5F5) }
  static var fillNeutral: Color { adaptive(light: 0xF5F5F5, dark: 0x383A3B) }
  static var fillAlternative: Color { adaptive(light: 0xDCDDDE, dark: 0x48494A) }
  static var backgroundNormal: Color { adaptive(light: 0xFFFFFF, dark: 0x232424) }
  static var backgroundNeutral: Color { adaptive(light: 0xF5F5F5, dark: 0x191A1A) }
  
  private static func adaptive(light: UInt, dark: UInt) -> Color {
    Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(Color(hex: dark)) : UIColor(Color(hex: light)) })
  }
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
