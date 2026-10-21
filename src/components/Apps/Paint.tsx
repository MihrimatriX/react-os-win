import React, { useRef, useState, useEffect, useCallback } from "react";
import { useFS } from "../../context/FSContext";
import {
  Undo2,
  Redo2,
  Trash2,
  Save,
  Paintbrush,
  Eraser,
  PaintBucket,
  Minus,
  Square,
  Circle,
} from "lucide-react";
import "./paint.css";
import { userPath } from "../../osUser";

const DESKTOP_PATH = userPath("Desktop");

type PaintTool = "brush" | "eraser" | "fill" | "line" | "rectangle" | "circle";

const PRESET_COLORS = [
  "#000000",
  "#ffffff",
  "#7f7f7f",
  "#c3c3c3",
  "#880015",
  "#b5e61d",
  "#ed1c24",
  "#ff7f27",
  "#fff200",
  "#22b14c",
  "#00a2e8",
  "#3f48cc",
  "#a349a4",
  "#ffaec9",
  "#ffc90e",
  "#efe4b0",
  "#b97a57",
  "#ffa07a",
  "#20b2aa",
  "#9370db",
  "#8b0000",
  "#556b2f",
  "#4682b4",
  "#4b0082",
];

export const PaintApp: React.FC = () => {
  const { createUniqueFile } = useFS();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const [tool, setTool] = useState<PaintTool>("brush");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [canvasSnapshot, setCanvasSnapshot] = useState<ImageData | null>(null);

  // Undo/Redo Stacks
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Save Dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState("cizim.png");

  const saveCanvasState = useCallback((canvas: HTMLCanvasElement) => {
    const dataURL = canvas.toDataURL();
    setUndoStack((prev) => [...prev, dataURL]);
    setRedoStack([]); // Clear redo stack on new action
  }, []);

  // Setup Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set high-res canvas scaling
    canvas.width = 800;
    canvas.height = 500;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;
    contextRef.current = ctx;

    // Fill white background on initial draw
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state to undo stack
    saveCanvasState(canvas);
  }, [saveCanvasState]);

  // Update context when color or size changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      contextRef.current.fillStyle = color;
      contextRef.current.lineWidth = size;
    }
  }, [color, size, tool]);

  const handleUndo = () => {
    if (undoStack.length <= 1) return; // Keep initial white canvas
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const currentData = undoStack[undoStack.length - 1];
    const prevData = undoStack[undoStack.length - 2];

    // Pop current state and push to redo stack
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, currentData]);

    const img = new Image();
    img.src = prevData;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const nextData = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, nextData]);

    const img = new Image();
    img.src = nextData;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvasState(canvas);
  };

  // Coordinates helper relative to canvas
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // Scale client coordinate to canvas actual width/height
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Left mouse only
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);
    setStartPos({ x, y });
    lastPosRef.current = { x, y };
    setIsDrawing(true);

    ctx.beginPath();
    ctx.moveTo(x, y);

    // Save snapshot of canvas before drawing shape preview
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasSnapshot(snapshot);

    if (tool === "brush" || tool === "eraser") {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === "fill") {
      floodFill(canvas, Math.floor(x), Math.floor(y), color);
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);

    // For line and shapes, restore the snapshot before drawing updated preview
    if (["line", "rectangle", "circle"].includes(tool) && canvasSnapshot) {
      ctx.putImageData(canvasSnapshot, 0, 0);
    }

    ctx.beginPath();

    if (tool === "brush" || tool === "eraser") {
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastPosRef.current = { x, y };
    } else if (tool === "line") {
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === "rectangle") {
      const width = x - startPos.x;
      const height = y - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, width, height);
    } else if (tool === "circle") {
      const radius = Math.sqrt(
        Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2),
      );
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setCanvasSnapshot(null);
    if (canvasRef.current) {
      saveCanvasState(canvasRef.current);
    }
  };

  // Save drawing image to virtual file system
  const handleSaveToVFS = (e: React.FormEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    let finalName = saveName.trim();
    if (!finalName) return;
    if (!/\.(png|jpg|jpeg|gif)$/i.test(finalName)) {
      finalName += ".png";
    }

    const dataURL = canvas.toDataURL("image/png");
    // Save to Desktop
    finalName = createUniqueFile(DESKTOP_PATH, finalName, dataURL);
    setShowSaveDialog(false);

    alert(
      `"${finalName}" masaüstüne kaydedildi! Çift tıklayarak açabilirsiniz.`,
    );
  };

  // Simple Flood Fill Algorithm
  const floodFill = (
    canvas: HTMLCanvasElement,
    startX: number,
    startY: number,
    fillColor: string,
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Convert hex fillColor to RGBA
    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);
    const fillA = 255;

    const getPixelIndex = (x: number, y: number) => (y * canvas.width + x) * 4;

    const startIdx = getPixelIndex(startX, startY);
    const startR = data[startIdx];
    const startG = data[startIdx + 1];
    const startB = data[startIdx + 2];
    const startA = data[startIdx + 3];

    // If starting pixel is same as target color, cancel to avoid infinite loop
    if (
      startR === fillR &&
      startG === fillG &&
      startB === fillB &&
      startA === fillA
    ) {
      return;
    }

    const queue: [number, number][] = [[startX, startY]];

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      const idx = getPixelIndex(cx, cy);

      if (
        data[idx] === startR &&
        data[idx + 1] === startG &&
        data[idx + 2] === startB &&
        data[idx + 3] === startA
      ) {
        // Fill pixel
        data[idx] = fillR;
        data[idx + 1] = fillG;
        data[idx + 2] = fillB;
        data[idx + 3] = fillA;

        // Queue neighbors
        if (cx > 0) queue.push([cx - 1, cy]);
        if (cx < canvas.width - 1) queue.push([cx + 1, cy]);
        if (cy > 0) queue.push([cx, cy - 1]);
        if (cy < canvas.height - 1) queue.push([cx, cy + 1]);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };

  return (
    <div className="paint-container">
      {/* MS Paint Toolbar Header */}
      <div className="paint-toolbar">
        {/* Undo/Redo & Save/Delete Actions */}
        <div className="paint-tool-group">
          <button
            className="paint-btn"
            onClick={handleUndo}
            disabled={undoStack.length <= 1}
            title="Geri Al"
          >
            <Undo2 size={16} />
          </button>
          <button
            className="paint-btn"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="İleri Al"
          >
            <Redo2 size={16} />
          </button>
          <button
            className="paint-btn"
            onClick={handleClear}
            title="Tümünü Temizle"
          >
            <Trash2 size={16} />
          </button>
          <button
            className="paint-btn"
            onClick={() => setShowSaveDialog(true)}
            title="Masaüstüne Kaydet"
          >
            <Save size={16} style={{ color: "var(--accent-color)" }} />
          </button>
        </div>

        {/* Drawing Tools selector */}
        <div className="paint-tool-group">
          <button
            className={`paint-btn ${tool === "brush" ? "active" : ""}`}
            onClick={() => setTool("brush")}
            title="Fırça"
          >
            <Paintbrush size={16} />
          </button>
          <button
            className={`paint-btn ${tool === "eraser" ? "active" : ""}`}
            onClick={() => setTool("eraser")}
            title="Silgi"
          >
            <Eraser size={16} />
          </button>
          <button
            className={`paint-btn ${tool === "fill" ? "active" : ""}`}
            onClick={() => setTool("fill")}
            title="Doldur"
          >
            <PaintBucket size={16} />
          </button>
        </div>

        {/* Shapes selector */}
        <div className="paint-tool-group">
          <button
            className={`paint-btn ${tool === "line" ? "active" : ""}`}
            onClick={() => setTool("line")}
            title="Çizgi"
          >
            <Minus size={16} />
          </button>
          <button
            className={`paint-btn ${tool === "rectangle" ? "active" : ""}`}
            onClick={() => setTool("rectangle")}
            title="Dikdörtgen"
          >
            <Square size={16} />
          </button>
          <button
            className={`paint-btn ${tool === "circle" ? "active" : ""}`}
            onClick={() => setTool("circle")}
            title="Daire"
          >
            <Circle size={16} />
          </button>
        </div>

        {/* Stroke thickness selector */}
        <div className="paint-tool-group">
          <label style={{ fontSize: "11px", marginRight: "4px", opacity: 0.8 }}>
            Kalınlık:
          </label>
          <select
            className="paint-size-select"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
          >
            <option value={2}>İnce (2px)</option>
            <option value={5}>Normal (5px)</option>
            <option value={10}>Kalın (10px)</option>
            <option value={20}>Çok Kalın (20px)</option>
          </select>
        </div>

        {/* Color Palette Display */}
        <div className="paint-tool-group">
          <div
            className="paint-color-preview-box"
            style={{ backgroundColor: color }}
            title="Aktif Renk"
          />
          <div className="paint-color-palette">
            {PRESET_COLORS.map((c) => (
              <div
                key={c}
                className={`paint-color-dot ${color === c ? "active" : ""}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="paint-workspace">
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="paint-canvas"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
          />
        </div>
      </div>

      {/* Save Modal dialog overlay */}
      {showSaveDialog && (
        <div className="paint-save-modal">
          <form
            className="paint-modal-content glass"
            onSubmit={handleSaveToVFS}
          >
            <h4 className="paint-modal-title">Çizimi Kaydet</h4>
            <input
              type="text"
              className="paint-modal-input"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="resim.png"
              autoFocus
              required
            />
            <div className="paint-modal-actions">
              <button
                type="button"
                className="paint-modal-btn"
                onClick={() => setShowSaveDialog(false)}
              >
                İptal
              </button>
              <button type="submit" className="paint-modal-btn primary">
                Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PaintApp;
