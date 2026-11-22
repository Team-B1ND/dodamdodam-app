const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const { test } = require("node:test");
const loadTypeScript = require("./helpers/load-typescript.cjs");

const requireFromNavigation = createRequire(require.resolve("@react-navigation/native/package.json"));
const { getStateFromPath } = requireFromNavigation("@react-navigation/core");

function loadNavigation(platform, globals) {
  const config = loadTypeScript("src/app/navigation/deepLinkConfig.ts", {
    "expo-linking": { createURL: () => "exp://local.example/--/" },
    "react-native": { Platform: { OS: platform } },
  });
  const resolver = loadTypeScript("src/app/navigation/deepLinkResolver.ts", {
    "@react-navigation/native": { getStateFromPath },
    "./deepLinkConfig": config,
  }, globals);
  return { config, resolver };
}

const { config, resolver } = loadNavigation("android");
const { resolveDeepLink } = resolver;

function stackDestination(state) {
  const { path, ...route } = state.routes[1];
  return route;
}

function createLinkingFixture({ initialUrl = null, validate = async () => true } = {}) {
  let eventListener;
  let removed = 0;
  let authenticationRequests = 0;
  let validationRequests = 0;
  const { pendingDeepLink } = loadTypeScript("src/app/navigation/pendingDeepLink.ts");
  const { createLinking } = loadTypeScript("src/app/navigation/linking.ts", {
    "@react-navigation/native": {
      CommonActions: { reset: state => ({ type: "RESET", payload: state }) },
    },
    "expo-linking": {
      getInitialURL: async () => initialUrl,
      addEventListener: (event, listener) => {
        assert.equal(event, "url");
        eventListener = listener;
        return { remove: () => { removed += 1; } };
      },
    },
    "@features/auth/session": {
      validateSession: () => {
        validationRequests += 1;
        return validate();
      },
    },
    "./deepLinkConfig": config,
    "./deepLinkResolver": resolver,
    "./pendingDeepLink": { pendingDeepLink },
  });
  return {
    linking: createLinking({ onAuthenticationRequired: () => { authenticationRequests += 1; } }),
    pendingDeepLink,
    deliver: url => eventListener({ url }),
    get removed() { return removed; },
    get authenticationRequests() { return authenticationRequests; },
    get validationRequests() { return validationRequests; },
  };
}

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

test("existing tabs and application routes keep their destinations", () => {
  for (const [path, screen] of Object.entries({
    home: "Home", "out-sleeping": "OutSleeping",
    "night-study": "NightStudy", more: "More", aid: "Aid",
  })) {
    const [route] = resolveDeepLink(`dodamdodam://${path}`).routes;
    assert.equal(route.name, "Main");
    assert.equal(route.state.routes[0].name, screen);
  }
  for (const [path, screen] of [["MEAL/", "Meal"], ["notifications", "Notification"]]) {
    const state = resolveDeepLink(`dodamdodam://${path}`);
    assert.equal(state.index, 1);
    assert.equal(state.routes[0].state.routes[0].name, "Home");
    assert.deepEqual(stackDestination(state), { name: screen });
  }
  assert.deepEqual(stackDestination(resolveDeepLink("dodamdodam://out-sleeping/apply")), {
    name: "OutSleepingApply",
  });
  for (const [query, tab] of [["project", "project"], ["personal", "personal"], ["invalid", "personal"], ["", "personal"]]) {
    assert.deepEqual(stackDestination(resolveDeepLink(`dodamdodam://night-study/apply?tab=${query}`)), {
      name: "NightStudyApply", params: { tab },
    });
  }
});

test("AID links preserve service ID case, decode once, and keep the AID tab as the back destination", () => {
  const expected = {
    index: 1, routes: [
      { name: "Main", state: { routes: [{ name: "Aid" }] } },
      { name: "AidEntry", params: { appId: "Service-ABC_123" }, path: "apps/Service-ABC_123" },
    ],
  };
  assert.deepEqual(resolveDeepLink("dodamdodam://apps/Service%2DABC_123"), expected);
  assert.deepEqual(resolveDeepLink("exp://local.example/--/apps/Service-ABC_123"), expected);
  assert.equal(stackDestination(resolveDeepLink("dodamdodam://apps/Service%252FId")).params.appId, "Service%2FId");
});

