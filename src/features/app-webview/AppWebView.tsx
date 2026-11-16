import React, { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Image, Linking, Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { WebView } from "react-native-webview";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation, useRoute } from "@react-navigation/native";
import { WebPopup } from "@shared/ui";
import { ExclamationmarkCircle } from "@shared/icons/mono";
import { useTheme } from "@shared/theme";
import { shapes, typo } from "@shared/tokens";
import { useAppBridge } from "./useAppBridge";
import { useAppWebViewUri, type AppWebViewRouteProp } from "./useAppWebViewUri";
import { useLinkOpenMode } from "@features/settings";

const originOf = (url: string) => url.match(/^https?:\/\/[^/]+/)?.[0] ?? "";
// 쿼리에 액세스 토큰이 붙어 있어 로그에는 경로까지만 남긴다.
const withoutQuery = (url: string) => url.split("?")[0];

const NETWORK_ERROR_MESSAGE = "페이지를 불러오지 못했어요.\n네트워크 상태를 확인해 주세요.";
// 배포가 덜 됐거나 경로가 없을 때 S3/CloudFront가 403·404 XML(Access Denied)을 그대로 돌려준다.
const SERVER_ERROR_MESSAGE = "지금은 이 서비스를 이용할 수 없어요.\n잠시 후 다시 시도해 주세요.";

const ICON_SIZE = 80;
const BADGE_RING_SIZE = 36;
const BADGE_ICON_SIZE = 28;

const LoadFailed = ({ message }: { message: string }) => {
	const navigation = useNavigation();
	const { params } = useRoute<AppWebViewRouteProp>();
	const { colors } = useTheme();
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
		<View style={styles.container}>
			<View style={styles.message}>
				{/* 아이콘이 없거나(푸시 알림 진입) 불러오는 중·실패일 때는 회색 자리 표시자가 보인다. */}
				<View style={[styles.icon, { backgroundColor: colors.border.subtle }]}>
					{iconUri ? <Image source={{ uri: iconUri }} style={styles.icon} /> : null}
					<View style={[styles.badgeRing, { backgroundColor: colors.background.default }]}>
						<View style={[styles.badgeFill, { backgroundColor: colors.static.white }]} />
						<ExclamationmarkCircle size={BADGE_ICON_SIZE} color={colors.status.warning} />
					</View>
				</View>
				<Text style={[typo("Body1", "Medium"), styles.description, { color: colors.text.tertiary }]}>
					{message}
				</Text>
			</View>
			<Pressable
				onPress={goBack}
				style={({ pressed }) => [styles.backButton, pressed && { backgroundColor: colors.fill.secondary }]}
			>
				<Text style={[typo("Body1", "Bold"), { color: colors.text.primary }]}>뒤로 가기</Text>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 32,
		paddingHorizontal: 24,
	},
	message: {
		alignItems: "center",
		gap: 24,
	},
	icon: {
		width: ICON_SIZE,
		height: ICON_SIZE,
		borderRadius: 20,
	},
	// 페이지 배경색 원으로 아이콘 오른쪽 아래를 파내고 그 위에 경고 아이콘을 올린다.
	badgeRing: {
		position: "absolute",
		left: 50,
		top: 50,
		width: BADGE_RING_SIZE,
		height: BADGE_RING_SIZE,
		borderRadius: BADGE_RING_SIZE / 2,
		alignItems: "center",
		justifyContent: "center",
	},
	// ExclamationmarkCircle의 느낌표는 뚫려 있어서 뒤에 흰 바탕을 깔아야 디자인처럼 보인다.
	badgeFill: {
		position: "absolute",
		width: BADGE_ICON_SIZE / 2,
		height: BADGE_ICON_SIZE / 2,
	},
	description: {
		textAlign: "center",
	},
	backButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: shapes.medium,
	},
});

export const AppWebView = () => {
	const { webViewProps, NfcSheet } = useAppBridge();
	const { uri } = useAppWebViewUri();
	const { modeRef } = useLinkOpenMode();
	const popupRef = useRef<BottomSheetModal>(null);
	const [popupUrl, setPopupUrl] = useState("");
	// 메인 문서가 4xx/5xx로 오면 서버 에러 페이지를 노출하지 않고 앱 화면으로 대체한다.
	// 실패 여부 대신 실패한 URL을 기억한다. 알림으로 다른 미니앱을 열면 같은 화면이 params만 바뀐 채
	// 재사용되는데, 그때 URL이 달라지면 자동으로 실패 상태가 풀려 새 WebView가 마운트된다.
	const [failedUri, setFailedUri] = useState<string | null>(null);
	const httpFailed = failedUri === uri;

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
						setFailedUri(uri);
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
