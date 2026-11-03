# 딥링크 경로 정의 통합 및 급식(Meal) 경로 수정 명세

- 브랜치: `feature/#112-deeplink-setting`
- 작성일: 2026-11-03
- 범위: 딥링크 리졸버(②)를 linking config(①) 기준으로 통합하고, 탭 구조 변경 이후 남아 있는 `Meal` 탭 정의를 바로잡는다.

---

## 1. 배경

### 1.1 경로 정의 중복

현재 같은 `dodamdodam://` URL 체계가 두 곳에 따로 정의되어 있다.

| | ① `linking.ts`의 `config` | ② `deepLinkResolver.ts`의 `resolveDeepLink` |
|---|---|---|
| 형태 | react-navigation linking config (화면 → 경로) | 직접 작성한 `if` 분기 + `MAIN_TAB_PATHS` |
| 사용 시점 | 앱 실행 중 + 인증된 상태에서 `listener(url)` | 콜드 스타트 보류, Landing 인증 후 reset, 로그인 후 reset, 수신 URL 유효성 필터 |
| 결과 | react-navigation 기본 동작 (`navigate`) | `CommonActions.reset` 상태 (부모 탭 포함) |
| 대소문자 | 구분함 (`getStateFromPath`의 정규식에 `i` 플래그 없음) | 경로를 소문자로 바꿔서 비교 |
| `night-study/apply` tab 생략 | `tab` 파라미터 없음 → 화면 기본값 `personal` | `personal` 명시 |

②가 따로 생긴 이유(커밋 2a7e779)는 인증 확인이 끝난 뒤 앱이 직접 reset을 dispatch해야 하기 때문이다. react-navigation이 URL을 받자마자 이동하는 것을 피하려는 목적이었다. 그런데 react-navigation이 export하는 `getStateFromPath`로 ①의 config를 직접 해석하면 같은 목적을 달성할 수 있다. 그러면 경로를 따로 정의할 이유가 없다.

### 1.2 Meal 정의 불일치

하단 탭은 커밋 1862375에서 급식(`Meal`) 탭이 AID(`Aid`) 탭으로 교체되었다. 급식은 그 뒤로 Root 스택의 `Meal` 화면([RootStackNavigator.tsx:49](../src/app/navigation/RootStackNavigator.tsx))으로만 존재한다.

같은 날 들어온 a247b53(딥링크 네비게이션 타입 정의)은 교체 전 탭 구조를 기준으로 작성되었다. 그 결과 아래 세 곳이 여전히 `Meal`을 탭으로 다룬다.

| 위치 | 현재 | 실제 |
|---|---|---|
| `navigationTypes.ts` `MainTabParamList` | `Meal` 포함, `Aid` 없음 | 탭: `OutSleeping`, `NightStudy`, `Home`, `Aid`, `More` |
| `navigationTypes.ts` `RootStackParamList` | `Meal` 없음 | 스택에 `Meal` 화면 있음 |
| `linking.ts` config | `Main.screens.Meal: "meal"` | — |
| `deepLinkResolver.ts` `MAIN_TAB_PATHS` | `meal: "Meal"` | — |

타입 오류로도 확인된다 (`npx tsc --noEmit`).

```
src/app/navigation/BottomTabNavigator.tsx(50,9): error TS2322: Type '"Aid"' is not assignable to type 'keyof MainTabParamList'.
src/app/navigation/RootStackNavigator.tsx(49,19): error TS2322: Type '"Meal"' is not assignable to type 'keyof RootStackParamList'.
```

이 때문에 `dodamdodam://meal`은 존재하지 않는 `Main > Meal` 탭으로 reset을 시도한다. Home 탭으로 열리거나 개발 빌드에서 경고가 나올 것으로 예상하지만, 실기기에서는 확인하지 않았다. 반면 홈 화면의 급식 카드(`navigation.navigate("Meal")`)와 푸시 알림(`/meal` → 스택 `Meal`)은 이미 스택 화면으로 이동하고 있어 정상이다.

---

## 2. 목표

