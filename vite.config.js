import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

 

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // 让 Render 监听外部访问
    port: 10000, // 监听 Render 推荐的端口
  },
});
