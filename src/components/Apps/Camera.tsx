import React, { useRef, useState, useEffect } from "react";
import { useFS } from "../../context/FSContext";
import { useWindow } from "../../context/WindowContext";
import { Image, RefreshCw } from "lucide-react";
import { userPath } from "../../osUser";
import "./camera.css";

const PICTURES_PATH = userPath("Pictures");

// Selection of Unsplash mock portraits if physical webcam fails/blocked
const MOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=640&q=80", // Woman portrait
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&q=80", // Man portrait
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=640&q=80", // Male portrait 2
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&q=80", // Female portrait 2
];

export const CameraApp: React.FC = () => {
  const { createFile } = useFS();
  const { openApp } = useWindow();

  const videoRef = useRef<HTMLVideoElement>(null);

  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [flash, setFlash] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<{
    fileName: string;
    content: string;
  } | null>(null);

  // Mock image index
  const [mockPhotoIndex, setMockPhotoIndex] = useState(0);

  // Setup webcam stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let cancelled = false;

    const initWebcam = async () => {
      try {
        const constraints = { video: { width: 640, height: 480 } };
        const mediaStream =
          await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        activeStream = mediaStream;
        setHasCameraAccess(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn("Webcam access failed, running mock mode", err);
        setHasCameraAccess(false);
      }
    };

    initWebcam();

    return () => {
      cancelled = true;
      // Shutdown stream tracks on exit
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Synthetic shutter audio sound (no static assets required!)
  const playShutterSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // High-pitched shutter tick
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
      osc.onended = () => void ctx.close();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCapture = () => {
    playShutterSound();
    setFlash(true);
    setTimeout(() => setFlash(false), 350);

    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (hasCameraAccess && videoRef.current) {
      // Draw frame from live video feed
      // Mirror horizontal frame to match mirrored viewfinder
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scale

      saveImage(canvas.toDataURL("image/png"));
    } else {
      // Mock Camera Mode: Draw active mock image to canvas
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = MOCK_PHOTOS[mockPhotoIndex];
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Draw decorative mock lens overlay filter
        ctx.fillStyle = "rgba(2, 132, 199, 0.05)"; // slight blue tint
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        saveImage(canvas.toDataURL("image/png"));
      };
    }
  };

  const saveImage = (dataUrl: string) => {
    // Generate timestamp for filename
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}_${String(now.getMilliseconds()).padStart(3, "0")}`;
    const fileName = `Kamera_${timestamp}.png`;

    // Save image to Pictures in VFS
    createFile(PICTURES_PATH, fileName, dataUrl);
    setLastPhoto({ fileName, content: dataUrl });
  };

  const handleThumbnailClick = () => {
    if (!lastPhoto) return;

    // Open Photos viewer app
    openApp("imageviewer", {
      fileName: lastPhoto.fileName,
      content: lastPhoto.content,
      filePath: PICTURES_PATH,
    });
  };

  const cycleMockPhoto = () => {
    setMockPhotoIndex((prev) => (prev + 1) % MOCK_PHOTOS.length);
  };

  return (
    <div className="camera-container">
      {/* Visual Flash effect overlay */}
      <div className={`camera-flash-overlay ${flash ? "flash" : ""}`} />

      {/* Camera Screen */}
      <div className="camera-viewfinder">
        {hasCameraAccess ? (
          <>
            <video
              ref={videoRef}
              className="camera-video"
              autoPlay
              playsInline
              muted
            />
            <div className="camera-reticle" />
          </>
        ) : (
          /* Mock feed fallback */
          <div className="camera-mock-feed">
            <img
              src={MOCK_PHOTOS[mockPhotoIndex]}
              alt="Mock Viewfinder"
              className="camera-mock-avatar"
            />
            <div>
              <span style={{ fontWeight: 600 }}>Web Kamerası Bağlanamadı</span>
              <div className="camera-mock-warning">
                Kamera izni verilmemiş olabilir veya donanım bulunamadı.
                Simülasyon modunda fotoğraf çekebilirsiniz.
              </div>
            </div>

            <button
              className="paint-btn"
              style={{
                marginTop: "15px",
                color: "#0078d4",
                display: "flex",
                gap: "5px",
                width: "auto",
                padding: "5px 12px",
                border: "1px solid #0078d4",
              }}
              onClick={cycleMockPhoto}
              title="Kişiyi Değiştir"
            >
              <RefreshCw size={13} />
              <span>Modeli Değiştir</span>
            </button>
          </div>
        )}
      </div>

      {/* Control panel */}
      <div className="camera-controls-hud">
        {/* Thumbnail area */}
        {lastPhoto ? (
          <div
            className="camera-thumbnail-preview"
            style={{ backgroundImage: `url(${lastPhoto.content})` }}
            onClick={handleThumbnailClick}
            title="Son çekilen fotoğrafı gör"
          />
        ) : (
          <div
            className="camera-thumbnail-preview"
            style={{ opacity: 0.3 }}
            title="Fotoğraf Yok"
          >
            <Image size={24} style={{ margin: "10px" }} />
          </div>
        )}

        {/* Circular Shutter trigger button */}
        <div className="camera-shutter-btn-wrapper">
          <button
            className="camera-shutter-btn"
            onClick={handleCapture}
            title="Fotoğraf Çek"
          />
        </div>

        {/* Capture Mode label indicator */}
        <div className="camera-mode-toggle active">
          <span>FOTOĞRAF</span>
        </div>
      </div>
    </div>
  );
};

export default CameraApp;
