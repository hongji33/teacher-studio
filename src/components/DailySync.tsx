import type { useDailySync } from "../lib/useDailySync";
export default function DailySync({
  sync,
  deviceNotes,
}: {
  sync: ReturnType<typeof useDailySync>;
  deviceNotes: Record<string, string>;
}) {
  return (
    <section className="daily-sync" aria-label="하루기록 기기 간 동기화">
      <div>
        <strong>휴대폰 · 노트북 함께 쓰기</strong>
        <p>
          {!sync.configured
            ? "기기 간 공유가 아직 연결되지 않았습니다. 현재 기록은 이 브라우저에 저장됩니다."
            : sync.checking
              ? "로그인 상태 확인 중…"
              : sync.user
                ? `${sync.user.email || "Google 계정"} · ${sync.ready ? "온라인 기록 연결됨" : "온라인 연결 확인 중…"}`
                : "두 기기에서 같은 Google 계정으로 로그인하세요. 로그인 전 기록은 이 기기에 그대로 남습니다."}
        </p>
      </div>
      {sync.configured && !sync.checking && (
        <div className="daily-sync-actions">
          {sync.user ? (
            <>
              <button
                disabled={
                  !sync.ready || sync.busy || !Object.keys(deviceNotes).length
                }
                onClick={() => void sync.importDevice(deviceNotes)}
              >
                이 기기의 기존 기록 복사
              </button>
              <button disabled={sync.busy} onClick={() => void sync.logout()}>
                로그아웃
              </button>
            </>
          ) : (
            <button
              className="primary"
              disabled={sync.busy}
              onClick={() => void sync.login()}
            >
              Google 로그인
            </button>
          )}
        </div>
      )}
      {sync.error && (
        <p role="alert" className="error">
          {sync.error}
        </p>
      )}
      {sync.message && <p role="status">{sync.message}</p>}
    </section>
  );
}
