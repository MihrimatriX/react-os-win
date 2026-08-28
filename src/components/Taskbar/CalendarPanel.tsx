import React, { useEffect, useState } from "react";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { useSystem } from "../../context/SystemContext";
import "./calendar.css";

const INITIAL_NOTIFICATIONS = [
  {
    id: "security",
    title: "Güvenlik Merkezi",
    body: "Sisteminiz güvende. Herhangi bir tehdit algılanmadı.",
  },
  {
    id: "persistence",
    title: "Masaüstü",
    body: "Pencere düzeniniz ve kişiselleştirme tercihleriniz kaydediliyor.",
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
          notifications.map((notification) => (
            <article className="notif-card glass" key={notification.id}>
              <div className="notif-card-header">
                <Bell size={14} color="var(--accent-color)" />
                <span className="notif-app-name">{notification.title}</span>
              </div>
              <div className="notif-card-body">{notification.body}</div>
            </article>
          ))
        ) : (
          <div className="notifications-empty" role="status">
            Yeni bildirim yok
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