test("AID links cannot supply a WebView URL or override the path ID via query parameters", () => {
  const state = resolveDeepLink("dodamdodam://apps/TrustedId?appId=OtherId&appUrl=https%3A%2F%2Funtrusted.example&name=Fake");
  assert.deepEqual(stackDestination(state), { name: "AidEntry", params: { appId: "TrustedId" } });
});

test("foreign schemes and malformed AID destinations are ignored", () => {
  for (const url of [
    "https://untrusted.example/aid/App", "other://apps/App", "dodamdodam://unknown",
    "dodamdodam://constructor", "dodamdodam://__proto__", "dodamdodam://toString",
    "dodamdodam://apps", "dodamdodam://apps/", "dodamdodam://apps/App/Other",
    "dodamdodam://apps/App%2FOther", "dodamdodam://apps/App%5COther",
    "dodamdodam://apps/%", "dodamdodam://apps/%GG", "dodamdodam://apps/%E0%A4%A",
    "dodamdodam://apps/App%20Name", "dodamdodam://apps/App%00", "dodamdodam://apps/App%7F",
    "dodamdodam://apps/App%3Fquery", "dodamdodam://apps/App%23fragment",
    `dodamdodam://apps/${"a".repeat(201)}`,
  ]) assert.equal(resolveDeepLink(url), null, url);
});

test("cold start holds a recognized link until the authentication flow resumes it", async () => {
  const url = "dodamdodam://apps/ColdStart";
  const fixture = createLinkingFixture({ initialUrl: url });
  assert.equal(await fixture.linking.getInitialURL(), null);
  assert.equal(fixture.pendingDeepLink.peek(), url);
  assert.equal(fixture.validationRequests, 0);
  assert.deepEqual(stackDestination(resolveDeepLink(fixture.pendingDeepLink.consume())), {
    name: "AidEntry", params: { appId: "ColdStart" },
  });
  assert.equal(fixture.pendingDeepLink.hasPending(), false);
});

test("unknown cold-start links do not become pending authentication destinations", async () => {
  const fixture = createLinkingFixture({ initialUrl: "https://untrusted.example/aid/Id" });
  assert.equal(await fixture.linking.getInitialURL(), null);
  assert.equal(fixture.pendingDeepLink.peek(), null);
});

test("warm and cold AID links produce identical destinations and reset the navigation stack", () => {
  const fixture = createLinkingFixture();
  const coldState = resolveDeepLink("dodamdodam://apps/Mixed%2DCase");
  const warmState = fixture.linking.getStateFromPath("apps/Mixed%2DCase");
  assert.deepEqual(warmState, coldState);
  assert.deepEqual(fixture.linking.getActionFromState(warmState), {
    type: "RESET", payload: coldState,
  });
  assert.equal(fixture.linking.getStateFromPath("apps/%"), undefined);
});

test("authenticated warm entry emits the recognized link", async () => {
  const fixture = createLinkingFixture();
  const emitted = [];
  const unsubscribe = fixture.linking.subscribe(url => emitted.push(url));
  await fixture.deliver("dodamdodam://apps/LoggedIn");
  assert.deepEqual(emitted, ["dodamdodam://apps/LoggedIn"]);
  assert.equal(fixture.authenticationRequests, 0);
  assert.equal(fixture.pendingDeepLink.peek(), null);
  unsubscribe();
  assert.equal(fixture.removed, 1);
});

test("unauthenticated warm entry preserves the target and requests login", async () => {
  const fixture = createLinkingFixture({ validate: async () => false });
  const emitted = [];
  fixture.linking.subscribe(url => emitted.push(url));
  await fixture.deliver("dodamdodam://apps/AfterLogin");
  assert.deepEqual(emitted, []);
  assert.equal(fixture.authenticationRequests, 1);
  assert.equal(fixture.pendingDeepLink.peek(), "dodamdodam://apps/AfterLogin");
});

