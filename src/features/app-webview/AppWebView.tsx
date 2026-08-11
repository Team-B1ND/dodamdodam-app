import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { useAppBridge } from "./useAppBridge";
import { useAppWebViewUri } from "./useAppWebViewUri";

export const AppWebView = () => {
	const { webViewProps, NfcSheet } = useAppBridge();
	const { uri } = useAppWebViewUri();

	if (!uri) return <View style={{ flex: 1 }} />;

	return (
		<View style={{ flex: 1 }}>
			<WebView
				{...webViewProps}
				source={{ uri }}
				// iOS 16.4+는 이 값이 켜져야 Safari 웹 검사기에 WebView가 잡힌다.
				webviewDebuggingEnabled={__DEV__}
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
