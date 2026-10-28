const {
  AndroidConfig,
  withInfoPlist,
  withStringsXml,
} = require("expo/config-plugins");

// expo 내장 mod는 사용자 플러그인보다 먼저 실행되므로(먼저 추가된 mod가 나중에
// 실행된다), 이 파일에서 쓴 값이 최종값이 된다. 단 app.config.ts의 plugins 배열
// 안에서도 같은 규칙이 적용되므로, RNFB보다 나중에 실행되려면 배열에서 RNFB보다
// 앞에 선언되어 있어야 한다.

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

module.exports = function withProjectFixups(config, props = {}) {
  const displayName = props.displayName ?? config.name;

  config = withDisplayNames(config, displayName);

  return config;
};