test("an authenticated newer link clears a previous login destination", async () => {
  let authenticated = false;
  const fixture = createLinkingFixture({ validate: async () => authenticated });
  const emitted = [];
  fixture.linking.subscribe(url => emitted.push(url));
  await fixture.deliver("dodamdodam://apps/Previous");
  assert.equal(fixture.pendingDeepLink.peek(), "dodamdodam://apps/Previous");
  authenticated = true;
  await fixture.deliver("dodamdodam://apps/Current");
  assert.deepEqual(emitted, ["dodamdodam://apps/Current"]);
  assert.equal(fixture.pendingDeepLink.peek(), null);
});

test("session expiry during AID resolution retains the current service for login continuation", () => {
  const { pendingDeepLink } = loadTypeScript("src/app/navigation/pendingDeepLink.ts");
  pendingDeepLink.saveAidEntry({ name: "AidEntry", params: { appId: "Mixed+Case" } });
  assert.equal(pendingDeepLink.peek(), "dodamdodam://apps/Mixed%2BCase");
  assert.deepEqual(stackDestination(resolveDeepLink(pendingDeepLink.peek())), {
    name: "AidEntry", params: { appId: "Mixed+Case" },
  });
  pendingDeepLink.saveAidEntry({ name: "Login", params: { appId: "Unrelated" } });
  pendingDeepLink.saveAidEntry(undefined);
  pendingDeepLink.saveAidEntry({ name: "AidEntry", params: { appId: null } });
  assert.equal(pendingDeepLink.peek(), "dodamdodam://apps/Mixed%2BCase");
  pendingDeepLink.saveAidEntry({ name: "InAppLaunch", params: { appId: "IOS-App" } });
  assert.equal(pendingDeepLink.peek(), "dodamdodam://apps/IOS-App");
});

test("unrecognized warm links do not trigger authentication or navigation", async () => {
  const fixture = createLinkingFixture();
  const emitted = [];
  fixture.linking.subscribe(url => emitted.push(url));
  await fixture.deliver("dodamdodam://apps/%");
  assert.deepEqual(emitted, []);
  assert.equal(fixture.validationRequests, 0);
});

test("the newest warm link wins when authentication checks finish out of order", async () => {
  const older = deferred();
  const newer = deferred();
  const validations = [older.promise, newer.promise];
  const fixture = createLinkingFixture({ validate: () => validations.shift() });
  const emitted = [];
  fixture.linking.subscribe(url => emitted.push(url));
  const first = fixture.deliver("dodamdodam://apps/Older");
  const second = fixture.deliver("dodamdodam://apps/Newer");
  newer.resolve(true);
  await second;
  older.resolve(false);
  await first;
  assert.deepEqual(emitted, ["dodamdodam://apps/Newer"]);
  assert.equal(fixture.authenticationRequests, 0);
  assert.equal(fixture.pendingDeepLink.peek(), null);
});

test("unsubscribing cancels an in-flight authentication result", async () => {
  const authentication = deferred();
  const fixture = createLinkingFixture({ validate: () => authentication.promise });
  const emitted = [];
  const unsubscribe = fixture.linking.subscribe(url => emitted.push(url));
  const delivery = fixture.deliver("dodamdodam://apps/Cancelled");
  unsubscribe();
  authentication.resolve(false);
  await delivery;
  assert.deepEqual(emitted, []);
  assert.equal(fixture.authenticationRequests, 0);
  assert.equal(fixture.pendingDeepLink.peek(), null);
});

function loadActiveApps(getActiveApps, globals) {
  return loadTypeScript("src/entities/inapp/api/activeApps.ts", {
    "./index": { inappApi: { getActiveApps } },
  }, globals);
}
const app = (appId, appUrl = `https://services.example/${appId}`) => ({
  appId, appUrl, name: `Service ${appId}`, subtitle: "", description: "", iconUrl: "", darkIconUrl: null,
});
const page = (content, hasNext = false) => ({ data: { data: { content, hasNext } } });

