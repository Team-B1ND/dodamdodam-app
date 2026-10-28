const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
  withInfoPlist,
  withStringsXml,
  withXcodeProject,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

// expo 내장 mod는 사용자 플러그인보다 먼저 실행되므로(먼저 추가된 mod가 나중에
// 실행된다), 이 파일에서 쓴 값이 최종값이 된다. 단 app.config.ts의 plugins 배열
// 안에서도 같은 규칙이 적용되므로, RNFB보다 나중에 실행되려면 배열에서 RNFB보다
// 앞에 선언되어 있어야 한다.

// AndroidManifest의 default_notification_channel_id와 MainApplication.kt의
// DEFAULT_NOTIFICATION_CHANNEL_ID는 반드시 같아야 한다.
const NOTIFICATION_CHANNEL_ID = "dodam_default";
const NOTIFICATION_COLOR = "@color/notification_color";

/**
 * name을 ASCII("dodamdodam-app")로 바꾼 대신 사용자에게 보이는 이름을 되돌린다.
 * name을 한글로 두면 sanitizedName()이 전멸시킨 뒤 'app'으로 폴백해서
 * PRODUCT_NAME과 --clean 시 프로젝트 디렉터리 이름까지 망가진다.
 */
function withDisplayNames(config, displayName) {
  config = withInfoPlist(config, (config) => {
    config.modResults.CFBundleDisplayName = displayName;
    return config;
  });

  return withStringsXml(config, (config) => {
    config.modResults = AndroidConfig.Strings.setStringItem(
      [{ _: displayName, $: { name: "app_name" } }],
      config.modResults
    );
    return config;
  });
}

function setMetaData(application, name, attributes) {
  application["meta-data"] = application["meta-data"] ?? [];

  const existing = application["meta-data"].find(
    (item) => item.$?.["android:name"] === name
  );
  const entry = existing ?? {};
  entry.$ = { "android:name": name, ...attributes };

  if (!existing) application["meta-data"].push(entry);
}

/**
 * RNFB messaging 플러그인이 이 두 meta-data를 빈 값으로 선언해 두기 때문에
 * tools:replace로 덮어야 한다. 채널이 없으면 FCM이 이름 없는 fallback 채널로
 * 알림을 띄운다.
 */
function withFirebaseNotificationMeta(config) {
  return withAndroidManifest(config, (config) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );

    setMetaData(
      application,
      "com.google.firebase.messaging.default_notification_channel_id",
      {
        "android:value": NOTIFICATION_CHANNEL_ID,
        "tools:replace": "android:value",
      }
    );
    setMetaData(
      application,
      "com.google.firebase.messaging.default_notification_color",
      {
        "android:resource": NOTIFICATION_COLOR,
        "tools:replace": "android:resource",
      }
    );

    return config;
  });
}

/**
 * expo의 DeviceFamily mod는 PRODUCT_NAME이 있는 build configuration을 전부
 * 순회하며 TARGETED_DEVICE_FAMILY를 덮는다. 추가 타겟을 모르기 때문에 watchOS
 * 타겟도 iPhone(1)으로 바뀌므로 다시 4로 되돌린다.
 */
function withWatchDeviceFamily(config) {
  return withXcodeProject(config, (config) => {
    const buildConfigs = config.modResults.pbxXCBuildConfigurationSection();

    for (const [key, item] of Object.entries(buildConfigs)) {
      if (key.endsWith("_comment") || typeof item !== "object") continue;
      if (item.buildSettings?.WATCHOS_DEPLOYMENT_TARGET === undefined) continue;

      item.buildSettings.TARGETED_DEVICE_FAMILY = "4";
    }

    return config;
  });
}

/**
 * 위젯·Watch·NotificationService 타겟은 프로젝트 레벨 baseConfigurationReference로
 * 이 xcconfig 하나를 공유한다. expo는 메인 앱 Info.plist만 갱신하므로 나머지
 * 타겟의 버전이 밀리지 않게 package.json에서 생성한다.
 */
function withVersionXcconfig(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const dir = path.join(config.modRequest.platformProjectRoot, "Config");
      fs.mkdirSync(dir, { recursive: true });

      const contents = [
        "// plugins/withProjectFixups.js가 생성하는 파일이다. 직접 수정하지 말 것.",
        "// 버전의 단일 출처는 package.json이다.",
        `MARKETING_VERSION = ${config.version}`,
        `CURRENT_PROJECT_VERSION = ${config.ios?.buildNumber ?? "1"}`,
        "",
      ].join("\n");

      fs.writeFileSync(path.join(dir, "Version.xcconfig"), contents);

      return config;
    },
  ]);
}

/**
 * expo의 Version mod는 메인 앱 Info.plist에 버전을 문자열로 직접 써 넣는다.
 * 그러면 버전이 Info.plist와 Version.xcconfig 두 곳에 기록되므로, 메인 앱도
 * 다른 타겟처럼 xcconfig의 빌드 설정을 참조하도록 되돌린다.
 */
function withVersionReferences(config) {
  return withInfoPlist(config, (config) => {
    config.modResults.CFBundleShortVersionString = "$(MARKETING_VERSION)";
    config.modResults.CFBundleVersion = "$(CURRENT_PROJECT_VERSION)";
    return config;
  });
}

module.exports = function withProjectFixups(config, props = {}) {
  const displayName = props.displayName ?? config.name;

  config = withDisplayNames(config, displayName);
  config = withFirebaseNotificationMeta(config);
  config = withWatchDeviceFamily(config);
  config = withVersionXcconfig(config);
  config = withVersionReferences(config);

  return config;
};
