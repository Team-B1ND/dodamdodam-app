import { ExpoConfig, ConfigContext } from "expo/config";
// 버전은 package.json을 단일 출처로 삼는다.
import { version } from "./package.json";

// 사용자에게 보이는 이름. name과 분리한 이유는 expo가 name에서 Xcode
// PRODUCT_NAME과 gradle rootProject.name을 유도하는데, 한글은 sanitizedName()에서
// 전부 제거된 뒤 'app'으로 폴백해 프로젝트 이름이 망가지기 때문이다.
const DISPLAY_NAME = "도담도담";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "dodamdodam-app",
  slug: "dodamdodam-app",
  version,
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  plugins: [
    // 배열에서 앞에 선언된 플러그인이 나중에 실행된다. withProjectFixups는
    // RNFB가 덮는 값을 되돌려야 하므로 반드시 RNFB보다 앞에 있어야 한다.
    ["./plugins/withProjectFixups", { displayName: DISPLAY_NAME }],
    "@react-native-firebase/app",
    "@react-native-firebase/messaging",
    "./plugins/withModularHeaders",
    "./plugins/withNativeModules",
    "./plugins/withWidgetExtension",
    [
      "react-native-nfc-manager",
      { nfcPermission: "NFC 태그를 읽기 위해 권한이 필요해요." },
    ],
  ],
  ios: {
    ...config.ios,
    bundleIdentifier: "com.b1nd.dodam.student",
    googleServicesFile: "./src/app/GoogleService-Info.plist",
    entitlements: {
      "com.apple.developer.nfc.readersession.formats": ["TAG"],
    },
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
      NFCReaderUsageDescription: "NFC 태그를 읽기 위해 권한이 필요해요.",
    },
  },
  android: {
    ...config.android,
    package: "com.b1nd.dodam.student",
    googleServicesFile: "./google-services.json",
    permissions: [
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.NFC",
    ],
  },
});
