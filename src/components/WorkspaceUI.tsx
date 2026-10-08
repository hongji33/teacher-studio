import { FolderOpen, Palette, BookOpen, Sparkles, Check } from "lucide-react";
export function SectionTitle({
  title,
  sub,
  action,
  icon,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>
          {icon}
          {title}
        </h2>
        {sub && <p>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
export function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <FolderOpen size={30} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function HeroArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <span className="art-star star-one">✦</span>
      <span className="art-star star-two">✦</span>
      <span className="art-dot" />
      <div className="floating-tag tag-top">
        <span className="tag-icon purple">
          <Palette size={16} />
        </span>
        수업에 영감을 더하다
      </div>
      <div className="art-board">
        <div className="board-top">
          <span />
          <span />
          <span />
          <i />
        </div>
        <div className="board-body">
          <div className="board-nav">
            <span />
            <span />
            <span />
          </div>
          <div className="board-content">
            <div className="board-title" />
            <div className="board-line" />
            <div className="mini-cards">
              <div className="mini-card purple">
                <Palette size={25} />
                <i />
                <i />
              </div>
              <div className="mini-card mint">
                <BookOpen size={25} />
                <i />
                <i />
              </div>
              <div className="mini-card amber">
                <Sparkles size={25} />
                <i />
                <i />
              </div>
            </div>
            <div className="board-bars">
              <i />
              <i />
            </div>
          </div>
        </div>
      </div>
      <div className="floating-tag tag-bottom">
        <span className="tag-icon mint">
          <Check size={16} />
        </span>
        오늘의 업무도 가볍게
      </div>
      <div className="art-sticker">
        <Sparkles size={28} />
      </div>
    </div>
  );
}
