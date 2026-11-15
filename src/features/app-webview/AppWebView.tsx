import React, { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Image, Linking, View, useColorScheme } from "react-native";
import { WebView } from "react-native-webview";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation, useRoute } from "@react-navigation/native";
import { EmptyState, WebPopup } from "@shared/ui";
import { TextButton } from "@shared/ui/buttons";
import { Globe } from "@shared/icons/illustration";
import { useAppBridge } from "./useAppBridge";
import { useAppWebViewUri, type AppWebViewRouteProp } from "./useAppWebViewUri";
import { useLinkOpenMode } from "@features/settings";

const originOf = (url: string) => url.match(/^https?:\/\/[^/]+/)?.[0] ?? "";
// 쿼리에 액세스 토큰이 붙어 있어 로그에는 경로까지만 남긴다.
const withoutQuery = (url: string) => url.split("?")[0];

const NETWORK_ERROR_MESSAGE = "페이지를 불러오지 못했어요.\n네트워크 상태를 확인해 주세요.";
// 배포가 덜 됐거나 경로가 없을 때 S3/CloudFront가 403·404 XML(Access Denied)을 그대로 돌려준다.
const SERVER_ERROR_MESSAGE = "지금은 이 서비스를 이용할 수 없어요.\n잠시 후 다시 시도해 주세요.";

const ICON_SIZE = 56;

const LoadFailed = ({ message }: { message: string }) => {
	const navigation = useNavigation();
	const { params } = useRoute<AppWebViewRouteProp>();
	const isDark = useColorScheme() === "dark";
	const iconUri = isDark && params.darkIconUrl ? params.darkIconUrl : params.iconUrl;
	const goBack = useCallback(() => navigation.goBack(), [navigation]);

	// 이 화면은 스와이프 제스처가 꺼져 있고, Android 뒤로 가기는 브릿지가 웹으로 넘긴다.
	// 웹이 없는 상태이니 나중에 등록된 핸들러가 먼저 실행되는 점을 이용해 여기서 직접 빠져나간다.
	useEffect(() => {
		const handler = BackHandler.addEventListener("hardwareBackPress", () => {
			goBack();
			return true;
		});
		return () => handler.remove();
	}, [goBack]);

	return (
		<View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
			<EmptyState
				icon={
					iconUri ? (
						<Image source={{ uri: iconUri }} style={{ width: ICON_SIZE, height: ICON_SIZE, borderRadius: 14 }} />
					) : (
						<Globe size={36} />
					)
				}
				message={message}
				cta={
					<TextButton size="large" onPress={goBack}>
						뒤로 가기
					</TextButton>
				}
			/>
		</View>
	);
};

export const AppWebView = () => {
	const { webViewProps, NfcSheet } = useAppBridge();
	const { uri } = useAppWebViewUri();
	const { modeRef } = useLinkOpenMode();
	const popupRef = useRef<BottomSheetModal>(null);
	const [popupUrl, setPopupUrl] = useState("");
	// 메인 문서가 4xx/5xx로 오면 서버 에러 페이지를 노출하지 않고 앱 화면으로 대체한다.
	const [httpFailed, setHttpFailed] = useState(false);

	const handleLinkRequest = useCallback(
		(req: { url: string; isTopFrame?: boolean }) => {
			if (req.isTopFrame === false) return true;
			if (originOf(req.url) === originOf(uri)) return true;
			if (!/^https?:/.test(req.url) || modeRef.current === "browser") {
				Linking.openURL(req.url).catch(() => {});
				return false;
			}

			setPopupUrl(req.url);
			popupRef.current?.present();
			return false;
		},
		[uri, modeRef],
	);

	if (!uri) return <View style={{ flex: 1 }} />;

	return (
		<View style={{ flex: 1 }}>
			{httpFailed ? (
				<LoadFailed message={SERVER_ERROR_MESSAGE} />
			) : (
				<WebView
					{...webViewProps}
					source={{ uri }}
					onShouldStartLoadWithRequest={handleLinkRequest}
					// iOS 16.4+는 이 값이 켜져야 Safari 웹 검사기에 WebView가 잡힌다.
					webviewDebuggingEnabled={__DEV__}
					onError={({ nativeEvent }) =>
						console.error("[AppWebView] 로드 실패", nativeEvent.code, nativeEvent.description, withoutQuery(nativeEvent.url))
					}
					// 메인 프레임 응답에서만 호출된다(iOS·Android 모두). 이미지·API 같은 하위 요청 실패는 해당 없다.
					onHttpError={({ nativeEvent }) => {
						console.error("[AppWebView] HTTP 오류", nativeEvent.statusCode, withoutQuery(nativeEvent.url));
						setHttpFailed(true);
					}}
					renderError={() => <LoadFailed message={NETWORK_ERROR_MESSAGE} />}
					overScrollMode="never"
					bounces={false}
					setBuiltInZoomControls={false}
					setDisplayZoomControls={false}
					showsHorizontalScrollIndicator={false}
					scalesPageToFit={true}
					style={{ backgroundColor: "transparent" }}
				/>
			)}
			<NfcSheet />
			<WebPopup sheetRef={popupRef} url={popupUrl} onDismiss={() => setPopupUrl("")} />
		</View>
	);
};
