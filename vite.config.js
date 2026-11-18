import { defineConfig } from "vite";
// base relative : fonctionne dans l'application Android, sur GitHub Pages et en local
export default defineConfig({ base: "./", build: { outDir: "dist", target: "es2020" } });
