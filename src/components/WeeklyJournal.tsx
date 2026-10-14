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
    return { date, key, isToday: date.toDateString() === today.toDateString() };
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
      <div className="weekly-table-scroll">
        <table className="weekly-table">
          <caption className="weekly-caption">
            이번 주 날짜별 메모 · 날짜를 누르면 작성하거나 수정할 수 있습니다.
          </caption>
          <colgroup>
            {days.map((day, i) => (
              <col
                key={day.key}
                className={i === 0 || i === 6 ? "weekly-weekend" : ""}
              />
            ))}
          </colgroup>
          <thead>
            <tr>
              {days.map((day, i) => (
                <th
                  key={day.key}
                  scope="col"
                  className={`${i === 0 ? "sunday" : i === 6 ? "saturday" : ""} ${day.isToday ? "weekly-today" : ""}`}
                >
                  <Link to={`/calendar?date=${day.key}`}>
                    <span>{["일", "월", "화", "수", "목", "금", "토"][i]}</span>
                    <b>
                      {day.date.getMonth() + 1}.{day.date.getDate()}
                    </b>
                    {day.isToday && <small>오늘</small>}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {days.map((day) => (
                <td key={day.key}>
                  <Link
                    to={`/calendar?date=${day.key}`}
                    aria-label={`${day.key} 하루 기록 ${notes[day.key] ? "수정" : "작성"}`}
                    className={notes[day.key] ? "weekly-note" : "weekly-empty"}
                  >
                    {notes[day.key] || "메모 작성"}
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
