import { useAtom } from "jotai";
import { ImageSourceAtom } from "./atoms";
import { useEffect } from "react";

export const useHandlePasteImage = () => {
  const [, setImageSource] = useAtom(ImageSourceAtom);

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result;
          if (typeof dataUrl !== "string") return;
          setImageSource(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  });
};