1. `dodamdodam://` 경로는 **`deepLinkConfig` 한 곳에서만** 정의한다.
2. 콜드 스타트, 로그인 후, 실행 중 수신 경로 모두 **같은 함수**로 URL을 네비게이션 상태로 바꾼다.
3. `meal`은 스택의 `Meal` 화면으로 진입하고, 뒤로가기를 하면 Home 탭으로 돌아온다.
4. 위 두 TS 오류를 해결한다.

### 범위 밖

- 푸시 알림 매핑(`shared/lib/notification/notificationNavigator.ts`)과 홈 배너 매핑(`pages/home/constants.ts`)의 통합. 두 곳은 같은 `STACK_ROUTES`/`TAB_ROUTES` 테이블을 복제해 쓰고 있으므로 후속 작업으로 함께 다룬다.
- Landing 스플래시 도중 실행 중 링크가 Landing 타이머의 reset에 덮어써지는 문제
- `aid` 경로 추가 (6장 결정 사항 참고)

---

## 3. 변경 명세

### 3.1 `src/app/navigation/navigationTypes.ts`

```ts
export type MainTabParamList = {
  OutSleeping: undefined;
  NightStudy: undefined;
  Home: undefined;
  Aid: undefined;
  More: undefined;
};

export type RootStackParamList = {
  // ...기존 항목 유지
  Main: NavigatorScreenParams<MainTabParamList>;
  Meal: undefined; // 추가
  // ...
};
```

- `MainTabParamList`에서 `Meal`을 빼고 `Aid`를 넣는다. 순서는 `BottomTabNavigator` 배치와 맞춘다.
- `RootStackParamList`에 `Meal: undefined`를 추가한다.

### 3.2 `src/app/navigation/deepLinkConfig.ts` (신규)

경로 정의를 한 곳에 모은다. `linking.ts`와 `deepLinkResolver.ts`가 서로 import하지 않도록 별도 파일로 둔다.

```ts
import type { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import type { RootStackParamList } from "./navigationTypes";

export const deepLinkPrefixes = [Linking.createURL("/"), "dodamdodam://"];

export const deepLinkConfig: NonNullable<
  LinkingOptions<RootStackParamList>["config"]
> = {
  screens: {
    Main: {
      path: "",
      screens: {
        Home: "home",
        OutSleeping: "out-sleeping",
        NightStudy: "night-study",
        More: "more",
      },
    },

    Meal: "meal",
    Notification: "notifications",
    OutSleepingApply: "out-sleeping/apply",

    NightStudyApply: {
      path: "night-study/apply",
      parse: {
        tab: value =>
          value === "project" || value === "personal" ? value : undefined,
      },
    },
  },
};
```

- `Meal: "meal"`을 `Main.screens`에서 **루트 레벨**로 옮긴다.
- `deepLinkPrefixes`는 `deepLinkResolver.ts`에서 이 파일로 옮긴다.

### 3.3 `src/app/navigation/deepLinkResolver.ts` (재작성)

손으로 작성한 경로 분기(`MAIN_TAB_PATHS`, `createRootStack`, `if (path === ...)`)를 모두 지운다. `deepLinkConfig` 해석은 `getStateFromPath`에 맡긴다. 이 파일에는 config로 표현할 수 없는 두 가지만 남긴다.

- **경로 정규화**: 대소문자를 무시하고, 끝의 `/`를 제거한다. 쿼리 값은 바꾸지 않는다.
- **부모 탭**: 스택 화면 아래에 깔 탭. config의 `initialRouteName`으로는 화면마다 다른 탭을 지정할 수 없어 따로 매핑한다.

