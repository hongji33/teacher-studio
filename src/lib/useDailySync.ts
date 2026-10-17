import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firebase } from "./firebase";

type Notes = Record<string, string>;
// A delayed acknowledgement must never be displayed as a completed save.
async function acknowledged<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              Error(
                "서버 저장 완료를 확인하지 못했습니다. 연결 후 기록을 확인해 주세요. 입력 내용은 창에 유지됩니다.",
              ),
            ),
          15000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer!);
  }
}
export function useDailySync() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(!!firebase);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [notes, setNotes] = useState<Notes>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!firebase) return;
    return onAuthStateChanged(
      firebase.auth,
      (next) => {
        setUser(next);
        setChecking(false);
        setReady(false);
        setLoaded(false);
        setNotes({});
        setError("");
        setMessage("");
      },
      () => {
        setChecking(false);
        setError("로그인 상태를 확인하지 못했습니다.");
      },
    );
  }, []);
  useEffect(() => {
    if (!firebase || !user) return;
    setReady(false);
    return onSnapshot(
      collection(firebase.db, "users", user.uid, "dailyNotes"),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return;
        const next: Notes = {};
        for (const record of snapshot.docs) {
          const value = record.data().note;
          if (
            /^\d{4}-\d{2}-\d{2}$/.test(record.id) &&
            typeof value === "string" &&
            value.trim()
          )
            next[record.id] = value;
        }
        setNotes(next);
        setReady(!snapshot.metadata.fromCache);
        if (!snapshot.metadata.fromCache) setLoaded(true);
      },
      () => {
        setReady(false);
        setError(
          "온라인 기록을 읽지 못했습니다. Firestore 사용 설정과 보안 규칙을 확인해 주세요. 기기의 기존 기록은 보존되어 있습니다.",
        );
      },
    );
  }, [user]);
  async function login() {
    if (!firebase) return;
    setBusy(true);
    setError("");
    try {
      await signInWithPopup(firebase.auth, new GoogleAuthProvider());
    } catch {
      setError(
        "Google 로그인에 실패했습니다. 팝업 허용, Google 로그인 사용 설정, 인증 허용 도메인을 확인해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (!firebase) return;
    try {
      await signOut(firebase.auth);
    } catch {
      setError("로그아웃하지 못했습니다. 다시 시도해 주세요.");
    }
  }
  async function save(date: string, note: string) {
    if (!firebase || !user || !ready) {
      setError("온라인 기록 연결을 먼저 확인해 주세요.");
      return false;
    }
    setError("");
    setMessage("");
    try {
      await acknowledged(
        setDoc(doc(firebase.db, "users", user.uid, "dailyNotes", date), {
          note: note.trim() ? note : "",
          updatedAt: serverTimestamp(),
        }),
      );
      setMessage(
        "온라인에 저장했습니다. 같은 계정으로 로그인한 기기에서 볼 수 있습니다.",
      );
      return true;
    } catch (e) {
      setError(
        e instanceof Error && e.message.startsWith("서버 저장")
          ? e.message
          : "온라인에 저장하지 못했습니다. 입력 내용은 창에 유지됩니다. 연결과 보안 규칙을 확인한 뒤 다시 저장해 주세요.",
      );
      return false;
    }
  }
  async function importDevice(deviceNotes: Notes) {
    if (!firebase || !user || !ready || busy) return;
    if (
      !confirm(
        "이 기기의 기록 중 온라인에 없는 날짜만 복사합니다. 같은 날짜의 온라인 기록은 유지하며, 기기 원본도 남겨둡니다. 계속할까요?",
      )
    )
      return;
    setBusy(true);
    setError("");
    let added = 0;
    try {
      const db = firebase.db,
        uid = user.uid;
      for (const [date, note] of Object.entries(deviceNotes)) {
        if (!note.trim()) continue;
        const inserted = await acknowledged(
          runTransaction(db, async (transaction) => {
            const target = doc(db, "users", uid, "dailyNotes", date);
            const existing = await transaction.get(target);
            if (existing.exists()) return false;
            transaction.set(target, { note, updatedAt: serverTimestamp() });
            return true;
          }),
        );
        if (inserted) added++;
      }
      setMessage(
        `${added}일 기록을 복사했습니다. 이미 온라인에 있는 날짜는 그대로 유지했습니다.`,
      );
    } catch {
      setError(
        `${added}일 기록을 복사한 뒤 중단되었습니다. 연결과 보안 규칙을 확인하고 다시 시도해 주세요. 원본은 보존됩니다.`,
      );
    } finally {
      setBusy(false);
    }
  }
  return {
    configured: !!firebase,
    user,
    checking,
    ready,
    loaded,
    notes,
    error,
    message,
    busy,
    login,
    logout,
    save,
    importDevice,
  };
}
