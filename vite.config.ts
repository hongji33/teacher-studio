import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
export default defineConfig(({ mode }) => ({ plugins: [react(), tailwind()], base: mode === "github" ? "/teacher-studio/" : "/" }));
