import type { StudioData, StudioRepository } from "../types";
import { seed } from "../data/seed";
export const KEY = "teacher-studio:v1";
export function safeUrl(value: string) {
  try {
    const u = new URL(value);
    return (
      ["http:", "https:"].includes(u.protocol) && !u.username && !u.password
    );
  } catch {
    return false;
  }
}
export function validate(value: unknown): StudioData {
  const d = value as StudioData;
  if (
    !d ||
    d.version !== 1 ||
    !Array.isArray(d.apps) ||
    !Array.isArray(d.categories) ||
    !Array.isArray(d.recent) ||
    d.apps.length > 10000 ||
    d.categories.length > 1000
  )
    throw Error("지원하지 않는 데이터 형식입니다.");
  const ids = new Set<string>();
  for (const c of d.categories) {
    if (
      !c ||
      typeof c.id !== "string" ||
      !c.id ||
      ids.has(c.id) ||
      typeof c.name !== "string" ||
      !c.name.trim() ||
      typeof c.icon !== "string" ||
      !["blue", "purple", "mint", "pink", "amber"].includes(c.color) ||
      !Number.isFinite(c.order) ||
      (c.parentId !== null && typeof c.parentId !== "string")
    )
      throw Error("메뉴 데이터가 올바르지 않습니다.");
    ids.add(c.id);
  }
  for (const c of d.categories)
    if (
      c.parentId !== null &&
      (!d.categories.some((p) => p.id === c.parentId && p.parentId === null) ||
        c.id === c.parentId)
    )
      throw Error("메뉴 연결이 올바르지 않습니다.");
  const appIds = new Set<string>();
  for (const a of d.apps) {
    if (
      !a ||
      typeof a.id !== "string" ||
      !a.id ||
      appIds.has(a.id) ||
      typeof a.name !== "string" ||
      !a.name.trim() ||
      typeof a.description !== "string" ||
      typeof a.icon !== "string" ||
      !["blue", "purple", "mint", "pink", "amber"].includes(a.color) ||
      !safeUrl(a.url) ||
      !ids.has(a.categoryId) ||
      !["private", "teachers", "students", "public"].includes(a.audience) ||
      !["iframe", "tab"].includes(a.mode) ||
      typeof a.favorite !== "boolean" ||
      typeof a.visible !== "boolean" ||
      !Number.isFinite(a.order) ||
      typeof a.createdAt !== "string" ||
      typeof a.updatedAt !== "string"
    )
      throw Error("웹앱 데이터 또는 URL이 올바르지 않습니다.");
    appIds.add(a.id);
  }
  if (
    d.recent.some(
      (r) =>
        !r ||
        !appIds.has(r.appId) ||
        typeof r.usedAt !== "string" ||
        Number.isNaN(Date.parse(r.usedAt)),
    )
  )
    throw Error("최근 사용 기록이 올바르지 않습니다.");
  if (d.dailyNotes !== undefined) {
    if (
      !d.dailyNotes ||
      typeof d.dailyNotes !== "object" ||
      Array.isArray(d.dailyNotes)
    )
      throw Error("하루 기록 데이터가 올바르지 않습니다.");
    for (const [date, note] of Object.entries(d.dailyNotes)) {
      const parsed = new Date(`${date}T12:00:00Z`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(parsed.getTime()) ||
        parsed.toISOString().slice(0, 10) !== date ||
        typeof note !== "string" ||
        note.length > 10000
      )
        throw Error("하루 기록 날짜 또는 메모가 올바르지 않습니다.");
    }
  }
  return d;
}
export const localRepository: StudioRepository = {
  load() {
    const raw = localStorage.getItem(KEY);
    if (raw !== null) {
      const data = validate(JSON.parse(raw));
      // Add the new resources once without replacing personal apps or notes.
      const migrationKey = `${KEY}:art-resources-2026-10`;
      if (localStorage.getItem(migrationKey) !== "done") {
        const additions = seed()
          .apps.filter((app) =>
            [
              "https://hongji33.github.io/artmind",
              "https://hongji33.github.io/arthistory/",
            ].includes(app.url),
          )
          .filter(
            (app) =>
              !data.apps.some(
                (existing) =>
                  existing.url.replace(/\/$/, "") ===
                  app.url.replace(/\/$/, ""),
              ),
          );
        const category =
          data.categories.find((c) => c.id === "art-3") ||
          data.categories.find((c) => c.id === "art");
        if (category) {
          for (const app of additions) {
            let id = app.id;
            while (data.apps.some((existing) => existing.id === id))
              id += "-new";
            data.apps.push({
              ...app,
              id,
              categoryId: category.id,
              order: Math.max(-1, ...data.apps.map((a) => a.order)) + 1,
            });
          }
          localStorage.setItem(KEY, JSON.stringify(validate(data)));
          localStorage.setItem(migrationKey, "done");
        }
      }
      return data;
    }
    const initial = seed();
    localStorage.setItem(KEY, JSON.stringify(initial));
    localStorage.setItem(`${KEY}:art-resources-2026-10`, "done");
    return initial;
  },
  save(d) {
    localStorage.setItem(KEY, JSON.stringify(validate(d)));
  },
};
