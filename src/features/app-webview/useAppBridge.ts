import { useNavigation } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { Actions, Errors, core, useBridgeCore, useBridgeUi } from "@b1nd/aid-kit/bridge-kit/app";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useNfcRead } from "./screens/NfcRead";

export const useAppBridge = () => {
	const navigation = useNavigation();
	const { webViewProps } = useBridgeCore();
	const { open } = useBridgeUi();
	const { scan: scanNfc, NfcSheet } = useNfcRead();

	core.mount(Actions.NAVIGATION_POP, async () => {
		navigation.goBack();
		return null;
	});

	core.mountPush(Actions.NAVIGATION_POP, (send) => {
		const handler = BackHandler.addEventListener("hardwareBackPress", () => {
			send({});
			return true;
		});
		return () => handler.remove();
	});

	core.mount(Actions.QR_SCAN, async () => {
		return await open(Actions.QR_SCAN);
	});

	core.mount(Actions.GPS_GET, async () => {
		const { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") return Errors.PREMISSION_DENIED as any;

		const location = await Location.getCurrentPositionAsync({
			accuracy: Location.Accuracy.High,
		});

		return {
			coords: {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				altitude: location.coords.altitude,
				accuracy: location.coords.accuracy,
				altitudeAccuracy: location.coords.altitudeAccuracy,
				heading: location.coords.heading,
				speed: location.coords.speed,
			},
			timestamp: location.timestamp,
		};
	});

	core.mountPush(Actions.GPS_GET, (send) => {
		let subscription: Location.LocationSubscription | null = null;

		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") return;

			subscription = await Location.watchPositionAsync(
				{ accuracy: Location.Accuracy.High, distanceInterval: 5 },
				(location) => {
					send({
						coords: {
							latitude: location.coords.latitude,
							longitude: location.coords.longitude,
							altitude: location.coords.altitude,
							accuracy: location.coords.accuracy,
							altitudeAccuracy: location.coords.altitudeAccuracy,
							heading: location.coords.heading,
							speed: location.coords.speed,
						},
						timestamp: location.timestamp,
					});
				},
			);
		})();

		return () => {
			subscription?.remove();
		};
	});

	core.mount(Actions.NFC_READ, async () => {
		const result = await scanNfc();
		return result ?? Errors.CANCELLED;
  });

	core.mount(Actions.ACK, async () => {
		return null;
  });

	core.mountPush(Actions.ACK, (send) => {
		return () => {};
  });

	core.mount(Actions.SYNC, async () => {
		return null;
  });

	core.mountPush(Actions.SYNC, (send) => {
		return () => {};
	});

	core.mountPush(Actions.NFC_READ, (send) => {
		return () => {};
	});

	core.mount(Actions.CAMERA_CAPTURE, async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== "granted") return Errors.PREMISSION_DENIED as any;

		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ["images"],
			quality: 0.8,
			base64: true,
		});

		if (result.canceled || !result.assets?.[0]) return Errors.CANCELLED as any;

		const asset = result.assets[0];
		return {
			uri: asset.uri,
			base64: asset.base64 ?? null,
			width: asset.width,
			height: asset.height,
			mimeType: asset.mimeType ?? "image/jpeg",
			fileName: asset.fileName ?? "photo.jpg",
		};
	});

	core.mount(Actions.FILE_SELECT, async () => {
		const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });

		if (result.canceled || !result.assets?.[0]) return Errors.CANCELLED as any;

		const asset = result.assets[0];
		return {
			uri: asset.uri,
			name: asset.name,
			size: asset.size ?? 0,
			mimeType: asset.mimeType ?? "application/octet-stream",
		};
	});

	core.mount(Actions.FILE_SAVE, async (data: any) => {
		const { url, fileName } = data ?? {};
		if (!url) return Errors.UNKNOWN as any;

		const fileUri = `${FileSystem.cacheDirectory}${fileName ?? "download"}`;
		const download = await FileSystem.downloadAsync(url, fileUri);

		const canShare = await Sharing.isAvailableAsync();
		if (!canShare) return Errors.NOT_SUPPORT as any;

		await Sharing.shareAsync(download.uri);
		return { uri: download.uri };
	});

	return { webViewProps, NfcSheet };
};
