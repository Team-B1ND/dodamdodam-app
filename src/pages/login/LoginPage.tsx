import React, { useRef, useCallback } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { typo } from "@shared/tokens";
import { FilledButton, type BottomSheetRef } from "@shared/ui";
import { AppLogo } from "@shared/ui/topNavBar/AppLogo";
import { useTheme } from "@shared/theme";
import { AgreementBottomSheet } from "@widgets/agreement-bottom-sheet";

const APP_LOGO_WIDTH = 200;
const APP_LOGO_HEIGHT = 50;

export const LoginPage = () => {
	const { colors } = useTheme();
	const navigation = useNavigation<any>();
	const sheetRef = useRef<BottomSheetRef>(null);

	const handleSignUp = useCallback(() => {
		sheetRef.current?.open();
	}, []);

	const handleAgree = useCallback(() => {
		sheetRef.current?.close();
		navigation.navigate("SelectRole");
	}, [navigation]);

	return (
		<ImageBackground
			source={require("../../../LoginBackground.png")}
			style={[styles.background, { backgroundColor: colors.static.black }]}
			resizeMode="cover"
		>
			<SafeAreaView style={styles.container}>
				<View style={styles.top}>
					<AppLogo
						width={APP_LOGO_WIDTH}
						height={APP_LOGO_HEIGHT}
						color={colors.static.white}
					/>
					<Text style={[styles.description, { color: colors.static.white }]}>
						어린아이가 탈 없이 잘 놀며 자라는 모양.
					</Text>
				</View>
				<View style={styles.bottom}>
					<FilledButton size="large" display="fill" onPress={() => navigation.navigate("LoginForm")}>
						로그인
					</FilledButton>
					<View style={styles.loginRow}>
						<Text style={[styles.loginText, { color: colors.static.white }]}>
							계정이 없으시다면?
						</Text>
						<Pressable onPress={handleSignUp}>
							<Text style={[styles.loginLink, { color: colors.static.white }]}>
								회원가입
							</Text>
						</Pressable>
					</View>
				</View>
			</SafeAreaView>
			<AgreementBottomSheet ref={sheetRef} onAgree={handleAgree} />
		</ImageBackground>
	);
};

const styles = StyleSheet.create({
	background: {
		flex: 1,
	},
	container: {
		flex: 1,
		justifyContent: "space-between",
		paddingHorizontal: 16,
	},
	top: {
		flex: 1,
		alignItems: "center",
		paddingTop: 80,
	},
	description: {
		...typo("Body2", "Regular"),
		marginTop: 12,
	},
	bottom: {
		gap: 16,
	},
	loginRow: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 4,
	},
	loginText: {
		...typo("Label", "Regular"),
	},
	loginLink: {
		...typo("Label", "SemiBold"),
		textDecorationLine: "underline",
	},
});
