import type { InApp } from "@entities/inapp/types";
import { inappApi } from "./index";

const PAGE_SIZE = 10;

const isIpv6Address = (value: string): boolean => {
  let address = value;

  // IPv4-mapped IPv6 주소의 마지막 네 옥텟은 IPv6 두 그룹에 해당한다.
  if (address.includes(".")) {
    const lastColon = address.lastIndexOf(":");
    const octets = address.slice(lastColon + 1).split(".");
    if (
      lastColon < 0 ||
      octets.length !== 4 ||
      octets.some(octet => !/^\d{1,3}$/.test(octet) || Number(octet) > 255)
    ) return false;
    address = `${address.slice(0, lastColon + 1)}0:0`;
  }

  const halves = address.split("::");
  if (halves.length > 2) return false;
  const groups = halves.flatMap(half => half ? half.split(":") : []);
  if (!groups.every(group => /^[\da-f]{1,4}$/i.test(group))) return false;
  return halves.length === 2 ? groups.length < 8 : groups.length === 8;
};

const isSupportedWebAddress = (value: string): boolean => {
  // 브라우저마다 다르게 정규화할 수 있는 공백·제어 문자와 역슬래시는 허용하지 않는다.
  if (/[\s\u0000-\u001f\u007f-\u009f\\]/.test(value)) return false;

  const match = /^https?:\/\/([^/?#]+)(?:[/?#]|$)/i.exec(value);
  const authority = match?.[1];
  if (!authority || authority.includes("@")) return false;

  let host: string;
  let port: string | undefined;
  if (authority.startsWith("[")) {
    const ipv6 = /^\[([^\]]+)\](?::(\d+))?$/.exec(authority);
    if (!ipv6 || !isIpv6Address(ipv6[1])) return false;
    host = ipv6[1];
    port = ipv6[2];
  } else {
    const hostname = /^([^:]+)(?::(\d+))?$/.exec(authority);
    if (!hostname) return false;
    host = hostname[1];
    port = hostname[2];
    if (/[<>"`{}|^%\[\]]/.test(host)) return false;
  }

  return Boolean(host) && (port === undefined || Number(port) <= 65535);
};

// WebView가 토큰을 전달하므로 서버의 활성 앱 목록에 등록된 웹 주소만 사용한다.
const isLaunchableApp = (app: InApp): boolean => {
  return Boolean(
    app &&
    typeof app.appId === "string" && app.appId.trim() &&
    typeof app.name === "string" && app.name.trim() &&
    typeof app.appUrl === "string" && isSupportedWebAddress(app.appUrl),
  );
};

async function* getActiveAppPages(): AsyncGenerator<InApp[]> {
  const seenIds = new Set<string>();

  for (let page = 0; ; page += 1) {
    const { data } = await inappApi.getActiveApps(page, PAGE_SIZE);
    const { content, hasNext } = data.data;

    if (!Array.isArray(content)) {
      throw new Error("활성 앱 목록 형식이 올바르지 않아요.");
    }

    if (content.length === 0) {
      if (hasNext) {
        throw new Error("활성 앱 목록의 다음 페이지를 확인할 수 없어요.");
      }
      return;
    }

    // 잘못된 페이지 응답이 반복되어 끝없이 요청하는 것을 막는다.
    if (hasNext && content.every(app => seenIds.has(app.appId))) {
      throw new Error("활성 앱 목록의 페이지가 반복되고 있어요.");
    }
    content.forEach(app => seenIds.add(app.appId));

    yield content;
    if (!hasNext) return;
  }
}

export async function getAllActiveInApps(): Promise<InApp[]> {
  const apps = new Map<string, InApp>();

  for await (const page of getActiveAppPages()) {
    for (const app of page) {
      if (isLaunchableApp(app)) apps.set(app.appId, app);
    }
  }

  return [...apps.values()];
}

export async function getActiveInApp(appId: string): Promise<InApp | null> {
  if (!appId) return null;

  for await (const page of getActiveAppPages()) {
    const app = page.find(candidate => candidate.appId === appId);
    if (app) return isLaunchableApp(app) ? app : null;
  }

  return null;
}