```ts
import { getStateFromPath } from "@react-navigation/native";
import { deepLinkConfig, deepLinkPrefixes } from "./deepLinkConfig";
import type { MainTabParamList, RootStackParamList } from "./navigationTypes";

type DeepLinkState = NonNullable<ReturnType<typeof getStateFromPath>>;

// 스택 화면으로 바로 진입해도 뒤로가기가 동작하도록 아래에 깔 탭
const PARENT_TABS: Partial<
  Record<keyof RootStackParamList, keyof MainTabParamList>
> = {
  Meal: "Home",
  Notification: "Home",
  OutSleepingApply: "OutSleeping",
  NightStudyApply: "NightStudy",
};

const normalizePath = (path: string) => {
  const [rawPath, query] = path.split("?", 2);
  const normalizedPath = rawPath.replace(/^\/+|\/+$/g, "").toLowerCase();

  return query === undefined ? normalizedPath : `${normalizedPath}?${query}`;
};

const withParentTab = (state: DeepLinkState): DeepLinkState => {
  if (state.routes.length !== 1) return state;

  const [route] = state.routes;
  const parentTab = PARENT_TABS[route.name as keyof RootStackParamList];
  if (!parentTab) return state;

  return {
    index: 1,
    routes: [{ name: "Main", state: { routes: [{ name: parentTab }] } }, route],
  };
};

export function getDeepLinkStateFromPath(path: string) {
  const normalizedPath = normalizePath(path);

  // 빈 경로(dodamdodam://)는 기존과 같이 딥링크로 취급하지 않는다.
  if (normalizedPath.split("?")[0] === "") return undefined;

  const state = getStateFromPath(normalizedPath, deepLinkConfig);
  return state ? withParentTab(state) : undefined;
}

const extractRelativeUrl = (url: string) => {
  const prefix = deepLinkPrefixes.find(candidate => url.startsWith(candidate));
  if (!prefix) return null;

  return url.slice(prefix.length);
};

export function resolveDeepLink(url: string) {
  const path = extractRelativeUrl(url);
  return path === null ? undefined : getDeepLinkStateFromPath(path);
}
```

- 반환값이 `null`에서 `undefined`로 바뀐다. 호출부는 모두 truthy 체크나 `??`로 쓰고 있어 그대로 동작한다.
- `CommonActions.reset`에 `getStateFromPath`의 결과(PartialState)를 넘길 때 타입이 맞는지 구현 시 확인한다. 맞지 않으면 기존 `ResetState` 타입으로 캐스팅하는 대신, 호출부의 타입을 `Parameters<typeof CommonActions.reset>[0]`로 맞춘다.

### 3.4 `src/app/navigation/linking.ts`

```ts
import { deepLinkConfig, deepLinkPrefixes } from "./deepLinkConfig";
import { getDeepLinkStateFromPath, resolveDeepLink } from "./deepLinkResolver";

export const createLinking = ({ onAuthenticationRequired }: CreateLinkingOptions)
  : LinkingOptions<RootStackParamList> => ({
  prefixes: deepLinkPrefixes,
  config: deepLinkConfig,
  getStateFromPath: path => getDeepLinkStateFromPath(path),

  // getInitialURL, subscribe는 기존 그대로
});
```

- 인라인으로 적혀 있던 `config`를 `deepLinkConfig`로 바꾼다.
- `getStateFromPath`를 지정해서, 실행 중에 받은 링크(`listener(url)`)도 Landing/로그인과 **같은 정규화와 부모 탭 규칙**으로 해석되게 한다.
- `getInitialURL`과 `subscribe`의 인증 보류 로직은 바꾸지 않는다.

### 3.5 호출부

`LandingPage.tsx`와 `LoginFormPage.tsx`는 `resolveDeepLink`를 계속 사용하므로 import 경로 외에는 바꿀 것이 없다. `deepLinkPrefixes`를 `deepLinkResolver`에서 import하는 곳이 있으면 `deepLinkConfig`로 바꾼다.

---

## 4. 동작 변화

