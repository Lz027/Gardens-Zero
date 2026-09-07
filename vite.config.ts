import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Backend connection details are baked into the build so the app also runs
// when hosted outside Lovable (e.g. Netlify) with no environment variables set.
const SUPABASE_URL = process.env["VITE_SUPABASE_URL"] || "https://mydjanncsfeatnpnnscx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
  "sb_publishable_F0i_sEMZF6grsvLWxrZvnw_Om8pIU8f";
const SUPABASE_PROJECT_ID = process.env["VITE_SUPABASE_PROJECT_ID"] || "mydjanncsfeatnpnnscx";

export default defineConfig({
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(SUPABASE_PROJECT_ID),
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
