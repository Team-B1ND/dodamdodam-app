import { StyleSheet } from "react-native";
import { typo } from "@shared/tokens";
import {
  CARD_RADIUS,
  CARD_PADDING,
  HORIZONTAL_PADDING,
  ICON_CONTAINER_SIZE,
  MENU_GAP,
  CONTENT_PADDING_BOTTOM,
} from "./utils/constants";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
  },
  card: {
    borderRadius: CARD_RADIUS,
    borderCurve: "continuous" as const,
    overflow: "hidden" as const,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: CARD_PADDING,
    paddingTop: CARD_PADDING,
    paddingBottom: 12,
    gap: 8,
  },
  iconContainer: {
    width: ICON_CONTAINER_SIZE,
    height: ICON_CONTAINER_SIZE,
    borderRadius: ICON_CONTAINER_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    ...typo("Body1", "SemiBold"),
  },
  listWrapper: {
    overflow: "hidden",
  },
  mealPage: {
    paddingBottom: CONTENT_PADDING_BOTTOM,
  },
  emptyMealPage: {
    paddingBottom: 0,
    justifyContent: "center",
  },
  menuColumns: {
    flexDirection: "row",
    gap: 12,
  },
  menuColumn: {
    flex: 1,
    gap: MENU_GAP,
  },
  menuItem: {
    ...typo("Body2", "Medium"),
  },
  emptyText: {
    ...typo("Label", "Regular"),
    textAlign: "center",
  },
  indicator: {
    alignSelf: "flex-end",
    paddingBottom: 12,
    paddingHorizontal: CARD_PADDING,
  },
});
