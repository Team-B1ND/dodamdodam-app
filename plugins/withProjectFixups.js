const {
  AndroidConfig,
  withAndroidManifest,
  withInfoPlist,
  withStringsXml,
} = require("expo/config-plugins");

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

module.exports = function withProjectFixups(config, props = {}) {
  const displayName = props.displayName ?? config.name;

  config = withDisplayNames(config, displayName);
  config = withFirebaseNotificationMeta(config);

  return config;
};
