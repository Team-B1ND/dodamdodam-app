import { registerRootComponent } from 'expo';

import App from '@app/index';
import { setupBackgroundMessageHandler } from '@shared/lib/notification';

// 앱이 실행되기 전에 등록돼야 백그라운드 메시지가 버려지지 않는다.
setupBackgroundMessageHandler();

registerRootComponent(App);