test("active-app catalog follows pagination and excludes non-web or credential-bearing destinations", async () => {
  const calls = [];
  const pages = [page([app("First"), app("Unsafe", "javascript:alert(1)")], true), page([
    app("Second"), app("Credentials", "https://user:password@services.example"),
  ])];
  const { getAllActiveInApps } = loadActiveApps(async (index, size) => {
    calls.push([index, size]);
    return pages[index];
  });
  assert.deepEqual((await getAllActiveInApps()).map(item => item.appId), ["First", "Second"]);
  assert.deepEqual(calls, [[0, 10], [1, 10]]);
});

test("AID service lookup fetches current server data and stops at the matching page", async () => {
  let latestUrl = "https://services.example/old";
  const calls = [];
  const { getActiveInApp } = loadActiveApps(async index => {
    calls.push(index);
    return index === 0 ? page([app("Other")], true) : page([app("Target", latestUrl)], true);
  });
  assert.equal((await getActiveInApp("Target")).appUrl, latestUrl);
  latestUrl = "https://services.example/current";
  assert.equal((await getActiveInApp("Target")).appUrl, latestUrl);
  assert.deepEqual(calls, [0, 1, 0, 1]);
});

test("missing or unsafe services are unavailable rather than launched from stale data", async () => {
  const { getActiveInApp } = loadActiveApps(async () => page([app("Unsafe", "file:///private/data")]));
  assert.equal(await getActiveInApp("Removed"), null);
  assert.equal(await getActiveInApp("Unsafe"), null);
});

test("native active-app validation accepts uppercase HTTPS and @ outside the URL authority", async () => {
  const entries = [
    app("Uppercase", "HTTPS://SERVICES.EXAMPLE/Path?Mode=Compact"),
    app("Path", "https://services.example/@member"),
    app("Query", "https://services.example/path?email=demo@example.test"),
    app("Fragment", "https://services.example/path#@profile"),
  ];
  const { getAllActiveInApps, getActiveInApp } = loadActiveApps(
    async () => page(entries), require("./helpers/load-react-native-url.cjs"),
  );
  assert.deepEqual(Array.from(await getAllActiveInApps(), item => item.appId), ["Uppercase", "Path", "Query", "Fragment"]);
  assert.equal((await getActiveInApp("Uppercase")).appUrl, entries[0].appUrl);
});

test("native active-app validation rejects authority credentials, backslashes and control characters", async () => {
  const entries = [
    app("Password", "https://user:fixture@services.example/path"),
    app("Username", "https://user@services.example/path"),
    app("AuthoritySlash", "https://services.example\\@untrusted.example/path"),
    app("PathSlash", "https://services.example/path\\other"),
    app("Newline", "https://services.example/\npath"),
    app("Tab", "https://services.example/\tpath"),
    app("Null", "https://services.example/\u0000path"),
    app("Delete", "https://services.example/\u007fpath"),
    app("Opaque", "javascript:alert(1)"),
    app("EmptyHost", "https:///path"),
  ];
  const { getAllActiveInApps } = loadActiveApps(
    async () => page(entries), require("./helpers/load-react-native-url.cjs"),
  );
  assert.equal((await getAllActiveInApps()).length, 0);
});

test("broken pagination and connection failures remain retryable errors", async () => {
  const empty = loadActiveApps(async () => page([], true));
  await assert.rejects(empty.getAllActiveInApps());
  let calls = 0;
  const repeated = loadActiveApps(async () => { calls += 1; return page([app("Repeated")], true); });
  await assert.rejects(repeated.getAllActiveInApps());
  assert.equal(calls, 2);
  const offline = loadActiveApps(async () => { throw new Error("offline fixture"); });
  await assert.rejects(offline.getActiveInApp("Target"), /offline fixture/);
});

const uriBuilder = loadTypeScript("src/features/app-webview/buildAppWebViewUri.ts");

