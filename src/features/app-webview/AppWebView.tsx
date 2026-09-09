import React, { useCallback, useState } from "react";
import { Linking, View } from "react-native";
import { WebView } from "react-native-webview";
import { EmptyState } from "@shared/ui";
import { TextButton } from "@shared/ui/buttons";
import { Globe } from "@shared/icons/illustration";
import { useAppBridge } from "./useAppBridge";
import { useAppWebViewUri } from "./useAppWebViewUri";
import { useLinkOpenMode } from "@features/settings";

const originOf = (url: string) => url.match(/^https?:\/\/[^/]+/)?.[0] ?? "";

export const AppWebView = () => {
	const { webViewProps, NfcSheet } = useAppBridge();
	const { uri } = useAppWebViewUri();
	const { modeRef } = useLinkOpenMode();
	// ref는 브릿지가 쓰고 있어 reload()를 직접 못 부른다. key를 바꿔 다시 마운트하는 방식으로 재시도한다.
	const [reloadKey, setReloadKey] = useState(0);
	const retry = useCallback(() => setReloadKey((key) => key + 1), []);

	const handleLinkRequest = useCallback(
		(req: { url: string; isTopFrame?: boolean }) => {
			if (req.isTopFrame === false) return true;
			if (originOf(req.url) === originOf(uri)) return true;
			const isExternalBrowser = modeRef.current === "browser";
			if (!/^https?:/.test(req.url) || isExternalBrowser) {
				Linking.openURL(req.url).catch(() => {});
				return false;
			}

			return true;
		},
		[uri, modeRef],
	);

	if (!uri) return <View style={{ flex: 1 }} />;

	return (
		<View style={{ flex: 1 }}>
			<WebView
				{...webViewProps}
				key={reloadKey}
				source={{ uri }}
				onShouldStartLoadWithRequest={handleLinkRequest}
				// iOS 16.4+는 이 값이 켜져야 Safari 웹 검사기에 WebView가 잡힌다.
				webviewDebuggingEnabled={__DEV__}
				onError={({ nativeEvent }) =>
					console.error("[AppWebView] 로드 실패", nativeEvent.code, nativeEvent.description, nativeEvent.url)
				}
				onHttpError={({ nativeEvent }) =>
					console.error("[AppWebView] HTTP 오류", nativeEvent.statusCode, nativeEvent.url)
				}
				renderError={() => (
					<View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
						<EmptyState
							icon={<Globe size={36} />}
							message={"페이지를 불러오지 못했어요.\n네트워크 상태를 확인해 주세요."}
							cta={
								<TextButton size="large" onPress={retry}>
									다시 시도
								</TextButton>
							}
						/>
					</View>
				)}
				overScrollMode="never"
				bounces={false}
				setBuiltInZoomControls={false}
				setDisplayZoomControls={false}
				showsHorizontalScrollIndicator={false}
				scalesPageToFit={true}
				style={{ backgroundColor: "transparent" }}
			/>
			<NfcSheet />
		</View>
	);
};
