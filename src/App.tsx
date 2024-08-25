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
  const [, setImageSource] = useAtom(ImageSourceAtom);
  const [canvas] = useAtom(CanvasAtom);
  const [showInfo, setShowInfo] = useState(false);
  const [camera, setCamera] = useAtom(CameraAtom);

  useEffect(() => {
    function handleArrowKeys(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        setThreshold((threshold) => Math.max(0, threshold - 1));
      } else if (e.key === "ArrowRight") {
        setThreshold((threshold) => Math.min(maxThreshold, threshold + 1));
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
      <div className="w-full h-full relative">
        <Canvas />
      </div>

      <div className="w-full h-10 border-t select-none border-t-neutral-700 flex relative items-center text-neutral-400">
        <div className="px-3">LEVEL</div>
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
                Upload, drop or paste your image. Adjust the level. Download the
                progressively pixelated result.
              </div>
              <div className="px-3">
                Pixelation is calculated by finding the average color of a cell,
                checking how much color information would be lost if that cell's
                pixels were changed, and changing them if the loss is below the
                threshold. Layers of progressively larger cells are applied one
                on top of the other.
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
  const [, setSourceCanvas] = useAtom(SourceCanvasAtom);
  const [, setCanvasBump] = useAtom(CanvasRenderBumpAtom);
  const [, setWidth] = useAtom(ImageWidthAtom);
  const [, setHeight] = useAtom(ImageHeightAtom);

  useEffect(() => {
    async function main() {
      canvasRef.current = canvasRef.current || document.createElement("canvas");
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas!.getContext("2d")!;
      if (!imageSource) return;
      const slothImage = await loadImage(imageSource);
      canvas.width = slothImage.width;
      canvas.height = slothImage.height;
      setWidth(slothImage.width);
      setHeight(slothImage.height);
      ctx.drawImage(slothImage, 0, 0, slothImage.width, slothImage.height);
      setSourceCanvas(canvas);
      setCanvasBump((bump) => bump + 1);
    }
    main();
  }, [imageSource]);

  return null;
}

function Camera() {
  const [, setCamera] = useAtom(CameraAtom);
  const [device, setDevice] = useState<MediaDeviceInfo | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [, setImageSource] = useAtom(ImageSourceAtom);
  const captureRef = useRef<HTMLCanvasElement | null>(null);

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
      videoRef.current!.srcObject = stream;
    }
    main();
  }, [device]);

  return (
    <div
      className="absolute inset-0 bg-neutral-800 bg-opacity-80 flex px-4 overflow-auto"
      onClick={() => setCamera(false)}
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
            onClick={() => {
              const video = videoRef.current!;
              const ctx = captureRef.current!.getContext("2d")!;
              captureRef.current!.width = video.videoWidth;
              captureRef.current!.height = video.videoHeight;
              ctx.translate(video.videoWidth, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(video, 0, 0);
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
