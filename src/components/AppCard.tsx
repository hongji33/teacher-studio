import {
  Star,
  ArrowUpRight,
  Lock,
  Users,
  Globe,
  GraduationCap,
} from "lucide-react";
import Icon from "./Icon";
import type { WebApp } from "../types";
export const audienceLabels = {
  private: "나만 사용",
  teachers: "교사 공유",
  students: "학생 공유",
  public: "전체 공개",
};
export default function AppCard({
  app,
  category,
  onFavorite,
  onOpen,
  list = false,
}: {
  app: WebApp;
  category: string;
  onFavorite: () => void;
  onOpen: (tab: boolean) => void;
  list?: boolean;
}) {
  const AudienceIcon = {
    private: Lock,
    teachers: Users,
    students: GraduationCap,
    public: Globe,
  }[app.audience];
  return (
    <article className={`app-card ${list ? "list-card" : ""}`}>
      <div className="card-top">
        <span className={`app-icon ${app.color}`}>
          <Icon name={app.icon} size={26} />
        </span>
        <button
          className={`icon-button favorite ${app.favorite ? "is-favorite" : ""}`}
          aria-label={`${app.name} 즐겨찾기 ${app.favorite ? "해제" : "추가"}`}
          aria-pressed={app.favorite}
          onClick={onFavorite}
        >
          <Star size={18} fill={app.favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="card-copy">
        <span className="card-category">{category}</span>
        <button
          className="app-title"
          onClick={() => onOpen(app.mode === "tab")}
        >
          {app.name}
        </button>
        <p>{app.description}</p>
      </div>
      <div className="card-meta">
        <span>
          <AudienceIcon size={12} />
          {audienceLabels[app.audience]}
        </span>
        <span className="status-dot">웹앱</span>
      </div>
      <div className="card-actions">
        <button onClick={() => onOpen(false)}>
          포털에서 열기 <span>→</span>
        </button>
        <button
          aria-label={`${app.name} 새 창으로 열기`}
          title="새 창으로 열기"
          onClick={() => onOpen(true)}
        >
          새 창 <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}
