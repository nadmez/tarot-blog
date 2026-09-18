import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

function jsAsJsx() {
  return {
    name: "js-as-jsx",
    // Next.js keeps JSX in .js files; Vite/Oxc only parses JSX in .jsx unless lang is set.
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (source.includes("\0") || source.includes("node_modules")) {
        return null;
      }

      const resolved = await this.resolve(source, importer, {
        ...options,
        skipSelf: true,
      });

      if (!resolved || resolved.external) {
        return resolved;
      }

      const isAppJs =
        resolved.id.endsWith(".js") &&
        !resolved.id.includes("node_modules") &&
        !resolved.id.endsWith("vitest.setup.js") &&
        !resolved.id.includes(".config.");

      if (isAppJs && !resolved.id.includes("?lang.jsx")) {
        return `${resolved.id}?lang.jsx`;
      }

      return resolved;
    },
  };
}

export default defineConfig({
  plugins: [jsAsJsx(), react()],
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  resolve: {
    alias: {
      "@": path.join(root, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
    include: ["src/**/*.test.{js,jsx}"],
  },
});
