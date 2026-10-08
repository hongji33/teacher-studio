import { useState, useEffect, useRef } from "react";
import {
  HashRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import {
  FolderOpen,
  LayoutDashboard,
  Search,
  Star,
  Sun,
  Moon,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowRight,
  ArrowUpRight,
  Grid2X2,
  List,
  Clock3,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  X,
  Menu,
  Check,
  Lock,
  CalendarDays,
} from "lucide-react";
import type { StudioData, WebApp } from "./types";
import { localRepository } from "./lib/storage";
import { seed } from "./data/seed";
import Icon from "./components/Icon";
import AppCard from "./components/AppCard";
import AppEditor from "./components/AppEditor";
import Admin from "./components/Admin";
import Runner from "./components/Runner";
import { SectionTitle, Empty, HeroArt } from "./components/WorkspaceUI";
import "./styles.css";
function load() {
  try {
    return { data: localRepository.load(), error: "" };
  } catch {
    return {
      data: seed(),
      error:
        "저장 데이터를 읽을 수 없습니다. 원본을 보존하기 위해 저장을 멈췄습니다. 관리자에서 백업을 가져오거나 초기 복원을 선택해 주세요.",
    };
  }
}
const initial = load();
function Frame() {
  const [data, setData] = useState<StudioData>(initial.data),
    [error, setError] = useState(initial.error),
    [blocked, setBlocked] = useState(!!initial.error),
    [toast, setToast] = useState("");
  const [collapsed, setCollapsed] = useState(false),
    [mobile, setMobile] = useState(false),
    [expanded, setExpanded] = useState<string[]>([]),
    [query, setQuery] = useState(""),
    [view, setView] = useState("grid"),
    [editor, setEditor] = useState<WebApp | null | undefined>(),
    [theme, setTheme] = useState(() => {
      try {
        return localStorage.getItem("teacher-studio:theme") || "light";
      } catch {
        return "light";
      }
    });
  const location = useLocation(),
    navigate = useNavigate(),
    searchRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("teacher-studio:theme", theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    setMobile(false);
    setFilter("all");
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setMobile(false);
        setQuery("");
      }
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  function commit(next: StudioData, recover = false) {
    if (blocked && !recover) {
      setToast("저장 오류를 먼저 관리자에서 해결해 주세요.");
      return false;
    }
    try {
      localRepository.save(next);
      setData(next);
      setError("");
      setBlocked(false);
      return true;
    } catch {
      setError(
        "데이터를 저장하지 못했습니다. 브라우저 저장 공간과 개인정보 설정을 확인해 주세요. 변경 사항은 저장되지 않았습니다.",
      );
      return false;
    }
  }
  function favorite(a: WebApp) {
    commit({
      ...data,
      apps: data.apps.map((n) =>
        n.id === a.id ? { ...n, favorite: !n.favorite } : n,
      ),
    });
  }
  function open(a: WebApp, tab: boolean) {
    commit({
      ...data,
      recent: [
        { appId: a.id, usedAt: new Date().toISOString() },
        ...data.recent.filter((r) => r.appId !== a.id),
      ].slice(0, 30),
    });
    if (tab) window.open(a.url, "_blank", "noopener,noreferrer");
    else navigate(`/run/${a.id}`);
  }
  const mainCats = data.categories
      .filter((c) => !c.parentId)
      .sort((a, b) => a.order - b.order),
    visible = data.apps
      .filter((a) => a.visible)
      .sort((a, b) => a.order - b.order),
    favorites = visible.filter((a) => a.favorite);
  const categoryId = location.pathname.startsWith("/category/")
    ? decodeURIComponent(location.pathname.split("/")[2])
    : null;
  const category = data.categories.find((c) => c.id === categoryId);
  const title =
    location.pathname === "/admin"
      ? "워크스페이스 관리"
      : location.pathname === "/favorites"
        ? "즐겨찾기"
        : location.pathname === "/recent"
          ? "최근 사용"
          : category?.name || "대시보드";
  const isHome = location.pathname === "/";
  const browse = query || !isHome;
  const searched = visible.filter((a) =>
    `${a.name} ${a.description} ${data.categories.find((c) => c.id === a.categoryId)?.name}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  let apps = searched;
  if (categoryId)
    apps = apps.filter(
      (a) =>
        a.categoryId === categoryId ||
        data.categories.find((c) => c.id === a.categoryId)?.parentId ===
          categoryId,
    );
  if (location.pathname === "/favorites") apps = apps.filter((a) => a.favorite);
  if (location.pathname === "/recent")
    apps = data.recent
      .map((r) => searched.find((a) => a.id === r.appId))
      .filter((a): a is WebApp => !!a);
  if (filter !== "all")
    apps = apps.filter(
      (a) =>
        a.categoryId === filter ||
        data.categories.find((c) => c.id === a.categoryId)?.parentId === filter,
    );
  const recent = data.recent
    .map((r) => visible.find((a) => a.id === r.appId))
    .filter((a): a is WebApp => !!a)
    .slice(0, 3);
  function categoryName(a: WebApp) {
    return data.categories.find((c) => c.id === a.categoryId)?.name || "";
  }
  function cards(items: WebApp[]) {
    return (
      <div className={`app-grid ${view === "list" ? "list-view" : ""}`}>
        {items.map((a) => (
          <AppCard
            key={a.id}
            app={a}
            category={categoryName(a)}
            onFavorite={() => favorite(a)}
            onOpen={(tab) => open(a, tab)}
            list={view === "list"}
          />
        ))}
      </div>
    );
  }
  return (
    <div className={`studio ${collapsed ? "collapsed" : ""}`}>
      <a className="skip-link" href="#main">
        본문으로 이동
      </a>
      {mobile && (
        <button
          className="sidebar-overlay"
          aria-label="메뉴 닫기"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <Link to="/" className="brand" aria-label="Teacher Studio 홈">
          <span className="brand-symbol">
            <PanelsMark />
          </span>
          <div>
            <b>
              Teacher Studio<span className="brand-dot">.</span>
            </b>
            <small>나의 교육 워크스페이스</small>
          </div>
        </Link>
        <button className="workspace-switch" onClick={() => navigate("/admin")}>
          <span className="avatar-small">T</span>
          <div>
            <b>나의 워크스페이스</b>
            <small>Personal workspace</small>
          </div>
          <ChevronDown size={14} />
        </button>
        <div className="sidebar-label">WORKSPACE</div>
        <nav aria-label="메인 메뉴">
          <Link
            className={`nav-item ${isHome ? "active" : ""}`}
            to="/"
            aria-label="대시보드"
          >
            <LayoutDashboard size={19} />
            <span>대시보드</span>
          </Link>
          <Link
            className={`nav-item ${location.pathname === "/favorites" ? "active" : ""}`}
            to="/favorites"
            aria-label="즐겨찾기"
          >
            <Star size={19} />
            <span>즐겨찾기</span>
            <small>{favorites.length}</small>
          </Link>
          <Link
            className={`nav-item ${location.pathname === "/recent" ? "active" : ""}`}
            to="/recent"
            aria-label="최근 사용"
          >
            <Clock3 size={19} />
            <span>최근 사용</span>
          </Link>
          <div className="sidebar-label category-label">
            MY COLLECTIONS{" "}
            <button aria-label="메뉴 관리" onClick={() => navigate("/admin")}>
              <Plus size={14} />
            </button>
          </div>
          {mainCats.map((c) => (
            <div className="nav-group" key={c.id}>
              <div
                className={`nav-category ${categoryId === c.id ? "selected" : ""}`}
              >
                <Link to={`/category/${c.id}`} aria-label={c.name}>
                  <span className={`nav-colored ${c.color}`}>
                    <Icon name={c.icon} size={18} />
                  </span>
                  <span>{c.name}</span>
                </Link>
                <button
                  aria-label={`${c.name} 하위 메뉴 ${expanded.includes(c.id) ? "접기" : "펼치기"}`}
                  aria-expanded={expanded.includes(c.id)}
                  onClick={() => {
                    if (collapsed) setCollapsed(false);
                    setExpanded(
                      expanded.includes(c.id)
                        ? expanded.filter((n) => n !== c.id)
                        : [...expanded, c.id],
                    );
                  }}
                >
                  {expanded.includes(c.id) ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
              </div>
              {expanded.includes(c.id) && (
                <div className="subnav">
                  {data.categories
                    .filter((s) => s.parentId === c.id)
                    .sort((a, b) => a.order - b.order)
                    .map((s) => (
                      <Link
                        className={categoryId === s.id ? "active" : ""}
                        key={s.id}
                        to={`/category/${s.id}`}
                      >
                        {s.name}
                        <small>
                          {visible.filter((a) => a.categoryId === s.id)
                            .length || ""}
                        </small>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="studio-note">
            <span>
              <Sparkles size={15} />
              작은 도구, 더 큰 가능성
            </span>
            <p>
              수업과 일상의 아이디어가
              <br />
              자라는 나만의 공간.
            </p>
          </div>
          <Link
            className={`nav-item ${location.pathname === "/admin" ? "active" : ""}`}
            to="/admin"
            aria-label="설정 및 관리자"
          >
            <Settings size={18} />
            <span>설정 및 관리자</span>
          </Link>
          <button
            className="nav-item collapse-button"
            aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
            <span>사이드바 접기</span>
          </button>
          <div className="profile">
            <span className="avatar">T</span>
            <div>
              <b>선생님의 스튜디오</b>
              <small>
                <span className="green-dot" /> 개인용 로컬 모드
              </small>
            </div>
            <Lock size={14} />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="메뉴 열기"
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb-home">내 워크스페이스</span>
            <ChevronRight size={13} />
            <b>{title}</b>
          </div>
          <div className="header-actions">
            <div className="global-search">
              <Search size={17} />
              <input
                ref={searchRef}
                aria-label="통합 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="웹앱 검색..."
              />
              <kbd>⌘ K</kbd>
              {query && (
                <button aria-label="검색 지우기" onClick={() => setQuery("")}>
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              className="icon-button header-star"
              aria-label="즐겨찾기 바로가기"
              onClick={() => navigate("/favorites")}
            >
              <Star size={19} />
            </button>
            <button
              className="icon-button"
              aria-label={theme === "light" ? "다크 모드" : "라이트 모드"}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            <span className="header-divider" />
            <button
              className="avatar header-avatar"
              aria-label="관리자 설정"
              onClick={() => navigate("/admin")}
            >
              T
            </button>
          </div>
        </header>
        <main id="main">
          {error && (
            <div role="alert" className="error storage-error">
              {error}
              <button onClick={() => navigate("/admin")}>데이터 관리 →</button>
            </div>
          )}
          <Routes>
            <Route
              path="/admin"
              element={
                <Admin
                  data={data}
                  commit={commit}
                  onAdd={() => setEditor(null)}
                  onEdit={setEditor}
                  notify={setToast}
                />
              }
            />
            <Route
              path="/run/:id"
              element={<Runner data={data} onOpen={open} />}
            />
            <Route
              path="*"
              element={
                <>
                  {!browse && (
                    <>
                      <div className="welcome-row">
                        <div>
                          <div className="date">
                            <CalendarDays size={14} />
                            {new Intl.DateTimeFormat("ko-KR", {
                              timeZone: "Asia/Seoul",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              weekday: "long",
                            }).format(new Date())}
                          </div>
                          <h1>
                            반가워요, 선생님 <span className="wave">✦</span>
                          </h1>
                          <p>
                            수업의 영감부터 오늘의 업무까지, 이곳에서
                            시작하세요.
                          </p>
                        </div>
                        <button
                          className="primary"
                          onClick={() => setEditor(null)}
                        >
                          <Plus size={17} />
                          웹앱 추가
                        </button>
                      </div>
                      <section className="hero">
                        <div className="hero-copy">
                          <span className="hero-pill">
                            <span /> MADE FOR YOUR TEACHING LIFE
                          </span>
                          <h2>
                            생각은 자유롭게,
                            <br />
                            수업은 더 풍요롭게.
                          </h2>
                          <p>
                            선생님의 아이디어와 도구를 한곳에.
                            <br />
                            나만의 교육 워크스페이스를 만들어 가세요.
                          </p>
                          <button
                            onClick={() =>
                              document
                                .getElementById("explore")
                                ?.scrollIntoView({ behavior: "smooth" })
                            }
                          >
                            나의 웹앱 둘러보기 <ArrowRight size={16} />
                          </button>
                        </div>
                        <HeroArt />
                        <div className="hero-caption">
                          A little space for big ideas <Sparkles size={12} />
                        </div>
                      </section>
                      <div className="overview">
                        <div className="metric">
                          <span className="metric-icon blue">
                            <LayoutGrid size={20} />
                          </span>
                          <div>
                            <small>전체 웹앱</small>
                            <b>
                              {data.apps.length}
                              <span>개</span>
                            </b>
                          </div>
                          <span className="metric-hint">나만의 도구 모음</span>
                        </div>
                        <div className="metric">
                          <span className="metric-icon amber">
                            <Star size={20} />
                          </span>
                          <div>
                            <small>즐겨찾는 웹앱</small>
                            <b>
                              {favorites.length}
                              <span>개</span>
                            </b>
                          </div>
                          <button
                            className="metric-arrow"
                            aria-label="즐겨찾기 보기"
                            onClick={() => navigate("/favorites")}
                          >
                            <ArrowUpRight size={18} />
                          </button>
                        </div>
                        <div className="metric">
                          <span className="metric-icon mint">
                            <FolderOpen size={20} />
                          </span>
                          <div>
                            <small>나의 컬렉션</small>
                            <b>
                              {mainCats.length}
                              <span>개</span>
                            </b>
                          </div>
                          <span className="metric-hint">
                            배움과 일상을 연결
                          </span>
                        </div>
                      </div>
                      <section className="collection-section">
                        <SectionTitle
                          title="무엇을 시작해 볼까요?"
                          sub="일과 수업에 맞는 컬렉션을 찾아보세요."
                        />
                        <div className="collection-grid">
                          {mainCats.slice(0, 6).map((c) => (
                            <Link
                              className="collection-card"
                              to={`/category/${c.id}`}
                              key={c.id}
                            >
                              <span className={`app-icon ${c.color}`}>
                                <Icon name={c.icon} size={22} />
                              </span>
                              <b>{c.name}</b>
                              <small>
                                {
                                  visible.filter(
                                    (a) =>
                                      a.categoryId === c.id ||
                                      data.categories.find(
                                        (n) => n.id === a.categoryId,
                                      )?.parentId === c.id,
                                  ).length
                                }
                                개의 웹앱
                              </small>
                              <ArrowUpRight size={14} />
                            </Link>
                          ))}
                        </div>
                      </section>
                      <section>
                        <SectionTitle
                          title="즐겨찾는 웹앱"
                          icon={<Star size={19} />}
                          sub="자주 쓰는 도구를 가장 가까이에."
                          action={
                            <Link to="/favorites">
                              모두 보기 <ArrowRight size={14} />
                            </Link>
                          }
                        />
                        {favorites.length ? (
                          cards(favorites.slice(0, 4))
                        ) : (
                          <Empty
                            title="가까이 두고 싶은 도구가 있나요?"
                            text="웹앱 카드의 별을 눌러 즐겨찾기를 만들어 보세요."
                          />
                        )}
                      </section>
                      <section>
                        <SectionTitle
                          title="최근 사용한 웹앱"
                          icon={<Clock3 size={19} />}
                          action={
                            recent.length ? (
                              <Link to="/recent">
                                전체 기록 <ArrowRight size={14} />
                              </Link>
                            ) : undefined
                          }
                        />
                        {recent.length ? (
                          <div className="recent-grid">
                            {recent.map((a) => (
                              <button
                                className="recent-card"
                                key={a.id}
                                onClick={() => open(a, a.mode === "tab")}
                              >
                                <span className={`app-icon ${a.color}`}>
                                  <Icon name={a.icon} size={19} />
                                </span>
                                <div>
                                  <b>{a.name}</b>
                                  <small>{categoryName(a)}</small>
                                </div>
                                <ArrowUpRight size={17} />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="recent-empty">
                            <span className="app-icon neutral">
                              <Clock3 size={20} />
                            </span>
                            <div>
                              <b>오늘의 첫 도구를 열어 보세요.</b>
                              <p>
                                사용한 웹앱이 여기에 표시되어, 다음에도 쉽게
                                이어갈 수 있어요.
                              </p>
                            </div>
                          </div>
                        )}
                      </section>
                    </>
                  )}
                  {browse && (
                    <div className="page-intro">
                      <div>
                        <span className="eyebrow">YOUR DIGITAL TOOLKIT</span>
                        <h1>{query ? "검색 결과" : title}</h1>
                        <p>
                          {query
                            ? `‘${query}’에 맞는 웹앱을 찾았어요.`
                            : category
                              ? "배움과 아이디어를 연결하는 나만의 도구 모음입니다."
                              : "필요한 순간, 필요한 도구를 바로 만나세요."}
                        </p>
                      </div>
                      <button
                        className="primary"
                        onClick={() => setEditor(null)}
                      >
                        <Plus size={17} />
                        웹앱 추가
                      </button>
                    </div>
                  )}
                  <section id="explore" className="explore">
                    <SectionTitle
                      title={
                        browse ? `${apps.length}개의 웹앱` : "전체 웹앱 탐색"
                      }
                      sub={
                        browse
                          ? undefined
                          : "나의 모든 도구, 한눈에 둘러보세요."
                      }
                      action={
                        <div className="view-toggle">
                          <button
                            aria-label="카드형 보기"
                            aria-pressed={view === "grid"}
                            className={view === "grid" ? "active" : ""}
                            onClick={() => setView("grid")}
                          >
                            <Grid2X2 size={16} />
                          </button>
                          <button
                            aria-label="목록형 보기"
                            aria-pressed={view === "list"}
                            className={view === "list" ? "active" : ""}
                            onClick={() => setView("list")}
                          >
                            <List size={17} />
                          </button>
                        </div>
                      }
                    />
                    <div className="category-tabs">
                      <button
                        className={filter === "all" ? "active" : ""}
                        onClick={() => setFilter("all")}
                      >
                        전체 <span>{searched.length}</span>
                      </button>
                      {mainCats
                        .filter(
                          (c) =>
                            c.id !== "personal" || categoryId === "personal",
                        )
                        .map((c) => (
                          <button
                            key={c.id}
                            className={filter === c.id ? "active" : ""}
                            onClick={() => setFilter(c.id)}
                          >
                            {c.name}
                          </button>
                        ))}
                    </div>
                    {apps.length ? (
                      cards(apps)
                    ) : (
                      <Empty
                        title={
                          query
                            ? "검색 결과가 없어요"
                            : "새로운 가능성을 담아 보세요"
                        }
                        text={
                          query
                            ? "다른 검색어를 입력하거나 필터를 변경해 보세요."
                            : "아직 등록된 웹앱이 없습니다. 이 컬렉션에 첫 번째 도구를 추가해 보세요."
                        }
                        action={
                          !query ? (
                            <button
                              className="primary"
                              onClick={() => setEditor(null)}
                            >
                              <Plus size={16} />
                              웹앱 추가
                            </button>
                          ) : undefined
                        }
                      />
                    )}
                  </section>
                </>
              }
            />
          </Routes>
          <footer>
            <span>
              <span className="footer-mark">✦</span> Teacher Studio{" "}
              <small>선생님의 하루에, 작은 여유를.</small>
            </span>
            <span>
              <ShieldCheck size={13} /> 이 브라우저에 로컬 저장{" "}
              <b>LOCAL WORKSPACE</b>
            </span>
          </footer>
        </main>
      </div>
      {editor !== undefined && (
        <AppEditor
          app={editor}
          categories={data.categories}
          onClose={() => setEditor(undefined)}
          onSave={(a) => {
            const ok = commit({
              ...data,
              apps: data.apps.some((n) => n.id === a.id)
                ? data.apps.map((n) => (n.id === a.id ? a : n))
                : [...data.apps, a],
            });
            if (ok) setToast("웹앱을 저장했습니다.");
            return ok;
          }}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button aria-label="알림 닫기" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
function PanelsMark() {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
      <path d="M5 4h15v5H5zM5 12h6v9H5zM14 12h6v9h-6z" fill="currentColor" />
    </svg>
  );
}
export default function App() {
  return (
    <HashRouter>
      <Frame />
    </HashRouter>
  );
}
