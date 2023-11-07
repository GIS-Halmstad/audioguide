import path from "path";
import react from "@vitejs/plugin-react";

const SRC_DIR = path.resolve(__dirname, "./src");
const PUBLIC_DIR = path.resolve(__dirname, "./public");
const BUILD_DIR = path.resolve(__dirname, "./www");
export default async () => {
  return {
    plugins: [react()],
    root: SRC_DIR,
    base: "",
    publicDir: PUBLIC_DIR,
    build: {
      target: "esnext", // FIXME: If we want to support older targets, remove this and rewrite top-level asyncs to .then().
      outDir: BUILD_DIR,
      assetsInlineLimit: 0,
      emptyOutDir: true,
      rollupOptions: {
        treeshake: false,
      },
    },
    resolve: {
      alias: {
        "@": SRC_DIR,
      },
    },
    server: {
      host: true,
    },
  };
};
