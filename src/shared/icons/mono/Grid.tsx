import React from "react";
import Svg, { Rect } from "react-native-svg";
import type { IconWithColorProps } from "../types";

const POSITIONS = [3, 10, 17];

export const Grid = ({ size = 24, color = "#0F0F10" }: IconWithColorProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {POSITIONS.map((y) =>
      POSITIONS.map((x) => (
        <Rect key={`${x}-${y}`} x={x} y={y} width={5} height={5} rx={2.5} fill={color} />
      )),
    )}
  </Svg>
);
