import { useEffect, useRef, useState } from "react";
import { loadImage } from "./utils";
import { useAtom } from "jotai";
import {
  CameraAtom,
  CanvasAtom,
  CanvasRenderBumpAtom,
  ImageHeightAtom,
  ImageSourceAtom,
  ImageWidthAtom,
  ResizeAtom,
  ResizeCanvasAtom,
  SourceCanvasAtom,
  ThresholdAtom,
} from "./atoms";
import { useHandleDragAndDrop } from "./useHandleDragAndDrop";
import { Canvas } from "./Canvas";
import { useHandlePasteImage } from "./useHandlePasteImage";

function App() {
  useHandleDragAndDrop();
  useHandlePasteImage();
  const [threshold, setThreshold] = useAtom(ThresholdAtom);
  const [width] = useAtom(ImageWidthAtom);
  const [height] = useAtom(ImageHeightAtom);
  const draggingRef = useRef(false);
  const maxThreshold = 40;
  const [resize, setResize] = useAtom(ResizeAtom);
  const maxResize = 2;
  const minResize = 0.25;
  const [, setImageSource] = useAtom(ImageSourceAtom);
  const [canvas] = useAtom(CanvasAtom);
  const [showInfo, setShowInfo] = useState(false);
  const [camera, setCamera] = useAtom(CameraAtom);

  useEffect(() => {
    function handleArrowKeys(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        if (e.shiftKey) {
          setResize((resize) =>
            Math.min(maxResize, Math.max(minResize, resize - 0.05)),
          );
        } else {
          setThreshold((threshold) => Math.max(0, threshold - 1));
        }
      } else if (e.key === "ArrowRight") {
        if (e.shiftKey) {
          setResize((resize) =>
            Math.min(maxResize, Math.max(minResize, resize + 0.05)),
          );
        } else {
          setThreshold((threshold) => Math.min(maxThreshold, threshold + 1));
        }
      }
    }
    window.addEventListener("keydown", handleArrowKeys);
    return () => {
      window.removeEventListener("keydown", handleArrowKeys);
    };
  }, []);

  return (
    <div className="w-full relative h-[100dvh] overflow-hidden flex flex-col">
      <SourceCanvas />
      <div className="w-full h-10 border-b border-b-neutral-700 flex justify-between relative items-stretch text-neutral-400 select-none">
        <div className="px-3 flex items-center">
          <div>GRAIN</div>
        </div>
        <button
          className="px-3 flex items-center border-l border-l-neutral-700 hover:bg-neutral-800"
          onClick={() => setShowInfo((showInfo) => !showInfo)}
        >
          INFO
        </button>
      </div>
      <div className="w-full h-full relative my-4">
        <Canvas />
      </div>

      <div className="w-full h-10 border-t select-none border-t-neutral-700 flex relative items-center text-neutral-400">
        <div className="px-3" title="Left and arrow keys">
          LEVEL
        </div>
        <div
          className="w-full h-full relative border-l border-r cursor-crosshair border-l-neutral-700 border-r-neutral-700"
          onPointerDown={(e) => {
            (e.target as any).setPointerCapture(e.pointerId);
            draggingRef.current = true;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            setThreshold(
              Math.min(
                maxThreshold,
                Math.max(0, Math.round((x / width) * maxThreshold)),
              ),
            );
          }}
          onPointerMove={(e) => {
            if (!draggingRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            setThreshold(
              Math.min(
                maxThreshold,
                Math.max(0, Math.round((x / width) * maxThreshold)),
              ),
            );
          }}
          onPointerUp={() => {
            draggingRef.current = false;
          }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 bg-neutral-600 h-full"
            style={{ width: `${(threshold / maxThreshold) * 100}%` }}
          ></div>
        </div>
        <div className="pr-3 w-[5ch] text-right">{threshold}</div>
      </div>

      <div className="w-full h-10 border-t select-none border-t-neutral-700 flex relative items-center text-neutral-400">
        <div className="px-3" title="Shift + left and arrow keys">
          RESIZE
        </div>
        <div
          className="w-full h-full relative border-l border-r cursor-crosshair border-l-neutral-700 border-r-neutral-700"
          onPointerDown={(e) => {
            (e.target as any).setPointerCapture(e.pointerId);
            draggingRef.current = true;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            setResize(
              Math.min(
                maxResize,
                Math.max(
                  minResize,
                  Math.round(
                    ((x / width) * (maxResize - minResize) + minResize) / 0.05,
                  ) * 0.05,
                ),
              ),
            );
          }}
          onPointerMove={(e) => {
            if (!draggingRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            setResize(
              Math.min(
                maxResize,
                Math.max(
                  minResize,
                  Math.round(
                    ((x / width) * (maxResize - minResize) + minResize) / 0.05,
                  ) * 0.05,
                ),
              ),
            );
          }}
          onPointerUp={() => {
            draggingRef.current = false;
          }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 bg-neutral-600 h-full"
            style={{
              width: `${((resize - minResize) / (maxResize - minResize)) * 100}%`,
            }}
          ></div>
        </div>
        <div className="pr-3 w-[7ch] text-right">{resize.toFixed(2)}</div>
      </div>

      <div className="w-full select-none h-10 border-t border-t-neutral-700 flex justify-between relative items-stretch text-neutral-400">
        <label className="px-3 flex items-center border-r border-r-neutral-700 hover:bg-neutral-800">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setImageSource(url);
            }}
          />
          UPLOAD
        </label>
        <button
          className="px-3 flex items-center border-r border-r-neutral-700 hover:bg-neutral-800"
          onClick={() => {
            setCamera(true);
          }}
        >
          CAMERA
        </button>
        <div className="flex justify-center w-full items-center text-center">
          <div className="flex items-center">
            <div>
              {width}X{height}
              {Math.round(resize * 100) !== 100
                ? ` to ${Math.round(width! * resize)}X${Math.round(height! * resize)}`
                : null}
            </div>
          </div>
        </div>
        <button
          className="px-3 flex items-center border-l border-l-neutral-700 hover:bg-neutral-800"
          onClick={() => {
            const a = document.createElement("a");
            a.href = canvas!.toDataURL();
            const timestamp = new Date().toISOString();
            a.download = "grain-" + timestamp + ".png";
            a.click();
          }}
        >
          DOWNLOAD
        </button>
      </div>
      {showInfo ? (
        <div
          className="absolute inset-0 bg-neutral-800 bg-opacity-50 flex"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="m-auto bg-neutral-900 w-full border border-neutral-700 max-w-[480px] text-neutral-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-10 w-full flex justify-between border-b border-b-neutral-700">
              <div className="flex items-center px-3">
                <div>INFO</div>
              </div>
              <button
                className="px-3 flex items-center border-l border-l-neutral-700 hover:bg-neutral-800"
                onClick={() => {
                  setShowInfo(false);
                }}
              >
                &times;
              </button>
            </div>
            <div className="py-3 text-neutral-300 flex flex-col gap-4">
              <div className="px-3">
                Upload, drop or paste your image. Adjust the level and the size
                for different variations. Download the progressively pixelated
                result.
              </div>
              <div className="px-3">
                Pixelation is calculated by finding the average color of a cell,
                checking how much color information would be lost if that cell's
                pixels were changed, and changing them if the loss is below the
                threshold. Layers of progressively larger cells are applied one
                on top of one another.
              </div>
              <div className="px-3">
                Please feel free to use the results. I'd love to hear about it
                at grantcuster at gmail dot com.
              </div>
              <div className="px-3">
                A{" "}
                <a
                  className="underline"
                  href="https://constraint.systems"
                  target="_blank"
                >
                  Constraint Systems
                </a>{" "}
                project.
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {camera ? <Camera /> : null}
    </div>
  );
}

function SourceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageSource] = useAtom(ImageSourceAtom);
  const [, setCanvasBump] = useAtom(CanvasRenderBumpAtom);
  const [, setSourceCanvas] = useAtom(SourceCanvasAtom);
  const [, setWidth] = useAtom(ImageWidthAtom);
  const [, setHeight] = useAtom(ImageHeightAtom);
  const [resizeCanvas] = useAtom(ResizeCanvasAtom);
  const [resize, setResize] = useAtom(ResizeAtom);

  function updateResizeCanvas() {
    const canvas = canvasRef.current!;
    resizeCanvas.width = Math.round(canvas.width * resize);
    resizeCanvas.height = Math.round(canvas.height * resize);
    const rtx = resizeCanvas.getContext("2d")!;
    rtx.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      resizeCanvas.width,
      resizeCanvas.height,
    );
  }

  useEffect(() => {
    async function main() {
      canvasRef.current = canvasRef.current || document.createElement("canvas");
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas!.getContext("2d")!;
      if (!imageSource) return;
      const image = await loadImage(imageSource);
      canvas.width = image.width;
      canvas.height = image.height;
      setWidth(image.width);
      setHeight(image.height);
      setResize(1);
      ctx.drawImage(image, 0, 0, image.width, image.height);
      setSourceCanvas(canvas);
      updateResizeCanvas();
      setCanvasBump((bump) => bump + 1);
    }
    main();
  }, [imageSource]);

  useEffect(() => {
    updateResizeCanvas();
    setCanvasBump((bump) => bump + 1);
  }, [resize]);

  return null;
}

