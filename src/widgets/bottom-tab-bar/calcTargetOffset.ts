import { INDICATOR_SIZE } from "./constants";

export const calcTargetOffset = (
  index: number,
  barLength: number,
  tabCount: number,
) => {
  "worklet";
  const tabSize = barLength / tabCount;
  return index * tabSize + (tabSize - INDICATOR_SIZE) / 2;
};
