import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const SUPABASE_URL = process.env["VITE_SUPABASE_URL"] || "https://mydjanncsfeatnpnnscx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || "sb_publishable_F0i_sEMZF6grsvLWxrZvnw_Om8pIU8f";
const SUPABASE_PROJECT_ID = process.env["VITE_SUPABASE_PROJECT_ID"] || "mydjanncsfeatnpnnscx";

process.env["VITE_SUPABASE_URL"] = SUPABASE_URL;
process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] = SUPABASE_PUBLISHABLE_KEY;
process.env["VITE_SUPABASE_PROJECT_ID"] = SUPABASE_PROJECT_ID;
process.env["SUPABASE_URL"] = SUPABASE_URL;
process.env["SUPABASE_PUBLISHABLE_KEY"] = SUPABASE_PUBLISHABLE_KEY;
process.env["SUPABASE_PROJECT_ID"] = SUPABASE_PROJECT_ID;

export default defineConfig({
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
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