| URL | 변경 전 | 변경 후 |
|---|---|---|
| `dodamdodam://meal` | `Main > Meal`(존재하지 않는 탭)로 reset | `[Main(Home), Meal]`로 reset, 뒤로가기 → Home |
| `dodamdodam://HOME`, `.../Home/` (실행 중) | config가 대소문자를 구분해 매칭 실패 → 무시 | 정규화 후 Home 탭 |
| `dodamdodam://notifications` (실행 중) | 현재 화면 위에 `Notification`을 `navigate` | `[Main(Home), Notification]`로 **reset** (아래 6.1 참고) |
| `dodamdodam://out-sleeping/apply`, `night-study/apply` (실행 중) | 현재 화면 위에 `navigate` | 부모 탭을 포함해 **reset** |
| 탭 경로 `home` 등 (실행 중) | 해당 탭으로 `navigate` | 그대로 (routes가 1개라 react-navigation이 `navigate`로 처리) |
| 콜드 스타트, 로그인 후 | 리졸버 결과로 reset | 같음 (해석 주체만 config로 바뀜) |
| `dodamdodam://` (빈 경로) | 무시 | 무시 (유지) |
| 등록되지 않은 경로 | 무시 | 무시 |

실행 중 링크가 reset으로 바뀌는 이유가 있다. react-navigation의 `getActionFromState`는 routes가 2개 이상이고 첫 화면이 config의 `initialRouteName`이 아니면 `RESET` 액션을 만든다. 부모 탭을 깐 state가 여기에 해당한다.

---

## 5. 검증

### 5.1 정적 검사

```bash
npx tsc --noEmit -p .
```

- `BottomTabNavigator.tsx(50,9)`와 `RootStackNavigator.tsx(49,19)` 오류가 사라져야 한다.
- `widgets/index.ts`의 `home-meal` 모듈 오류는 이 작업과 무관하며, 별도로 확인한다.

### 5.2 실기기 / 시뮬레이터

iOS 시뮬레이터:

```bash
xcrun simctl openurl booted "dodamdodam://meal"
```

Android 에뮬레이터:

```bash
adb shell am start -W -a android.intent.action.VIEW -d "dodamdodam://meal" com.b1nd.dodam.student
```

아래 URL마다 네 가지 상태에서 확인한다: 콜드 스타트(로그인됨), 콜드 스타트(로그아웃), 실행 중(로그인됨), 실행 중(로그아웃).

| URL | 기대 결과 |
|---|---|
| `dodamdodam://home` | Home 탭 |
| `dodamdodam://out-sleeping` | 외박 탭 |
| `dodamdodam://night-study` | 심자 탭 |
| `dodamdodam://more` | 더보기 탭 |
| `dodamdodam://meal` | 급식 화면, 뒤로가기 → Home 탭 |
| `dodamdodam://notifications` | 알림 화면, 뒤로가기 → Home 탭 |
| `dodamdodam://out-sleeping/apply` | 외박 신청, 뒤로가기 → 외박 탭 |
| `dodamdodam://night-study/apply?tab=project` | 심자 신청(프로젝트 탭 선택), 뒤로가기 → 심자 탭 |
| `dodamdodam://night-study/apply?tab=foo` | 심자 신청(개인 탭 선택) |
| `dodamdodam://MEAL/` | `meal`과 동일 |
| `dodamdodam://unknown` | 아무 변화 없음 |

- 로그아웃 상태에서는 Login으로 이동한 뒤, 로그인을 완료하면 위 기대 결과로 이동해야 한다.
- 홈 급식 카드와 푸시 `/meal`이 기존처럼 급식 화면으로 가는지도 회귀 확인한다.

---

## 6. 결정 사항

### 6.1 실행 중 링크: reset vs navigate

- **채택: reset.** `linking.getStateFromPath`에 부모 탭 규칙까지 넣어서, 모든 진입 경로가 같은 state를 쓴다. 작성 중이던 화면(예: 외박 신청 폼)은 사라지지만, 푸시 알림을 눌렀을 때도 같은 일이 생기므로 받아들인다.
- 대안: `linking.getStateFromPath`에서는 정규화만 하고 `withParentTab`을 빼면, 실행 중 링크는 기존처럼 `navigate`로 동작한다. 이 경우 같은 URL이라도 콜드 스타트와 실행 중의 결과 스택이 달라진다.

### 6.2 `aid` 경로

AID 탭은 아직 경로가 없다. 이번 작업은 기존 경로를 바로잡는 범위로 한정하고 추가하지 않는다. 필요하면 `deepLinkConfig`의 `Main.screens`에 `Aid: "aid"` 한 줄만 추가하면 된다.
