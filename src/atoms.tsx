import { atom } from "jotai";
import veil from "./assets/veil-small.png";
import { atomWithStorage } from "jotai/utils";

export const ImageSourceAtom = atom<string | null>(veil);
export const ResizeCanvasAtom = atom<HTMLCanvasElement>(
  document.createElement("canvas"),
);
export const SourceCanvasAtom = atom<HTMLCanvasElement>(
  document.createElement("canvas"),
);
export const ThresholdAtom = atomWithStorage<number>("threshold", 11);
export const ResizeAtom = atom<number>(1);
export const CanvasRenderBumpAtom = atom<number>(0);
export const ImageWidthAtom = atom<number | null>(null);
export const ImageHeightAtom = atom<number | null>(null);
export const CanvasAtom = atom<HTMLCanvasElement | null>(null);
export const CameraAtom = atom<boolean>(false);
