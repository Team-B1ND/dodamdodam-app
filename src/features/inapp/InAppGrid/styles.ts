import { StyleSheet } from "react-native";

export const ICON_SIZE = 56;
export const ICON_RADIUS = 14;

export const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
  },
  cell: {
    width: "25%",
    alignItems: "center",
    paddingVertical: 10,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
  },
  name: {
    marginTop: 8,
    textAlign: "center",
  },
});
