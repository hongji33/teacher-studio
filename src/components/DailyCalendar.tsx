import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  X,
} from "lucide-react";

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export default function DailyCalendar({
  notes,
  onSave,
}: {
  notes: Record<string, string>;
  onSave: (date: string, note: string) => boolean | Promise<boolean>;
}) {
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const savingRef = useRef(false);
  savingRef.current = saving;
  async function saveNote(date: string, note: string) {
    if (savingRef.current) return;
    setSaving(true);
    setSaveFailed(false);
    try {
      if (await onSave(date, note)) setSelected(null);
      else setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  }
  const [params] = useSearchParams();
  const requested = params.get("date");
  const requestedDate =
    requested && /^\d{4}-\d{2}-\d{2}$/.test(requested)
      ? new Date(`${requested}T12:00:00`)
      : null;
  const initialDate =
    requestedDate &&
    !Number.isNaN(requestedDate.getTime()) &&
    dateKey(requestedDate) === requested
      ? requestedDate
      : null;
  const today = dateKey(new Date());
  const [month, setMonth] = useState(
    () =>
      new Date(
        (initialDate || new Date()).getFullYear(),
        (initialDate || new Date()).getMonth(),
        1,
      ),
  );
  const [selected, setSelected] = useState<string | null>(
    initialDate ? dateKey(initialDate) : null,
  );
  const [draft, setDraft] = useState(
    initialDate ? notes[dateKey(initialDate)] || "" : "",
  );
  const dirty = selected !== null && draft !== (notes[selected] || "");
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  function close() {
    if (savingRef.current) return;
    if (dirtyRef.current && !confirm("저장하지 않은 메모를 닫을까요?")) return;
    setSelected(null);
  }
  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement as HTMLElement | null;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        const elements = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".daily-dialog button:not(:disabled), .daily-dialog textarea",
          ),
        );
        const first = elements[0],
          last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    const unload = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", unload);
    return () => {
      document.removeEventListener("keydown", key);
      window.removeEventListener("beforeunload", unload);
      previous?.focus();
    };
  }, [selected]);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Math.ceil((month.getDay() + days) / 7) * 7;
  const prefix = dateKey(month).slice(0, 7);
  const count = Object.keys(notes).filter((date) =>
    date.startsWith(prefix),
  ).length;
  return (
    <>
      <div className="daily-heading">
        <div>
          <h1>하루 기록</h1>
        </div>
        <span className="daily-count">
          <CalendarDays size={17} />
          이번 달 {count}일 기록
        </span>
      </div>
      <section className="daily-calendar" aria-label="월별 메모 달력">
        <div className="daily-toolbar">
          <h2>
            {month.getFullYear()}년 {month.getMonth() + 1}월
          </h2>
          <div>
            <button
              className="icon-button"
              aria-label="이전 달"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="daily-today"
              onClick={() =>
                setMonth(
                  new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                )
              }
            >
              오늘
            </button>
            <button
              className="icon-button"
              aria-label="다음 달"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="daily-grid">
          {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
            <div
              key={day}
              className={`daily-weekday ${i === 0 ? "sunday" : i === 6 ? "saturday" : ""}`}
            >
              {day}
            </div>
          ))}
          {Array.from({ length: cells }, (_, i) => {
            const day = i - month.getDay() + 1;
            if (day < 1 || day > days)
              return <div className="daily-blank" key={i} />;
            const date = dateKey(
              new Date(month.getFullYear(), month.getMonth(), day),
            );
            return (
              <button
                key={date}
                className={`daily-cell ${date === today ? "is-today" : ""} ${i % 7 === 0 ? "sunday" : i % 7 === 6 ? "saturday" : ""}`}
                aria-label={`${date}${date === today ? " 오늘" : ""}${notes[date] ? " 메모 있음" : " 메모 작성"}`}
                onClick={() => {
                  setDraft(notes[date] || "");
                  setSelected(date);
                }}
              >
                <span className="daily-number">{day}</span>
                {notes[date] && (
                  <>
                    <span className="daily-note-preview">{notes[date]}</span>
                    <span className="daily-note-dot" />
                  </>
                )}
              </button>
            );
          })}
        </div>
      </section>
      <p className="daily-help">
        메모는 이 브라우저에 저장됩니다. 관리자 메뉴에서 백업을 내보낼 수
        있어요.
      </p>
      {selected && (
        <div className="daily-overlay" onClick={close}>
          <section
            className="daily-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="daily-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="daily-toolbar">
              <h2 id="daily-dialog-title">
                {selected.replace(/-/g, ". ")} 하루 기록
              </h2>
              <button
                className="icon-button"
                aria-label="메모 닫기"
                onClick={close}
              >
                <X size={20} />
              </button>
            </div>
            <label htmlFor="daily-note">하루의 일과 메모</label>
            <textarea
              id="daily-note"
              disabled={saving}
              autoFocus
              value={draft}
              maxLength={10000}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="오늘 있었던 일, 해야 할 일, 기억하고 싶은 순간을 적어 보세요."
            />
            <small>{draft.length.toLocaleString()} / 10,000</small>
            {saveFailed && (
              <p role="alert">
                저장 완료를 확인하지 못했습니다. 입력 내용은 유지됩니다. 연결
                상태와 화면의 오류 안내를 확인한 뒤 다시 저장해 주세요.
              </p>
            )}
            <div className="daily-dialog-actions">
              <button
                disabled={saving || !notes[selected]}
                onClick={() => {
                  if (confirm("이 날짜의 메모를 삭제할까요?"))
                    void saveNote(selected, "");
                }}
              >
                <Trash2 size={16} />
                삭제
              </button>
              <button
                className="primary"
                disabled={saving || !dirty}
                onClick={() => {
                  void saveNote(selected, draft);
                }}
              >
                <Save size={16} />
                {saving ? "저장 중…" : "저장"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
