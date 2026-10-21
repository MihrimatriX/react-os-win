import React, { useEffect, useState } from "react";
import { Bell, ChevronLeft, ChevronRight, Monitor, Shield, X } from "lucide-react";
import { useSystem } from "../../context/SystemContext";
import "./calendar.css";

const INITIAL_NOTIFICATIONS = [
  {
    id: "sec",
    icon: "shield" as const,
    title: "Windows Güvenliği",
    body: "Cihazınız güvende. Tehdit algılanmadı.",
    time: "Şimdi",
  },
  {
    id: "upd",
    icon: "monitor" as const,
    title: "Windows Update",
    body: "Sisteminiz güncel. Son denetleme az önce.",
    time: "12 dk",
  },
];

export const CalendarPanel: React.FC = () => {
  const { isCalendarOpen } = useSystem();
  const [now, setNow] = useState(new Date());
  const [viewDate, setViewDate] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [wasOpen, setWasOpen] = useState(isCalendarOpen);

  // Panel stays mounted while closed: jump back to the current month on open.
  if (isCalendarOpen !== wasOpen) {
    setWasOpen(isCalendarOpen);
    if (isCalendarOpen) {
      const today = new Date();
      setNow(today);
      setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
      setSelectedDay(null);
    }
  }

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  if (!isCalendarOpen) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });
  const weekdayNames = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, index - startDay + 1);
    return {
      date,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday:
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate(),
    };
  });

  const moveMonth = (direction: number) => {
    setViewDate((current) => {
      const next = new Date(
        current.getFullYear(),
        current.getMonth() + direction,
        1,
      );
      return next;
    });
    setSelectedDay(null);
  };

  return (
    <section
      className="calendar-panel-container glass"
      role="dialog"
      aria-label="Bildirimler ve takvim"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="notifications-section">
        <div className="notifications-header">
          <span className="notif-title">
            Bildirimler
            {notifications.length > 0 && (
              <span className="notification-count">{notifications.length}</span>
            )}
          </span>
          <button
            type="button"
            className="clear-all-btn"
            onClick={() => setNotifications([])}
            disabled={notifications.length === 0}
          >
            Tümünü Temizle
          </button>
        </div>

        {notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <article className="notif-card glass" key={notification.id}>
                <div className="notif-card-top">
                  <span className="notif-card-icon" aria-hidden>
                    {notification.icon === "shield" ? (
                      <Shield size={18} />
                    ) : (
                      <Monitor size={18} />
                    )}
                  </span>
                  <div className="notif-card-text">
                    <div className="notif-card-header">
                      <span className="notif-app-name">{notification.title}</span>
                      <span className="notif-time">{notification.time}</span>
                    </div>
                    <div className="notif-card-body">{notification.body}</div>
                  </div>
                  <button
                    type="button"
                    className="notif-dismiss"
                    aria-label="Bildirimi kapat"
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.filter((item) => item.id !== notification.id),
                      )
                    }
                  >
                    <X size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="notifications-empty" role="status">
            <Bell size={28} strokeWidth={1.5} />
            <span>Yeni bildirim yok</span>
          </div>
        )}
      </div>

      <div className="calendar-panel-separator" />

      <div className="calendar-section">
        <div className="calendar-month-header">
          <button
            type="button"
            className="calendar-today-button"
            onClick={() => {
              setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
              setSelectedDay(now.getDate());
            }}
          >
            {monthName}
          </button>
          <div className="calendar-navigation">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              aria-label="Önceki ay"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              aria-label="Sonraki ay"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="calendar-weekdays-grid" aria-hidden="true">
          {weekdayNames.map((name) => (
            <div key={name} className="weekday-label">
              {name}
            </div>
          ))}
        </div>

        <div className="calendar-days-grid" role="grid">
          {days.map((item) => (
            <button
              type="button"
              key={item.date.toISOString()}
              className={`calendar-day-cell ${!item.isCurrentMonth ? "other-month" : ""} ${item.isToday ? "today" : ""} ${selectedDay === item.day && item.isCurrentMonth ? "selected" : ""}`}
              onClick={() => {
                if (!item.isCurrentMonth) {
                  setViewDate(
                    new Date(item.date.getFullYear(), item.date.getMonth(), 1),
                  );
                }
                setSelectedDay(item.day);
              }}
              aria-label={item.date.toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              aria-current={item.isToday ? "date" : undefined}
              aria-selected={
                selectedDay === item.day && item.isCurrentMonth
              }
              role="gridcell"
            >
              <span className="day-number">{item.day}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CalendarPanel;
