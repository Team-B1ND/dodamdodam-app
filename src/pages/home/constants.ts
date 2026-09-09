export const STACK_ROUTES: Record<string, string> = {
  "/meal": "Meal",
};

export const TAB_ROUTES: Record<string, string> = {
  "/outing": "OutSleeping",
  "/nightstudy": "NightStudy",
  "/home": "Home",
  "/more": "More",
};

export const formatToday = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};