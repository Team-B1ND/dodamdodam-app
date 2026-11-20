const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./helpers/load-typescript.cjs');
const flush = () => new Promise(resolve => setImmediate(resolve));
function bridge(location) {
  const handlers = {}, pushes = {};
  const { useAppBridge } = load('src/features/app-webview/useAppBridge.ts', {
    '@react-navigation/native': { useNavigation: () => ({}) },
    'react-native': { BackHandler: {} },
    '@b1nd/aid-kit/bridge-kit/app': {
      Actions: new Proxy({}, { get: (_, name) => name }),
      Errors: { UNKNOWN: 'UNKNOWN', PREMISSION_DENIED: 'PERMISSION_DENIED' },
      core: { mount: (a, f) => { handlers[a] = f; }, mountPush: (a, f) => { pushes[a] = f; } },
      useBridgeCore: () => ({ webViewProps: {} }), useBridgeUi: () => ({}),
    },
    'expo-location': { Accuracy: { High: 1 }, ...location },
    'expo-image-picker': {}, 'expo-document-picker': {}, 'expo-file-system': {}, 'expo-sharing': {},
    './screens/NfcRead': { useNfcRead: () => ({}) },
  });
  useAppBridge();
  return { handlers, pushes };
}
test('a disabled location service returns a bridge error instead of rejecting', async () => {
  const { handlers } = bridge({
    requestForegroundPermissionsAsync: async () => ({ status: 'granted' }),
    getCurrentPositionAsync: async options => {
      assert.equal(options.mayShowUserSettingsDialog, false);
      throw new Error('Location settings unavailable');
    },
  });
  assert.equal(await handlers.GPS_GET(), 'UNKNOWN');
});
test('starting a location push does not prompt for permission and handles settings failures', async () => {
  let permissionRequests = 0;
  const { pushes } = bridge({
    requestForegroundPermissionsAsync: async () => { permissionRequests++; },
    getForegroundPermissionsAsync: async () => ({ status: 'granted' }),
    watchPositionAsync: async options => {
      assert.equal(options.mayShowUserSettingsDialog, false);
      throw new Error('Location settings unavailable');
    },
  });
  const stop = pushes.GPS_GET(() => assert.fail('No location to send'));
  await flush();
  stop();
  assert.equal(permissionRequests, 0);
});
test('a location subscription resolving after navigation away is removed and cannot send', async () => {
  let resolveWatch, callback, removals = 0;
  const { pushes } = bridge({
    getForegroundPermissionsAsync: async () => ({ status: 'granted' }),
    watchPositionAsync: (_, send) => {
      callback = send;
      return new Promise(resolve => { resolveWatch = resolve; });
    },
  });
  const stop = pushes.GPS_GET(() => assert.fail('Unmounted service received location'));
  await flush();
  stop();
  resolveWatch({ remove: () => { removals++; } });
  await flush();
  callback({});
  assert.equal(removals, 1);
});
