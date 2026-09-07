import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Backend connection details are baked into the build so the app also runs
// when hosted outside Lovable (e.g. Netlify) with no environment variables set.
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_PROJECT_ID } from "./src/lib/backend-config";

process.env["VITE_SUPABASE_URL"] = SUPABASE_URL;
process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] = SUPABASE_PUBLISHABLE_KEY;
process.env["VITE_SUPABASE_PROJECT_ID"] = SUPABASE_PROJECT_ID;
process.env["SUPABASE_URL"] = SUPABASE_URL;
process.env["SUPABASE_PUBLISHABLE_KEY"] = SUPABASE_PUBLISHABLE_KEY;
process.env["SUPABASE_PROJECT_ID"] = SUPABASE_PROJECT_ID;

export default defineConfig({
  define: {
    "process.env.SUPABASE_URL": JSON.stringify(SUPABASE_URL),
    "process.env.SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
    "process.env.SUPABASE_PROJECT_ID": JSON.stringify(SUPABASE_PROJECT_ID),
  },

  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    nitro(),
  ],

  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
  },
});
