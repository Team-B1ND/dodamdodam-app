import { useCallback, useEffect, useRef, useState } from "react";
import { linkOpenStorage, type LinkOpenMode } from "@entities/settings/storage/linkOpenStorage";

export const useLinkOpenMode = () => {
  const [mode, setMode] = useState<LinkOpenMode>("webview");
  const modeRef = useRef<LinkOpenMode>("webview");

  useEffect(() => {
    linkOpenStorage.get().then((saved) => {
      modeRef.current = saved;
      setMode(saved);
    });
  }, []);

  const toggle = useCallback(() => {
    const next: LinkOpenMode = modeRef.current === "browser" ? "webview" : "browser";
    modeRef.current = next;
    setMode(next);
    void linkOpenStorage.set(next);
  }, []);

  return { mode, modeRef, toggle };
};
