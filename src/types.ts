export type Audience = "private" | "teachers" | "students" | "public";
export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  parentId: string | null;
  order: number;
};
export type WebApp = {
  id: string;
  name: string;
  url: string;
  description: string;
  categoryId: string;
  icon: string;
  color: string;
  mode: "iframe" | "tab";
  favorite: boolean;
  visible: boolean;
  audience: Audience;
  order: number;
  createdAt: string;
  updatedAt: string;
};
export type StudioData = {
  version: 1;
  categories: Category[];
  apps: WebApp[];
  recent: { appId: string; usedAt: string }[];
};
export interface StudioRepository {
  load(): StudioData;
  save(data: StudioData): void;
}
