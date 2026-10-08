import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Home,
  ArrowUpRight,
  Minimize,
  Maximize,
  ShieldCheck,
} from "lucide-react";
import type { StudioData, WebApp } from "../types";
import Icon from "./Icon";
import { Empty } from "./WorkspaceUI";
export default function Runner({
  data,
  onOpen,
}: {
  data: StudioData;
  onOpen: (a: WebApp, tab: boolean) => void;
}) {
  const { id } = useParams();
  const app = data.apps.find((a) => a.id === id);
  const [full, setFull] = useState(false),
    [loaded, setLoaded] = useState(false),
    [slow, setSlow] = useState(false);
  useEffect(() => {
    setLoaded(false);
    setSlow(false);
    const t = setTimeout(() => setSlow(true), 10000);
    return () => clearTimeout(t);
  }, [id]);
  if (!app)
    return (
      <Empty
        title="웹앱을 찾을 수 없습니다"
        text="삭제되었거나 주소가 변경된 웹앱입니다."
        action={
          <Link className="primary" to="/">
            홈으로 돌아가기
          </Link>
        }
      />
    );
  return (
    <div className={`runner ${full ? "fullscreen" : ""}`}>
      <div className="runner-toolbar">
        <div>
          <span className={`app-icon ${app.color}`}>
            <Icon name={app.icon} />
          </span>
          <b>{app.name}</b>
        </div>
        <div>
          <Link className="secondary" to="/">
            <Home size={15} />홈
          </Link>
          <button className="secondary" onClick={() => onOpen(app, true)}>
            새 창 <ArrowUpRight size={15} />
          </button>
          <button
            className="icon-button"
            aria-label={full ? "전체 화면 해제" : "전체 화면"}
            onClick={() => setFull(!full)}
          >
            {full ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
      <div className="iframe-note">
        <ShieldCheck size={16} />
        <span>
          외부 웹앱입니다. 화면이 표시되지 않거나 로그인·저장이 작동하지 않으면{" "}
          <button onClick={() => onOpen(app, true)}>새 창에서 열기</button>를
          이용해 주세요. iframe 차단 여부는 자동 확인되지 않습니다.
        </span>
      </div>
      {!loaded && (
        <p className="loading-note">
          {slow
            ? "로딩이 지연되고 있습니다. 새 창에서 열어 보세요."
            : "웹앱을 불러오는 중입니다…"}
        </p>
      )}
      <iframe
        key={app.id}
        src={app.url}
        title={app.name}
        onLoad={() => setLoaded(true)}
        onError={() => setSlow(true)}
        allow="fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
