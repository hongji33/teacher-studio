import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays } from "lucide-react";

export default function WeeklyJournal({
  notes,
}: {
  notes: Record<string, string>;
}) {
  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay(),
  );
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i,
    );
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const note = notes[key] || "";
    const weight = note.trim()
      ? Math.min(
          4,
          0.8 + Math.max(note.length / 60, note.split("\n").length / 3),
        )
      : 0.3;
    return {
      date,
      key,
      note,
      weight,
      isToday: date.toDateString() === today.toDateString(),
    };
  });
  return (
    <section className="weekly-journal" aria-labelledby="weekly-journal-title">
      <div className="weekly-journal-heading">
        <div>
          <h2 id="weekly-journal-title">
            <CalendarDays size={19} />
            이번 주 하루 기록
          </h2>
          <span>
            {days[0].date.getFullYear()}년 {days[0].date.getMonth() + 1}.
            {days[0].date.getDate()} – {days[6].date.getMonth() + 1}.
            {days[6].date.getDate()}
          </span>
        </div>
        <Link to="/calendar">
          월별 달력 <ArrowRight size={15} />
        </Link>
      </div>
      <ul
        className="weekly-days"
        style={
          {
            "--week-columns": days
              .map(
                (day) =>
                  `minmax(${day.note.trim() ? 70 : 42}px, ${day.weight}fr)`,
              )
              .join(" "),
          } as CSSProperties
        }
      >
        {days.map((day, i) => (
          <li
            key={day.key}
            className={`weekly-day ${day.note.trim() ? "has-note" : "is-empty"} ${day.isToday ? "weekly-today" : ""} ${i === 0 ? "sunday" : i === 6 ? "saturday" : ""}`}
          >
            <Link
              className="weekly-day-date"
              to={`/calendar?date=${day.key}`}
              aria-label={`${day.key}${day.isToday ? " 오늘" : ""} 하루 기록 열기`}
            >
              <span>{["일", "월", "화", "수", "목", "금", "토"][i]}</span>
              <b>
                {day.date.getMonth() + 1}.{day.date.getDate()}
              </b>
              {day.isToday && <small>오늘</small>}
            </Link>
            <Link
              className={`weekly-day-note ${day.note.trim() ? "weekly-note" : "weekly-empty"}`}
              to={`/calendar?date=${day.key}`}
              aria-label={`${day.key} 하루 기록 ${day.note.trim() ? "수정" : "작성"}`}
            >
              {day.note.trim() ? day.note : <span aria-hidden="true">＋</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
