import React, { useState, useEffect } from "react";
import { useFS } from "../../context/FSContext";
import { useWindow } from "../../context/WindowContext";
import { userPath } from "../../osUser";
import { Save, FilePlus, X } from "lucide-react";
import "./notepad.css";

const DEFAULT_DESKTOP_PATH = userPath("Desktop");

interface NotepadProps {
  winId: string;
  params?: {
    fileName?: string;
    content?: string;
    filePath?: string[];
  };
}

export const NotepadApp: React.FC<NotepadProps> = ({ winId, params }) => {
  const { createFile, updateFileContent, getNodeByPath } = useFS();
  const { updateWindowMeta } = useWindow();

  const initialNode = params?.fileName
    ? getNodeByPath([
        ...(params.filePath ?? DEFAULT_DESKTOP_PATH),
        params.fileName,
      ])
    : null;
  const [content, setContent] = useState(
    initialNode?.content ?? params?.content ?? "",
  );
  const [fileName, setFileName] = useState(params?.fileName || "Adsız.txt");
  const [filePath, setFilePath] = useState<string[]>(
    params?.filePath || DEFAULT_DESKTOP_PATH,
  );

  // Track if file is new or exists
  const [isNewFile, setIsNewFile] = useState(!params?.fileName);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveNameInput, setSaveNameInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // If parameters change (e.g. open another file), update state
  useEffect(() => {
    if (params) {
      const timer = setTimeout(() => {
        const nextPath = params.filePath || DEFAULT_DESKTOP_PATH;
        const node = params.fileName
          ? getNodeByPath([...nextPath, params.fileName])
          : null;
        setContent(node?.content ?? params.content ?? "");
        setFileName(params.fileName || "Adsız.txt");
        setFilePath(nextPath);
        setIsNewFile(!params.fileName);
        setIsDirty(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [getNodeByPath, params]);

  const handleSave = () => {
    if (isNewFile) {
      setSaveNameInput(fileName);
      setShowSaveModal(true);
    } else {
      // Existing file save
      updateFileContent(filePath, fileName, content);
      setIsDirty(false);
      updateWindowMeta(winId, {
        title: `${fileName} - Not Defteri`,
        params: { fileName, filePath },
      });
      setSaveStatus("Dosya kaydedildi!");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveNameInput.trim()) return;

    let finalName = saveNameInput.trim();
    if (!finalName.toLocaleLowerCase("tr-TR").endsWith(".txt")) {
      finalName += ".txt";
    }

    const existing = getNodeByPath([...filePath, finalName]);
    if (
      existing &&
      !window.confirm(
        `"${finalName}" zaten var. Mevcut dosyanın üzerine yazılsın mı?`,
      )
    ) {
      return;
    }

    createFile(filePath, finalName, content);
    setFileName(finalName);
    setIsNewFile(false);
    setIsDirty(false);
    updateWindowMeta(winId, {
      title: `${finalName} - Not Defteri`,
      params: { fileName: finalName, filePath },
    });
    setShowSaveModal(false);
    setSaveStatus("Dosya kaydedildi!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleNew = () => {
    if (
      isDirty &&
      !window.confirm("Kaydedilmemiş değişiklikler silinsin mi?")
    ) {
      return;
    }
    setContent("");
    setFileName("Adsız.txt");
    setIsNewFile(true);
    setIsDirty(false);
    updateWindowMeta(winId, {
      title: "Adsız - Not Defteri",
      params: {
        fileName: undefined,
        content: undefined,
        filePath: DEFAULT_DESKTOP_PATH,
      },
    });
  };

  return (
    <div className="notepad-container">
      {saveStatus && (
        <div className="notepad-save-toast" role="status">
          {saveStatus}
        </div>
      )}
      {/* File Action Bar */}
      <div className="notepad-menu-bar">
        <button className="menu-bar-btn" onClick={handleNew}>
          <FilePlus size={13} style={{ marginRight: "5px" }} />
          Yeni
        </button>
        <button className="menu-bar-btn" onClick={handleSave}>
          <Save size={13} style={{ marginRight: "5px" }} />
          Kaydet
        </button>
        <div className="notepad-file-title-indicator">
          Dosya:{" "}
          <span style={{ fontWeight: "bold" }}>
            {fileName}
            {isDirty ? " *" : ""}
          </span>
        </div>
      </div>

      {/* Editor Space */}
      <textarea
        className="notepad-textarea"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setIsDirty(true);
        }}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key.toLocaleLowerCase("tr-TR") === "s") {
            e.preventDefault();
            handleSave();
          }
          if (e.ctrlKey && e.key.toLocaleLowerCase("tr-TR") === "n") {
            e.preventDefault();
            handleNew();
          }
        }}
        placeholder="Yazmaya başlayın..."
        aria-label={`${fileName} içeriği`}
      />

      {/* Custom Inline Save Dialog Modal */}
      {showSaveModal && (
        <div className="save-modal-overlay">
          <div
            className="save-modal glass"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notepad-save-title"
            onKeyDown={(event) => {
              if (event.key === "Escape") setShowSaveModal(false);
            }}
          >
            <div className="save-modal-header">
              <h3 id="notepad-save-title">Farklı Kaydet</h3>
              <button
                className="save-modal-close"
                onClick={() => setShowSaveModal(false)}
                aria-label="Farklı Kaydet penceresini kapat"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmSave} className="save-modal-form">
              <div className="save-input-row">
                <label>Dosya Adı:</label>
                <input
                  type="text"
                  value={saveNameInput}
                  onChange={(e) => setSaveNameInput(e.target.value)}
                  placeholder="belge.txt"
                  autoFocus
                  required
                />
              </div>
              <div className="save-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowSaveModal(false)}
                >
                  İptal
                </button>
                <button type="submit" className="btn-save">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default NotepadApp;
