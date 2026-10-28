# 네이티브 설정 워크플로

이 저장소는 `ios/`·`android/`를 **커밋한 상태로** `expo prebuild`를 함께 쓴다.
prebuild는 멱등하게 맞춰 두었으므로 언제든 돌려도 된다.

```bash
pnpm prebuild        # 안전
pnpm pod-install     # iOS 의존성 변경 시
```

## `--clean`은 쓰지 말 것

`expo prebuild --clean`은 `ios/`·`android/`를 지우고 템플릿에서 새로 만든다.
아래는 prebuild가 생성하지 않는, 손으로 관리하는 자원이라 전부 소실된다.

- `android/app/src/main/java/com/b1nd/dodam/student/**` (위젯 Provider, 네이티브 모듈, 알림 채널)
- `android/app/src/main/res/{layout,xml,drawable}/**` (위젯 레이아웃·메타데이터)
- `android/app/src/main/res/values/dodam_strings.xml`
- `ios/dodamdodamappWatch Watch App/**` 과 Xcode의 Watch App 타겟

## `native/`가 원본이다

`native/` 아래 파일이 prebuild 때 `ios/`로 복사된다. **`ios/` 아래를 직접 고치면
다음 prebuild에서 되돌아간다.**

| 원본 | 복사 위치 |
|---|---|
| `native/dodamwidget/Source/**` | `ios/dodamwidgetExtension/**` |
| `native/dodamwidget/Resource/Assets.xcassets` | `ios/dodamwidgetExtension/Assets.xcassets` |
| `native/NativeModules/**` | `ios/dodamdodamapp/NativeModules/**` |
| `native/NotificationService/**` | `ios/NotificationService/**` |
| `native/dodamwidgetExtension.entitlements` | `ios/dodamwidgetExtension.entitlements` |

2026-09-13에 `native/`가 두 달 밀린 상태로 prebuild가 돌아 위젯 커밋 3개가
롤백된 사고가 있었다. 위젯·네이티브 모듈 수정은 반드시 `native/`에서 한다.

## 플러그인

- `withProjectFixups` — prebuild 출력이 깨뜨리는 것들을 되돌린다. `app.config.ts`의
  `plugins` 배열에서 **맨 앞**에 있어야 한다. 배열에서 앞에 선언된 플러그인이
  나중에 실행되므로, RNFB가 덮는 값을 이기려면 RNFB보다 앞이어야 한다.
- `withNativeModules` / `withWidgetExtension` — `native/` 복사 + Xcode 타겟·그룹 등록.
  이미 등록돼 있으면 건너뛴다(중복 등록 방지).
- `withModularHeaders` — Podfile `use_modular_headers!`.

## 생성물이라 직접 고치면 안 되는 파일

- `ios/Config/Version.xcconfig` — `withProjectFixups`가 `package.json`에서 생성.
  위젯·Watch·NotificationService 타겟이 프로젝트 레벨에서 공유한다. 메인 앱
  `Info.plist`도 `$(MARKETING_VERSION)`·`$(CURRENT_PROJECT_VERSION)`으로 이 값을
  참조한다. expo가 버전 문자열을 직접 써 넣는 것을 `withProjectFixups`가 되돌린다.

## 버전

`package.json`의 `version`이 단일 출처다. 빌드 번호는 `app.config.ts`의
`ios.buildNumber`와 `android.versionCode`에 선언한다. **선언을 빼면 prebuild가
매번 1로 되돌린다.**

## `name`을 한글로 바꾸지 말 것

`app.config.ts`의 `name`은 ASCII여야 한다. expo가 이 값에서 Xcode `PRODUCT_NAME`과
gradle `rootProject.name`을, `--clean` 시에는 프로젝트 디렉터리 이름까지 유도하는데,
한글은 `sanitizedName()`에서 전부 제거된 뒤 `'app'`으로 폴백한다. 사용자에게 보이는
이름은 `withProjectFixups`의 `displayName` prop으로 넘긴다.

## `values/strings.xml`에 백슬래시 이스케이프를 쓰지 말 것

prebuild가 읽을 때 `unescapeAndroidString`이 `/\\(.)/g -> '$1'`로 백슬래시를 전부
제거한다(`\n` 2글자 -> `n` 1글자). 반대로 쓸 때의 `escapeAndroidString`은 실제
제어문자(U+000A 등)만 이스케이프하므로 되돌아오지 않는다. 비대칭 손실이라
`\n` `\t` `\'` `\"` `\@`가 prebuild마다 사라진다.

이스케이프가 필요한 문자열은 `values/dodam_strings.xml`에 둔다(expo가 관리하지 않음).
참고로 `translatable="false"`인 문자열은 양쪽 처리에서 모두 제외되어 영향받지 않는다.
