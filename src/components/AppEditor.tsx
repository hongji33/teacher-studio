import { useState, useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";
import type { WebApp, Category, Audience } from "../types";
import { safeUrl } from "../lib/storage";
import Icon, { iconNames } from "./Icon";
import { audienceLabels } from "./AppCard";
export default function AppEditor({
  app,
  categories,
  onSave,
  onClose,
}: {
  app: WebApp | null;
  categories: Category[];
  onSave: (a: WebApp) => boolean;
  onClose: () => void;
}) {
  const initial = app?.categoryId || categories[0]?.id || "";
  const [main, setMain] = useState(
    categories.find((c) => c.id === initial)?.parentId || initial,
  );
  const [draft, setDraft] = useState<WebApp>(
    app || {
      id: crypto.randomUUID(),
      name: "",
      url: "",
      description: "",
      categoryId: initial,
      icon: "Globe",
      color: "blue",
      mode: "iframe",
      favorite: false,
      visible: true,
      audience: "private",
      order: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  );
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.querySelector<HTMLInputElement>("input")?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          "button,input,textarea,select",
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  const patch = (p: Partial<WebApp>) => setDraft({ ...draft, ...p });
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
        ref={ref}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">YOUR WORKSPACE, YOUR TOOLS</span>
            <h2 id="editor-title">{app ? "웹앱 수정" : "새로운 웹앱 추가"}</h2>
          </div>
          <button className="icon-button" aria-label="닫기" onClick={onClose}>
            <X />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!safeUrl(draft.url)) {
              setError(
                "사용자 정보가 포함되지 않은 http 또는 https URL을 입력해 주세요.",
              );
              return;
            }
            if (
              !draft.name.trim() ||
              !categories.some((c) => c.id === draft.categoryId)
            ) {
              setError("이름과 카테고리를 확인해 주세요.");
              return;
            }
            if (
              onSave({
                ...draft,
                name: draft.name.trim(),
                updatedAt: new Date().toISOString(),
              })
            )
              onClose();
          }}
        >
          <div className="form-grid">
            <label className="span-2">
              웹앱 이름
              <input
                required
                maxLength={120}
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="예: 나의 미술 수업 도구"
              />
            </label>
            <label className="span-2">
              웹앱 URL
              <input
                required
                type="url"
                value={draft.url}
                onChange={(e) => patch({ url: e.target.value })}
                placeholder="https://"
              />
            </label>
            <label className="span-2">
              설명
              <textarea
                maxLength={600}
                value={draft.description}
                onChange={(e) => patch({ description: e.target.value })}
                placeholder="어떤 일을 도와주는 웹앱인가요?"
              />
            </label>
            <label>
              메인 카테고리
              <select
                value={main}
                onChange={(e) => {
                  setMain(e.target.value);
                  patch({ categoryId: e.target.value });
                }}
              >
                {categories
                  .filter((c) => !c.parentId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              서브 카테고리
              <select
                value={draft.categoryId}
                onChange={(e) => patch({ categoryId: e.target.value })}
              >
                <option value={main}>메인에 등록</option>
                {categories
                  .filter((c) => c.parentId === main)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              아이콘
              <select
                value={draft.icon}
                onChange={(e) => patch({ icon: e.target.value })}
              >
                {iconNames.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label>
              기본 실행 방식
              <select
                value={draft.mode}
                onChange={(e) =>
                  patch({ mode: e.target.value as WebApp["mode"] })
                }
              >
                <option value="iframe">포털 내부 실행</option>
                <option value="tab">새 창 실행</option>
              </select>
            </label>
            <label>
              공개 범위
              <select
                value={draft.audience}
                onChange={(e) =>
                  patch({ audience: e.target.value as Audience })
                }
              >
                {Object.entries(audienceLabels).map(([v, n]) => (
                  <option key={v} value={v}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className="field-label">포인트 색상</span>
              <div className="color-picker">
                {["blue", "purple", "mint", "pink", "amber"].map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={`app-icon ${c} ${draft.color === c ? "selected" : ""}`}
                    aria-label={`${c} 색상`}
                    aria-pressed={draft.color === c}
                    onClick={() => patch({ color: c })}
                  >
                    <Icon name={draft.icon} size={17} />
                  </button>
                ))}
              </div>
            </div>
            <div className="span-2 checks">
              <label>
                <input
                  type="checkbox"
                  checked={draft.favorite}
                  onChange={(e) => patch({ favorite: e.target.checked })}
                />{" "}
                즐겨찾기에 추가
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={draft.visible}
                  onChange={(e) => patch({ visible: e.target.checked })}
                />{" "}
                홈과 탐색에 표시
              </label>
            </div>
          </div>
          <p className="form-note">
            공개 범위는 분류 설정입니다. 현재 버전에는 인증과 공유 기능이
            없으며, 실제 접근 권한을 제한하지 않습니다.
          </p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <div className="modal-footer">
            <button type="button" className="secondary" onClick={onClose}>
              취소
            </button>
            <button className="primary" disabled={!categories.length}>
              <Plus size={17} />
              {app ? "변경 사항 저장" : "웹앱 추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
