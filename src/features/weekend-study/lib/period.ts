/** 연속된 교시를 묶어 "17–18시, 19–21시" 형태로 만든다. */
export const formatPeriods = (periods: number[]): string => {
  const sorted = [...new Set(periods)].sort((a, b) => a - b);
  const runs: [number, number][] = [];

  for (const period of sorted) {
    const last = runs[runs.length - 1];
    if (last && last[1] === period) {
      last[1] = period + 1;
    } else {
      runs.push([period, period + 1]);
    }
  }

  return runs.map(([start, end]) => `${start}–${end}시`).join(", ");
};

/** 단일 교시를 "17:00 – 18:00" 형태로 만든다. */
export const formatPeriodSlot = (period: number): string =>
  `${period}:00 – ${period + 1}:00`;
