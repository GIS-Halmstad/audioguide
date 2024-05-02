import path from "path";
import { readFileSync, writeFileSync } from "fs";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import gitHash from "./getGitHash.js";

const SRC_DIR = path.resolve(__dirname, "./src");
const PUBLIC_DIR = path.resolve(__dirname, "./public");
const BUILD_DIR = path.resolve(__dirname, "./www");
export default defineConfig({
  plugins: [
    react(),
    // A custom plugin that adds latest commit hash and build date
    // to meta tags in index.html.
    {
      name: "postbuild-commands",
      // This function is called once the build is done.
      closeBundle() {
        const indexPath = `${BUILD_DIR}/index.html`;
        let indexHtml = readFileSync(indexPath, "utf-8");

        // Inject Git commit hash into meta tag. We get it
        // from a separate file that exports it as a string.
        indexHtml = indexHtml.replace(
          '<meta name="git-commit-hash" content="" />',
          `<meta name="git-commit-hash" content="${gitHash}" />`
        );

        // Inject build date into meta tag
        indexHtml = indexHtml.replace(
          '<meta name="build-date" content="" />',
          `<meta name="build-date" content="${new Date().toLocaleString(
            "sv-SE"
          )}" />`
        );

        // Write back to index.html
        writeFileSync(indexPath, indexHtml, "utf-8");
      },
    },
  ],
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  root: SRC_DIR,
  base: "",
  publicDir: PUBLIC_DIR,
  build: {
    target: "es2022", // If we want to support older targets, remove line and add vite-top-level-await plugin
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
    //   key: readFileSync("localhost.key"),
    //   cert: readFileSync("localhost.crt"),
    // },
  },
});