function Camera() {
  const [, setCamera] = useAtom(CameraAtom);
  const [device, setDevice] = useState<MediaDeviceInfo | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [, setImageSource] = useAtom(ImageSourceAtom);
  const captureRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  captureRef.current = captureRef.current || document.createElement("canvas");

  useEffect(() => {
    async function main() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setDevice(videoDevices[0]);
      }
    }
    main();
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    if (!device) return;
    async function main() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: device!.deviceId,
        },
      });
      streamRef.current = stream;
      videoRef.current!.srcObject = stream;
    }
    main();
  }, [device]);

  function cleanup() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }

  return (
    <div
      className="absolute inset-0 bg-neutral-800 bg-opacity-80 flex px-4 overflow-auto"
      onClick={() => {
        cleanup();
        setCamera(false);
      }}
    >
      <div
        className="m-auto bg-neutral-900 w-full max-w-[640px] border border-neutral-700 text-neutral-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-10 w-full flex justify-between border-b border-b-neutral-700">
          <div className="flex items-center px-3">
            <div>CAMERA</div>
          </div>
          <button
            className="px-3 flex items-center border-l border-l-neutral-700 hover:bg-neutral-800"
            onClick={() => {
              cleanup();
              setCamera(false);
            }}
          >
            &times;
          </button>
        </div>
        <div className="w-full flex justify-center">
          <video
            className="w-full"
            style={{ transform: "scaleX(-1)" }}
            ref={videoRef}
            playsInline={true}
            autoPlay={true}
          />
        </div>
        <div className="flex gap-2 items-center pl-2">
          <select
            className="text-neutral-300 bg-neutral-700 w-full py-1 px-1 focus:outline-none"
            value={device?.deviceId}
            onChange={(e) => {
              const deviceId = e.target.value;
              const device = devices.find(
                (device) => device.deviceId === deviceId,
              );
              setDevice(device!);
            }}
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
          <button
            className="border-l border-l-neutral-700 hover:bg-neutral-800 text-neutral-300 px-3 py-2"
            onClick={async () => {
              const video = videoRef.current!;
              const ctx = captureRef.current!.getContext("2d")!;
              captureRef.current!.width = video.videoWidth;
              captureRef.current!.height = video.videoHeight;
              ctx.translate(video.videoWidth, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(video, 0, 0);
              cleanup();
              setImageSource(captureRef.current!.toDataURL());
              setCamera(false);
            }}
          >
            CAPTURE
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
