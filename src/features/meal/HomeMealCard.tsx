import React, { memo, useMemo } from "react";
import { HomeMealWidget, type MealData } from "@features/home/home-meal";
import { useMealSuspense } from "./useMeal";
import type { MealType } from "@entities/meal/types";

const MEAL_LABEL: Record<MealType, string> = {
  BREAKFAST: "조식",
  LUNCH: "중식",
  DINNER: "석식",
};

const MEAL_ORDER: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];

const formatToday = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

interface HomeMealCardProps {
  onPress?: () => void;
}

export const HomeMealCard = memo(({ onPress }: HomeMealCardProps) => {
  const today = useMemo(formatToday, []);
  const meals = useMealSuspense(today);

  // 급식이 없는 끼니도 빈 슬라이드로 남겨둔다. 걸러내면 카드 자체가 사라지거나
  // 페이지 수가 줄어 헤더 제목과 실제 끼니가 어긋난다.
  const mealData: MealData[] = useMemo(
    () =>
      MEAL_ORDER.map((type) => ({
        id: type,
        label: MEAL_LABEL[type],
        menus: meals.find((m) => m.mealType === type)?.menus ?? [],
      })),
    [meals],
  );

  return <HomeMealWidget meals={mealData} onPress={onPress} />;
});

HomeMealCard.displayName = "HomeMealCard";