import React, { useState, useRef, useEffect } from "react";
import { useFS } from "../../context/FSContext";
import { useSystem } from "../../context/SystemContext";
import "./terminal.css";
import { userPath } from "../../osUser";

interface ConsoleLine {
  text: string;
  type: "input" | "output" | "error";
}

export const TerminalApp: React.FC = () => {
  const { createDirectory, deleteNode, getNodeByPath } = useFS();
  const { theme, toggleTheme } = useSystem();

  // Current working path starting in John Doe home directory
  const [currentPath, setCurrentPath] = useState<string[]>(userPath());
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<ConsoleLine[]>([
    { text: "Microsoft Windows [Sürüm 10.0.22000]", type: "output" },
    {
      text: "(c) Microsoft Corporation. Tüm hakları saklıdır.",
      type: "output",
    },
    { text: 'Yardım için "help" yazın.', type: "output" },
  ]);

  const outputEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of console
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const getPathString = () => {
    return currentPath.join("\\");
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = inputVal.trim();
    if (!command) return;

    // Add prompt line to history
    const newHistory = [
      ...history,
      { text: `${getPathString()}>${command}`, type: "input" as const },
    ];

    // Parse arguments
    const parts = command.split(" ");
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const outputLines: ConsoleLine[] = [];

    // Current node representing cwd
    const cwdNode = getNodeByPath(currentPath);

    switch (cmdName) {
      case "clear":
      case "cls":
        setHistory([]);
        setInputVal("");
        return;

      case "help":
        outputLines.push({ text: "Kullanılabilir Komutlar:", type: "output" });
        outputLines.push({
          text: "  help            - Komut yardımlarını listeler.",
          type: "output",
        });
        outputLines.push({
          text: "  ls / dir        - Aktif klasördeki dosyaları gösterir.",
          type: "output",
        });
        outputLines.push({
          text: "  cd <klasör>     - Klasör değiştirir (örn. cd Desktop, cd ..)",
          type: "output",
        });
        outputLines.push({
          text: "  mkdir <ad>      - Yeni bir klasör oluşturur.",
          type: "output",
        });
        outputLines.push({
          text: "  echo <metin>    - Ekrana metin yazar.",
          type: "output",
        });
        outputLines.push({
          text: "  cat <dosya>     - Metin dosyasının içeriğini okur.",
          type: "output",
        });
        outputLines.push({
          text: "  rm <ad>         - Dosya veya klasör siler.",
          type: "output",
        });
        outputLines.push({
          text: "  theme           - Aydınlık/Karanlık tema değiştirir.",
          type: "output",
        });
        outputLines.push({
          text: "  neofetch        - Sistem detaylarını MSI logosu ile gösterir.",
          type: "output",
        });
        break;

      case "echo":
        outputLines.push({ text: args.join(" "), type: "output" });
        break;

      case "theme":
        toggleTheme();
        outputLines.push({
          text: `Tema değiştirildi. Aktif tema: ${theme === "dark" ? "Aydınlık" : "Karanlık"}`,
          type: "output",
        });
        break;

      case "ls":
      case "dir":
        if (cwdNode && cwdNode.children) {
          const names = Object.keys(cwdNode.children);
          if (names.length === 0) {
            outputLines.push({ text: "Klasör boş.", type: "output" });
          } else {
            outputLines.push({
              text: `Dizin listesi: ${getPathString()}`,
              type: "output",
            });
            names.forEach((name) => {
              const node = cwdNode.children![name];
              const dateStr = new Date(node.updatedAt).toLocaleDateString(
                "tr-TR",
              );
              const indicator =
                node.type === "dir"
                  ? "<DIR>"
                  : node.type === "app" || node.type === "shortcut"
                    ? "<KISAYOL>"
                    : "       ";
              outputLines.push({
                text: `${dateStr}  ${indicator}   ${name}`,
                type: "output",
              });
            });
          }
        } else {
          outputLines.push({ text: "Klasör okunamıyor.", type: "error" });
        }
        break;

      case "cd": {
        const dest = args.join(" ");
        if (!dest) {
          outputLines.push({ text: getPathString(), type: "output" });
        } else if (dest === "..") {
          if (currentPath.length > 1) {
            setCurrentPath(currentPath.slice(0, -1));
          }
        } else {
          // Check if subdirectory exists
          if (cwdNode && cwdNode.children && cwdNode.children[dest]) {
            const sub = cwdNode.children[dest];
            if (sub.type === "dir") {
              setCurrentPath([...currentPath, dest]);
            } else {
              outputLines.push({
                text: `Hata: "${dest}" bir klasör değil.`,
                type: "error",
              });
            }
          } else {
            outputLines.push({
              text: `Hata: "${dest}" klasörü bulunamadı.`,
              type: "error",
            });
          }
        }
        break;
      }

      case "mkdir": {
        const name = args.join(" ");
        if (!name) {
          outputLines.push({
            text: "Hata: Klasör adı girmelisiniz (mkdir <klasör_adi>).",
            type: "error",
          });
        } else {
          createDirectory(currentPath, name);
          outputLines.push({
            text: `"${name}" klasörü başarıyla oluşturuldu.`,
            type: "output",
          });
        }
        break;
      }

      case "rm": {
        const name = args.join(" ");
        if (!name) {
          outputLines.push({
            text: "Hata: Silinecek öğe adı girmelisiniz (rm <öğe_adi>).",
            type: "error",
          });
        } else {
          if (cwdNode && cwdNode.children && cwdNode.children[name]) {
            deleteNode(currentPath, name);
            outputLines.push({ text: `"${name}" silindi.`, type: "output" });
          } else {
            outputLines.push({
              text: `Hata: "${name}" bulunamadı.`,
              type: "error",
            });
          }
        }
        break;
      }

      case "cat": {
        const filename = args.join(" ");
        if (!filename) {
          outputLines.push({
            text: "Hata: Okunacak dosya adı girmelisiniz (cat <dosya_adi>).",
            type: "error",
          });
        } else {
          if (cwdNode && cwdNode.children && cwdNode.children[filename]) {
            const fileNode = cwdNode.children[filename];
            if (fileNode.type === "file") {
              outputLines.push({
                text: fileNode.content || "(Boş Dosya)",
                type: "output",
              });
            } else {
              outputLines.push({
                text: `Hata: "${filename}" bir dosya değil, klasör.`,
                type: "error",
              });
            }
          } else {
            outputLines.push({
              text: `Hata: "${filename}" dosyası bulunamadı.`,
              type: "error",
            });
          }
        }
        break;
      }

      case "neofetch":
        outputLines.push({
          text: "      MMMMMMMMMMMMMMMMMMMMMMMM       johndoe@desktop-johndoe",
          type: "output",
        });
        outputLines.push({
          text: "      M       MMMMMMM        M       ---------------------",
          type: "output",
        });
        outputLines.push({
          text: "      M       M     M        M       OS: Windows 11 Pro x86_64",
          type: "output",
        });
        outputLines.push({
          text: "      M       M     M        M       CPU: AMD Ryzen 9 5900X 12-Core",
          type: "output",
        });
        outputLines.push({
          text: "      M       MMMMMMM        M       Memory: 32768MB (32GB DDR4)",
          type: "output",
        });
        outputLines.push({
          text: "      MMMMMMMMMMMMMMMMMMMMMMMM       Host: MSI MAG X570 TOMAHAWK WIFI",
          type: "output",
        });
        outputLines.push({
          text: "             M        M              Uptime: 23 dakika",
          type: "output",
        });
        outputLines.push({
          text: "             M        M              Shell: React CMD v1.0",
          type: "output",
        });
        outputLines.push({
          text: "      MMMMMMMMMMMMMMMMMMMMMMMM       Resolution: 1920x1080",
          type: "output",
        });
        outputLines.push({
          text:
            "      M                      M       Theme: " +
            theme.toUpperCase(),
          type: "output",
        });
        break;

      default:
        outputLines.push({
          text: `'${cmdName}' geçerli bir komut olarak tanınmadı. Yardım almak için "help" yazın.`,
          type: "error",
        });
    }

    setHistory([...newHistory, ...outputLines]);
    setInputVal("");
  };

  return (
    <div className="terminal-container">
      {/* Console History Output */}
      <div className="terminal-history">
        {history.map((line, idx) => (
          <div key={idx} className={`terminal-line type-${line.type}`}>
            {line.text}
          </div>
        ))}
        <div ref={outputEndRef} />
      </div>

      {/* Input Prompt */}
      <form onSubmit={handleCommandSubmit} className="terminal-input-row">
        <span className="terminal-prompt">{getPathString()}&gt;</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          autoFocus
          className="terminal-input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </form>
    </div>
  );
};
export default TerminalApp;
