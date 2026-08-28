import React, { useState, useEffect, useCallback } from "react";
import { useSystem } from "../../context/SystemContext";
import { useFS, type VFSNode } from "../../context/FSContext";
import { Image, Trash2, Wallpaper, ChevronLeft } from "lucide-react";
import { userPath } from "../../osUser";
import "./imageviewer.css";

const DEFAULT_DESKTOP_PATH = userPath("Desktop");

interface ImageViewerProps {
  params?: {
    fileName?: string;
    content?: string;
    filePath?: string[];
  };
}

interface ImageFile {
  name: string;
  filePath: string[];
  content: string;
}

export const ImageViewerApp: React.FC<ImageViewerProps> = ({ params }) => {
  const { setWallpaper } = useSystem();
  const { fs, deleteNode, getNodeByPath } = useFS();

  const [activeImage, setActiveImage] = useState<ImageFile | null>(null);
  const [galleryImages, setGalleryImages] = useState<ImageFile[]>([]);
  const [isGalleryView, setIsGalleryView] = useState(true);

  // Scan virtual VFS recursively for images (.png, .jpg, .jpeg, .gif)
  const scanForImages = useCallback(() => {
    const list: ImageFile[] = [];

    const recurse = (node: VFSNode, currentPath: string[]) => {
      if (!node) return;
      if (node.type === "file" && /\.(png|jpg|jpeg|gif)$/i.test(node.name)) {
        list.push({
          name: node.name,
          filePath: currentPath.slice(0, -1), // parent directory path
          content: node.content || "",
        });
      } else if (node.type === "dir" && node.children) {
        for (const key in node.children) {
          recurse(node.children[key], [...currentPath, key]);
        }
      }
    };

    recurse(fs, []);
    setGalleryImages(list);
  }, [fs]);

  // Run scan when VFS changes
  useEffect(() => {
    const timer = setTimeout(() => {
      scanForImages();
    }, 0);
    return () => clearTimeout(timer);
  }, [scanForImages]);

  // Handle initial params
  useEffect(() => {
    const timer = setTimeout(() => {
      const filePath = params?.filePath || DEFAULT_DESKTOP_PATH;
      const storedNode = params?.fileName
        ? getNodeByPath([...filePath, params.fileName])
        : null;
      const resolvedContent = storedNode?.content ?? params?.content;
      if (resolvedContent) {
        setActiveImage({
          name: params?.fileName || "Görüntü",
          content: resolvedContent,
          filePath,
        });
        setIsGalleryView(false);
      } else {
        setIsGalleryView(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [getNodeByPath, params]);

  const handleSetWallpaper = () => {
    if (!activeImage) return;
    setWallpaper(activeImage.content);
    alert("Masaüstü duvar kağıdı başarıyla güncellendi!");
  };

  const handleDelete = () => {
    if (!activeImage) return;
    if (
      confirm(
        `"${activeImage.name}" resmini silmek istediğinizden emin misiniz?`,
      )
    ) {
      deleteNode(activeImage.filePath, activeImage.name);

      // Reset view
      setActiveImage(null);
      setIsGalleryView(true);
    }
  };

  const handleSelectImage = (img: ImageFile) => {
    setActiveImage(img);
    setIsGalleryView(false);
  };

  return (
    <div className="imageviewer-container">
      {/* Dynamic Header toolbar */}
      <div className="imageviewer-toolbar">
        {isGalleryView ? (
          <>
            <span className="imageviewer-title">Fotoğraflar - Galeri</span>
            <div />
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                className="imageviewer-btn"
                onClick={() => setIsGalleryView(true)}
                title="Galeriye Dön"
              >
                <ChevronLeft size={14} /> Galeri
              </button>
              <span className="imageviewer-title">{activeImage?.name}</span>
            </div>

            <div className="imageviewer-actions">
              <button
                className="imageviewer-btn accent"
                onClick={handleSetWallpaper}
                title="Arka Plan Yap"
              >
                <Wallpaper size={14} /> Duvar Kağıdı Yap
              </button>
              <button
                className="imageviewer-btn"
                onClick={handleDelete}
                style={{ color: "#ff4d4d" }}
                title="Resmi Sil"
              >
                <Trash2 size={14} /> Sil
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main content router */}
      {isGalleryView ? (
        <div className="imageviewer-gallery">
          <h4 className="gallery-title">Tüm Fotoğraflar</h4>
          {galleryImages.length > 0 ? (
            <div className="gallery-grid">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className="gallery-card"
                  onClick={() => handleSelectImage(img)}
                >
                  <div
                    className="gallery-card-thumb"
                    style={{ backgroundImage: `url(${img.content})` }}
                  />
                  <div className="gallery-card-name">{img.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gallery-empty">
              <Image size={40} style={{ opacity: 0.3, marginBottom: "10px" }} />
              <span>Sistemde kayıtlı fotoğraf bulunamadı.</span>
              <span
                style={{ fontSize: "11px", marginTop: "5px", opacity: 0.6 }}
              >
                MS Paint veya Kamera uygulamasıyla çizimler kaydedebilirsiniz.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="imageviewer-viewport">
          {activeImage?.content && (
            <img
              src={activeImage.content}
              alt={activeImage.name}
              className="imageviewer-img"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ImageViewerApp;
