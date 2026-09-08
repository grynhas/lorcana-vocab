import { useEffect } from "react";

export function useImagePreload(url?: string) {
  useEffect(() => {
    if (!url) return;
    const img = new Image();
    img.src = url;
  }, [url]);
}
