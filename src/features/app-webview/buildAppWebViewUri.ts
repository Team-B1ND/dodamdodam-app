interface AppWebViewContext {
  top: number;
  bottom: number;
  token: string | null;
}

const CONTEXT_KEYS = new Set(["top", "bottom", "token"]);

const isContextParameter = (pair: string): boolean => {
  const separator = pair.indexOf("=");
  const key = separator < 0 ? pair : pair.slice(0, separator);

  try {
    return CONTEXT_KEYS.has(decodeURIComponent(key.replace(/\+/g, " ")));
  } catch {
    // 잘못 인코딩된 기존 매개변수는 원문을 유지한다.
    return false;
  }
};

export const buildAppWebViewUri = (
  appUrl: string,
  { top, bottom, token }: AppWebViewContext,
): string => {
  // RN의 URL 구현은 기존 query/hash 뒤에 searchParams를 붙일 수 있어 직접 나눈다.
  const fragmentIndex = appUrl.indexOf("#");
  const fragment = fragmentIndex < 0 ? "" : appUrl.slice(fragmentIndex);
  const beforeFragment = fragmentIndex < 0 ? appUrl : appUrl.slice(0, fragmentIndex);
  const queryIndex = beforeFragment.indexOf("?");
  const base = queryIndex < 0 ? beforeFragment : beforeFragment.slice(0, queryIndex);
  const query = queryIndex < 0 ? "" : beforeFragment.slice(queryIndex + 1);
  const pairs = query ? query.split("&").filter(pair => !isContextParameter(pair)) : [];

  pairs.push(
    `top=${encodeURIComponent(String(top))}`,
    `bottom=${encodeURIComponent(String(bottom))}`,
    `token=${encodeURIComponent(token ?? "")}`,
  );

  return `${base}?${pairs.join("&")}${fragment}`;
};
