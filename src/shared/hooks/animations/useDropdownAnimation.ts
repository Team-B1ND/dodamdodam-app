import { useState, useCallback, useRef } from "react";
import { useWindowDimensions, type View } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 1, overshootClamping: true };

export const useDropdownAnimation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState<"down" | "up">("down");
  const triggerRef = useRef<View>(null);
  const { height: screenH } = useWindowDimensions();

  const iconRotation = useSharedValue(0);
  const optionScale = useSharedValue(0.96);
  const optionOpacity = useSharedValue(0);
  const optionTranslateY = useSharedValue(0);

  const openDropdown = useCallback(() => {
    const initialY = openDirection === "up" ? 8 : -8;
    optionTranslateY.value = initialY;
    optionTranslateY.value = withSpring(0, SPRING_CONFIG);
    optionScale.value = withSpring(1, SPRING_CONFIG);
    optionOpacity.value = withTiming(1, { duration: 150 });
  }, [optionScale, optionOpacity, optionTranslateY, openDirection]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    iconRotation.value = withTiming(0, { duration: 200 });
    optionTranslateY.value = withTiming(openDirection === "up" ? 8 : -8, { duration: 150 });
    optionScale.value = withTiming(0.96, { duration: 150 });
    optionOpacity.value = withTiming(0, { duration: 150 });
  }, [iconRotation, optionScale, optionOpacity, optionTranslateY, openDirection]);

  const handleToggle = useCallback(() => {
    const nextOpen = !isOpen;
    if (nextOpen && triggerRef.current) {
      triggerRef.current.measureInWindow((_x, y, _w, h) => {
        const spaceBelow = screenH - (y + h);
        setOpenDirection(spaceBelow < 220 ? "up" : "down");
      });
    }
    setIsOpen(nextOpen);
    iconRotation.value = withTiming(nextOpen ? 180 : 0, { duration: 200 });
    if (nextOpen) {
      openDropdown();
    } else {
      closeDropdown();
    }
  }, [isOpen, screenH, iconRotation, openDropdown, closeDropdown]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  const optionAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: optionTranslateY.value },
      { scale: optionScale.value },
    ],
    opacity: optionOpacity.value,
  }));

  return {
    isOpen,
    openDirection,
    triggerRef,
    handleToggle,
    closeDropdown,
    iconAnimatedStyle,
    optionAnimatedStyle,
  };
};
