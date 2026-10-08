import { useState, useRef } from "react";
import {
  Plus,
  Download,
  Upload,
  RotateCcw,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { StudioData, Category, WebApp } from "../types";
import Icon, { iconNames } from "./Icon";
import { audienceLabels } from "./AppCard";
import { validate } from "../lib/storage";
import { seed } from "../data/seed";
export default function Admin({
  data,
  commit,
  onEdit,
  onAdd,
  notify,
}: {
  data: StudioData;
  commit: (d: StudioData, recover?: boolean) => boolean;
  onEdit: (a: WebApp) => void;
  onAdd: () => void;
  notify: (s: string) => void;
}) {
  const [tab, setTab] = useState("apps"),
    [q, setQ] = useState(""),
    [cat, setCat] = useState("all");
  const file = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState(""),
    [parent, setParent] = useState(""),
    [icon, setIcon] = useState("Palette");
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `teacher-studio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importData(f: File) {
    try {
      if (f.size > 5 * 1024 * 1024)
        throw Error("5MB 이하 파일을 선택해 주세요.");
      const next = validate(JSON.parse(await f.text()));
      if (
        confirm(
          `${next.apps.length}개 웹앱과 ${next.categories.length}개 메뉴로 현재 데이터를 교체합니다. 먼저 내보내기로 백업해 주세요. 가져올까요?`,
        ) &&
        commit(next, true)
      )
        notify("데이터를 가져왔습니다.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "가져오기에 실패했습니다.");
    }
  }
  function move(c: Category, direction: number) {
    const siblings = data.categories
      .filter((n) => n.parentId === c.parentId)
      .sort((a, b) => a.order - b.order);
    const idx = siblings.findIndex((n) => n.id === c.id),
      target = idx + direction;
    if (!siblings[target]) return;
    [siblings[idx], siblings[target]] = [siblings[target], siblings[idx]];
    commit({
      ...data,
      categories: data.categories.map((n) => {
        const i = siblings.findIndex((s) => s.id === n.id);
        return i < 0 ? n : { ...n, order: i };
      }),
    });
  }
  const ordered = data.categories
    .filter((c) => !c.parentId)
    .sort((a, b) => a.order - b.order)
    .flatMap((c) => [
      c,
      ...data.categories
        .filter((s) => s.parentId === c.id)
        .sort((a, b) => a.order - b.order),
    ]);
  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">STUDIO SETTINGS</span>
          <h1>워크스페이스 관리</h1>
          <p>나에게 맞는 도구와 메뉴로 공간을 만들어 보세요.</p>
        </div>
        <button className="primary" onClick={onAdd}>
          <Plus size={17} />
          웹앱 추가
        </button>
      </div>
      <div className="notice">
        <ShieldCheck size={22} />
        <div>
          <b>이 브라우저에서 관리하는 개인용 공간입니다.</b>
          <p>
            로그인·기기 간 동기화는 아직 제공하지 않습니다. 민감한 업무 정보를
            소스나 JSON에 넣어 공개 배포하지 마세요.
          </p>
        </div>
      </div>
      <div className="admin-toolbar">
        <div className="tabs">
          <button
            className={tab === "apps" ? "active" : ""}
            onClick={() => setTab("apps")}
          >
            웹앱 관리 <span>{data.apps.length}</span>
          </button>
          <button
            className={tab === "menus" ? "active" : ""}
            onClick={() => setTab("menus")}
          >
            메뉴 관리
          </button>
          <button
            className={tab === "data" ? "active" : ""}
            onClick={() => setTab("data")}
          >
            데이터 관리
          </button>
        </div>
      </div>
      {tab === "apps" && (
        <>
          <div className="filter-bar">
            <div className="inline-search">
              <Search size={17} />
              <input
                aria-label="관리 웹앱 검색"
                placeholder="이름, 설명, URL 검색"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select
              aria-label="카테고리 필터"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
            >
              <option value="all">모든 카테고리</option>
              {ordered.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentId ? "　" : ""}
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>웹앱</th>
                  <th>카테고리</th>
                  <th>공개 범위</th>
                  <th>표시</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {data.apps
                  .filter(
                    (a) =>
                      (cat === "all" ||
                        a.categoryId === cat ||
                        data.categories.find((c) => c.id === a.categoryId)
                          ?.parentId === cat) &&
                      `${a.name} ${a.description} ${a.url}`
                        .toLowerCase()
                        .includes(q.toLowerCase()),
                  )
                  .map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="table-app">
                          <span className={`app-icon ${a.color}`}>
                            <Icon name={a.icon} />
                          </span>
                          <div>
                            <b>{a.name}</b>
                            <small>{a.url}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {
                          data.categories.find((c) => c.id === a.categoryId)
                            ?.name
                        }
                      </td>
                      <td>
                        <select
                          aria-label={`${a.name} 공개 범위`}
                          value={a.audience}
                          onChange={(e) =>
                            commit({
                              ...data,
                              apps: data.apps.map((n) =>
                                n.id === a.id
                                  ? {
                                      ...n,
                                      audience: e.target
                                        .value as WebApp["audience"],
                                      updatedAt: new Date().toISOString(),
                                    }
                                  : n,
                              ),
                            })
                          }
                        >
                          {Object.entries(audienceLabels).map(([v, n]) => (
                            <option key={v} value={v}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className={`visibility ${a.visible ? "on" : ""}`}
                          onClick={() =>
                            commit({
                              ...data,
                              apps: data.apps.map((n) =>
                                n.id === a.id
                                  ? { ...n, visible: !n.visible }
                                  : n,
                              ),
                            })
                          }
                        >
                          {a.visible ? "표시" : "숨김"}
                        </button>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            aria-label={`${a.name} 수정`}
                            onClick={() => onEdit(a)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-button"
                            aria-label={`${a.name} 삭제`}
                            onClick={() => {
                              if (
                                confirm(
                                  `‘${a.name}’을 포털에서 삭제할까요? 원본 웹앱은 삭제되지 않습니다.`,
                                )
                              )
                                commit({
                                  ...data,
                                  apps: data.apps.filter((n) => n.id !== a.id),
                                  recent: data.recent.filter(
                                    (n) => n.appId !== a.id,
                                  ),
                                });
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!data.apps.length && (
              <p className="empty-inline">첫 번째 웹앱을 추가해 보세요.</p>
            )}
          </div>
        </>
      )}
      {tab === "menus" && (
        <div className="menu-admin-grid">
          <div className="panel">
            <h3>메뉴 순서와 구성</h3>
            {ordered.map((c) => (
              <div className={`menu-row ${c.parentId ? "sub" : ""}`} key={c.id}>
                <Icon name={c.icon} size={17} />
                <span>{c.name}</span>
                <button
                  className="icon-button"
                  aria-label={`${c.name} 위로`}
                  onClick={() => move(c, -1)}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`${c.name} 아래로`}
                  onClick={() => move(c, 1)}
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`${c.name} 수정`}
                  onClick={() => {
                    setEditing(c);
                    setName(c.name);
                    setParent(c.parentId || "");
                    setIcon(c.icon);
                  }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`${c.name} 삭제`}
                  onClick={() => {
                    if (
                      data.apps.some((a) => a.categoryId === c.id) ||
                      data.categories.some((s) => s.parentId === c.id)
                    ) {
                      notify(
                        "연결된 웹앱을 이동하고 하위 메뉴를 삭제한 후 삭제해 주세요.",
                      );
                      return;
                    }
                    if (confirm(`‘${c.name}’ 메뉴를 삭제할까요?`))
                      commit({
                        ...data,
                        categories: data.categories.filter(
                          (n) => n.id !== c.id,
                        ),
                      });
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <form
            className="panel menu-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              if (
                editing &&
                parent &&
                (data.categories.some((c) => c.parentId === editing.id) ||
                  parent === editing.id)
              ) {
                notify("하위 메뉴가 있는 메뉴는 이동할 수 없습니다.");
                return;
              }
              const c: Category = {
                id: editing?.id || crypto.randomUUID(),
                name: name.trim(),
                icon,
                color: editing?.color || "blue",
                parentId: parent || null,
                order: editing?.order ?? Date.now(),
              };
              if (
                commit({
                  ...data,
                  categories: editing
                    ? data.categories.map((n) => (n.id === c.id ? c : n))
                    : [...data.categories, c],
                })
              ) {
                setEditing(null);
                setName("");
                setParent("");
                notify("메뉴를 저장했습니다.");
              }
            }}
          >
            <h3>{editing ? "메뉴 수정" : "새 메뉴 추가"}</h3>
            <label>
              메뉴 이름
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              상위 메뉴
              <select
                value={parent}
                onChange={(e) => setParent(e.target.value)}
              >
                <option value="">메인 메뉴로 등록</option>
                {data.categories
                  .filter((c) => !c.parentId && c.id !== editing?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              아이콘
              <select value={icon} onChange={(e) => setIcon(e.target.value)}>
                {iconNames.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <button className="primary" type="submit">
              메뉴 저장
            </button>
            {editing && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setEditing(null);
                  setName("");
                  setParent("");
                }}
              >
                수정 취소
              </button>
            )}
          </form>
        </div>
      )}
      {tab === "data" && (
        <div className="data-cards">
          <div className="panel">
            <Download />
            <h3>나의 공간 백업하기</h3>
            <p>웹앱, 메뉴, 즐겨찾기와 최근 기록을 JSON 파일로 보관합니다.</p>
            <button className="secondary" onClick={exportData}>
              JSON 내보내기
            </button>
          </div>
          <div className="panel">
            <Upload />
            <h3>백업 불러오기</h3>
            <p>
              검증된 Teacher Studio JSON만 가져옵니다. 현재 데이터가 교체됩니다.
            </p>
            <button className="secondary" onClick={() => file.current?.click()}>
              JSON 가져오기
            </button>
            <input
              hidden
              type="file"
              ref={file}
              accept="application/json,.json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importData(f);
                e.target.value = "";
              }}
            />
          </div>
          <div className="panel">
            <RotateCcw />
            <h3>처음의 공간으로</h3>
            <p>모든 변경 사항을 삭제하고 18개 기본 웹앱과 메뉴를 복원합니다.</p>
            <button
              className="secondary danger"
              onClick={() => {
                if (
                  confirm(
                    "현재 설정과 사용 기록을 모두 삭제하고 초기 데이터로 복원할까요? 백업을 권장합니다.",
                  ) &&
                  commit(seed(), true)
                )
                  notify("초기 데이터를 복원했습니다.");
              }}
            >
              초기 데이터 복원
            </button>
          </div>
        </div>
      )}
    </>
  );
}
