import { useAtom } from "jotai";
import { useRef, useEffect } from "react";
import {
  CanvasAtom,
  CanvasRenderBumpAtom,
  ResizeCanvasAtom,
  ThresholdAtom,
} from "./atoms";
import { processLayer } from "./Processing";

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [threshold] = useAtom(ThresholdAtom);
  const [canvasRenderBump] = useAtom(CanvasRenderBumpAtom);
  const [, setCanvas] = useAtom(CanvasAtom);
  const [resizeCanvas] = useAtom(ResizeCanvasAtom);

  useEffect(() => {
    if (!resizeCanvas) return;
    const canvas = canvasRef.current!;
    const width = resizeCanvas.width;
    const height = resizeCanvas.height;
    canvas.width = width;
    canvas.height = height;
    const dtx = canvas.getContext("2d")!;
    dtx.drawImage(resizeCanvas, 0, 0);
    processLayer(canvas, threshold);
  }, [resizeCanvas, threshold, canvasRenderBump]);

  useEffect(() => {
    setCanvas(canvasRef.current);
  }, [canvasRef.current]);

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 w-full h-full object-contain"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
