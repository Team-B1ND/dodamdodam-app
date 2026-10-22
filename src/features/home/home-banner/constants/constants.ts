export const CORNER_RADIUS = 20;
export const BANNER_HEIGHT = 56;
export const BANNER_REFERENCE_WIDTH = 408;
export const getBannerHeight = (bannerWidth: number) =>
  Math.round(BANNER_HEIGHT * Math.max(1, bannerWidth / BANNER_REFERENCE_WIDTH));
export const HORIZONTAL_PADDING = 16;
export const AUTO_SCROLL_INTERVAL = 4000;
