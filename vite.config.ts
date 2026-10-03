import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Without this, Vite's dep scanner crawls every .html file under the
    // project root, including the unrelated mcp-server/ sibling project's
    // apps — which pulls in a second copy of React and breaks hooks
    // ("Invalid hook call") across the whole dev server.
    entries: ["index.html"],
  },
}));
