import { useAtom } from "jotai";
import { ImageSourceAtom } from "./atoms";
import { useEffect } from "react";

export const useHandleDragAndDrop = () => {
  const [, setImageSource] = useAtom(ImageSourceAtom);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (typeof dataUrl !== "string") return;
      setImageSource(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  });
};
