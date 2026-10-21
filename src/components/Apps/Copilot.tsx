import React, { useState, useEffect, useRef } from "react";
import { useSystem } from "../../context/SystemContext";
import { useWindow } from "../../context/WindowContext";
import { getAppDefinition } from "../../appCatalog";
import { Send, Sparkles } from "lucide-react";
import "./copilot.css";

interface Message {
  sender: "user" | "copilot";
  text: string;
}

const WALLPAPERS = [
  "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1920&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1920&q=80",
  "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=1920&q=80",
];

export const CopilotApp: React.FC = () => {
  const { toggleTheme, setWallpaper, installedAppIds } = useSystem();
  const { openApp, minimizeAllWindows } = useWindow();
  const replyTimersRef = useRef<Set<number>>(new Set());

  // Closing Copilot cancels pending replies (and the actions they would run).
  useEffect(() => {
    const timers = replyTimersRef.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const launch = (appId: string, okReply: string) => {
    if (appId !== "store" && !installedAppIds.includes(appId)) {
      return `${getAppDefinition(appId).title} yüklü değil. Microsoft Store'dan yükleyebilirsiniz.`;
    }
    openApp(appId);
    return okReply;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "copilot",
      text: "Merhaba! Ben Windows Copilot. Size nasıl yardımcı olabilirim? Aşağıdaki önerilerden birine tıklayabilir veya bana yapmak istediğiniz işlemi yazabilirsiniz.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const nextMessages = [...messages, { sender: "user", text } as Message];
    setMessages(nextMessages);
    setInputVal("");
    setIsTyping(true);

    // Simulate AI response calculation
    const timer = window.setTimeout(() => {
      replyTimersRef.current.delete(timer);
      let reply = "";
      // Both forms: tr-TR handles "KARANLIK"/"İ", plain handles English "I".
      const query = `${text.toLowerCase()} ${text.toLocaleLowerCase("tr-TR")}`;

      if (query.includes("hesap makinesi") || query.includes("calculator")) {
        reply = launch("calculator", "Hesap Makinesi uygulamasını açıyorum.");
      } else if (
        query.includes("terminal") ||
        query.includes("cmd") ||
        query.includes("komut satırı")
      ) {
        reply = launch("cmd", "Terminal uygulamasını çalıştırıyorum.");
      } else if (query.includes("not defteri") || query.includes("notepad")) {
        reply = launch("notepad", "Not Defteri uygulamasını açıyorum.");
      } else if (query.includes("paint") || query.includes("çizim")) {
        reply = launch("paint", "MS Paint uygulamasını açıyorum.");
      } else if (query.includes("ayarlar") || query.includes("settings")) {
        reply = launch("settings", "Sistem Ayarları uygulamasını açıyorum.");
      } else if (
        query.includes("tarayıcı") ||
        query.includes("chrome") ||
        query.includes("edge")
      ) {
        reply = launch("edge", "Google Chrome tarayıcısını açıyorum.");
      } else if (query.includes("hava durumu") || query.includes("weather")) {
        reply = launch("weather", "Hava Durumu uygulamasını açıyorum.");
      } else if (
        query.includes("görev yöneticisi") ||
        query.includes("task manager") ||
        query.includes("taskmgr")
      ) {
        reply = launch("taskmgr", "Görev Yöneticisi uygulamasını açıyorum.");
      } else if (
        query.includes("mağaza") ||
        query.includes("store") ||
        query.includes("microsoft store")
      ) {
        reply = launch("store", "Microsoft Store mağazasını açıyorum.");
      } else if (
        query.includes("karanlık mod") ||
        query.includes("açık mod") ||
        query.includes("tema") ||
        query.includes("theme")
      ) {
        reply = "Sistem temasını değiştiriyorum.";
        toggleTheme();
      } else if (
        query.includes("duvar kağıdı") ||
        query.includes("arka plan") ||
        query.includes("wallpaper")
      ) {
        reply = "Masaüstü duvar kağıdını sizin için değiştiriyorum.";
        const randWall =
          WALLPAPERS[Math.floor(Math.random() * WALLPAPERS.length)];
        setWallpaper(randWall);
      } else if (
        query.includes("küçült") ||
        query.includes("pencereleri") ||
        query.includes("minimize")
      ) {
        reply = "Tüm pencereleri küçültüp masaüstünü temizliyorum.";
        minimizeAllWindows();
      } else {
        reply =
          "Windows 11 simülatöründe size yardımcı olmaktan mutluluk duyarım! Uygulamaları Microsoft Store'dan yükleyebilir, sürükle-bırak ile masaüstü simgelerini taşıyabilir ya da sol alttaki Widget panelini inceleyebilirsiniz. Başka bir komut çalıştırmak ister misiniz?";
      }

      setMessages((prev) => [...prev, { sender: "copilot", text: reply }]);
      setIsTyping(false);
    }, 1000);
    replyTimersRef.current.add(timer);
  };

  const suggestions = [
    { text: "Hesap Makinesini Aç", action: "Hesap Makinesini aç" },
    { text: "Temayı Değiştir", action: "Temayı değiştir" },
    { text: "Hava Durumunu Aç", action: "Hava durumunu aç" },
    { text: "Duvar Kağıdını Değiştir", action: "Duvar kağıdını değiştir" },
    { text: "Tüm Pencereleri Küçült", action: "Tüm pencereleri küçült" },
  ];

  return (
    <div className="copilot-app-container">
      {/* Header Accent */}
      <div className="copilot-header">
        <Sparkles className="copilot-header-icon animate-pulse" size={18} />
        <div className="copilot-header-info">
          <h3>Windows Copilot</h3>
          <span>Yapay Zeka Yardımcınız</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="copilot-chat-area">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble-row ${msg.sender}`}>
            {msg.sender === "copilot" && <div className="chat-avatar">🌀</div>}
            <div
              className={`chat-bubble ${msg.sender === "user" ? "glass-accent" : "glass"}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-bubble-row copilot">
            <div className="chat-avatar">🌀</div>
            <div className="chat-bubble typing glass">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="copilot-suggestions">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            className="suggestion-chip glass"
            onClick={() => handleSend(s.action)}
          >
            {s.text}
          </button>
        ))}
      </div>

      {/* Input Form Footer */}
      <form
        className="copilot-input-area"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputVal);
        }}
      >
        <input
          type="text"
          placeholder="Copilot'a sorun veya bir eylem yazın..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
        <button
          type="submit"
          className="copilot-send-btn"
          disabled={!inputVal.trim()}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

export default CopilotApp;