test("service URI context belongs in the query before an existing fragment", () => {
  const uri = uriBuilder.buildAppWebViewUri("https://services.example/app?mode=compact#details", {
    top: 24, bottom: 16, token: "fixture +/&=?#value",
  });
  const parsed = new URL(uri);
  assert.equal(parsed.pathname, "/app");
  assert.equal(parsed.hash, "#details");
  assert.equal(parsed.searchParams.get("mode"), "compact");
  assert.equal(parsed.searchParams.get("top"), "24");
  assert.equal(parsed.searchParams.get("bottom"), "16");
  assert.equal(parsed.searchParams.get("token"), "fixture +/&=?#value");
});

test("service URI replaces stale context parameters and represents a missing token as empty", () => {
  const parsed = new URL(uriBuilder.buildAppWebViewUri(
    "https://services.example/app?top=old&top=duplicate&bottom=old&token=stale&mode=compact",
    { top: 0, bottom: 10, token: null },
  ));
  assert.deepEqual(parsed.searchParams.getAll("top"), ["0"]);
  assert.deepEqual(parsed.searchParams.getAll("bottom"), ["10"]);
  assert.deepEqual(parsed.searchParams.getAll("token"), [""]);
  assert.equal(parsed.searchParams.get("mode"), "compact");
});

test("service URI does not depend on the platform URL implementation or rewrite signed query values", () => {
  class UnsupportedURL {
    constructor() { throw new Error("Platform URL mutation is unsupported"); }
  }
  const { buildAppWebViewUri } = loadTypeScript("src/features/app-webview/buildAppWebViewUri.ts", {}, {
    URL: UnsupportedURL, URLSearchParams: UnsupportedURL,
  });
  assert.equal(buildAppWebViewUri(
    "https://services.example/app?signature=a%20b%2fc&flag&to%70=old&bottom=old&token=stale#section?view=detail",
    { top: 20, bottom: 10, token: "fixture +/#" },
  ), "https://services.example/app?signature=a%20b%2fc&flag&top=20&bottom=10&token=fixture%20%2B%2F%23#section?view=detail");
});

test("service URI query/hash behavior also holds with the installed React Native URL polyfills", () => {
  const nativeUrl = require("./helpers/load-react-native-url.cjs");
  const { buildAppWebViewUri } = loadTypeScript("src/features/app-webview/buildAppWebViewUri.ts", {}, nativeUrl);
  const parsed = new URL(buildAppWebViewUri(
    "https://services.example/app?mode=compact&token=old#details",
    { top: 24, bottom: 16, token: "fixture +value" },
  ));
  assert.deepEqual(parsed.searchParams.getAll("token"), ["fixture +value"]);
  assert.equal(parsed.searchParams.get("mode"), "compact");
  assert.equal(parsed.hash, "#details");
});

test("malformed query encoding cannot crash the native deep-link parser", () => {
  const { resolver: nativeResolver } = loadNavigation("android", require("./helpers/load-react-native-url.cjs"));
  assert.doesNotThrow(() => nativeResolver.resolveDeepLink("dodamdodam://night-study/apply?tab=%"));
  assert.doesNotThrow(() => nativeResolver.resolveDeepLink("dodamdodam://apps/ValidId?unused=%"));
});

test("widget synchronization sends display metadata without launch URLs or authentication context", async () => {
  const saved = [];
  const { saveAidAppsToWidget } = loadTypeScript("src/shared/lib/widget/aidWidget.ts", {
    "react-native": {
      NativeModules: { AidWidget: { updateApps: async json => { saved.push(JSON.parse(json)); } } },
      Platform: { OS: "android" },
    },
  });
  await saveAidAppsToWidget([{
    ...app("Selected"),
    subtitle: "Service description",
    iconUrl: "https://assets.example/icon.png",
    darkIconUrl: "https://assets.example/icon-dark.png",
  }]);
  assert.deepEqual(saved, [[{
    appId: "Selected",
    name: "Service Selected",
    subtitle: "Service description",
    iconUrl: "https://assets.example/icon.png",
    darkIconUrl: "https://assets.example/icon-dark.png",
  }]]);
});

