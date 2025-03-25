import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 10000, // 也可以不写，Render 会自动分配 $PORT
    allowedHosts: ["anti-memo-frontend-test-11-20-2024.onrender.com"], // ✅ 允许 Render 访问
  },
});
