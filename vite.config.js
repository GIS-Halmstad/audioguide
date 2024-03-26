import path from "path";
import fs from "fs";
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
      target: "es2022", // If we want to support older targets, remove line this and add vite-top-level-await plugin
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
      port: 3000,
      // Make sure to generate the required certificates,
      // see README.md for details.
      // https: {
      //   key: fs.readFileSync("localhost.key"),
      //   cert: fs.readFileSync("localhost.crt"),
      // },
    },
  };
};