// A single-state/effect harness runs the actual hook across render/effect boundaries.
function createUriHookFixture() {
  let route = { params: { appUrl: "https://services.example/first", name: "First" } };
  let insets = { top: 20, bottom: 12 };
  let initialized = false;
  let state;
  let dependencies;
  let pendingEffect;
  let cleanup;
  const tokenRequests = [];
  const { useAppWebViewUri } = loadTypeScript("src/features/app-webview/useAppWebViewUri.ts", {
    react: {
      useState: initial => {
        if (!initialized) { state = initial; initialized = true; }
        return [state, next => { state = next; }];
      },
      useEffect: (effect, nextDependencies) => {
        if (!dependencies || nextDependencies.some((value, index) => !Object.is(value, dependencies[index]))) {
          dependencies = nextDependencies;
          pendingEffect = effect;
        }
      },
    },
    "@react-navigation/native": { useRoute: () => route },
    "react-native-safe-area-context": { useSafeAreaInsets: () => insets },
    "@entities/api/common/tokenStorage": {
      tokenStorage: { getAccessToken: () => {
        const request = deferred();
        tokenRequests.push(request);
        return request.promise;
      } },
    },
    "./buildAppWebViewUri": uriBuilder,
  });
  return {
    render: () => useAppWebViewUri().uri,
    flushEffects: () => {
      if (!pendingEffect) return;
      cleanup?.();
      const effect = pendingEffect;
      pendingEffect = undefined;
      cleanup = effect();
    },
    changeService: appUrl => { route = { params: { appUrl, name: "Changed" } }; },
    changeInsets: next => { insets = next; },
    tokenRequests,
  };
}

test("WebView hides the old service URI immediately when destination or insets change", async () => {
  const fixture = createUriHookFixture();
  assert.equal(fixture.render(), "");
  fixture.flushEffects();
  fixture.tokenRequests[0].resolve("fixture-first");
  await Promise.resolve();
  assert.equal(new URL(fixture.render()).pathname, "/first");
  fixture.changeService("https://services.example/second");
  assert.equal(fixture.render(), "");
  fixture.flushEffects();
  fixture.tokenRequests[1].resolve("fixture-second");
  await Promise.resolve();
  assert.equal(new URL(fixture.render()).pathname, "/second");
  fixture.changeInsets({ top: 30, bottom: 12 });
  assert.equal(fixture.render(), "");
});

test("a late token lookup for the previous service cannot replace the current service URI", async () => {
  const fixture = createUriHookFixture();
  fixture.render();
  fixture.flushEffects();
  fixture.changeService("https://services.example/second");
  fixture.render();
  fixture.flushEffects();
  fixture.tokenRequests[1].resolve("fixture-current");
  await Promise.resolve();
  const currentUri = fixture.render();
  assert.equal(new URL(currentUri).pathname, "/second");
  fixture.tokenRequests[0].resolve("fixture-obsolete");
  await Promise.resolve();
  assert.equal(fixture.render(), currentUri);
});


test("Android supports both service link formats and gives the short aid path to the AID tab", () => {
  const fixture = createLinkingFixture();
  assert.equal(fixture.linking.config.screens.AidEntry, "apps/:appId");
  for (const id of ["Service-ID", "Mixed%2BCase", "service-123"]) {
    assert.deepEqual(resolveDeepLink(`dodamdodam://aid/${id}`), resolveDeepLink(`dodamdodam://apps/${id}`));
    assert.deepEqual(fixture.linking.getStateFromPath(`aid/${id}`), fixture.linking.getStateFromPath(`apps/${id}`));
  }
  for (const path of ["%", "App%2FOther", "App/Other"]) {
    assert.equal(resolveDeepLink(`dodamdodam://aid/${path}`), null);
    assert.equal(resolveDeepLink(`dodamdodam://apps/${path}`), null);
  }
});

test("iOS keeps the existing mini-app launch screen behind the same public link", () => {
  const { resolver } = loadNavigation("ios");
  const state = resolver.resolveDeepLink("dodamdodam://apps/Mixed%2BCase?appId=Other");
  assert.equal(state.routes[0].state.routes[0].name, "Aid");
  assert.deepEqual(stackDestination(state), {
    name: "InAppLaunch", params: { appId: "Mixed+Case" },
  });
});
