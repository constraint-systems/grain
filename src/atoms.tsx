import { atom } from "jotai";
import { SlothImage } from "./data";
import { atomWithStorage } from "jotai/utils";

export const ImageSourceAtom = atom<string | null>(SlothImage);
export const SourceCanvasAtom = atom<HTMLCanvasElement>(
  document.createElement("canvas"),
);
export const ThresholdAtom = atomWithStorage<number>("threshold", 10);
export const CanvasRenderBumpAtom = atom<number>(0);
export const ImageWidthAtom = atom<number | null>(null);
export const ImageHeightAtom = atom<number | null>(null);
export const CanvasAtom = atom<HTMLCanvasElement | null>(null);
export const CameraAtom = atom<boolean>(false);
