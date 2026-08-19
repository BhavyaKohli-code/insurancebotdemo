import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.PORT) || 5173;

  // Public hostname when the dev server is exposed through a tunnel
  // (ngrok, cloudflared, …). Only needed so HMR can find its way back.
  const publicHost = env.PUBLIC_HOST || '';

  const server = {
    // 0.0.0.0 so a phone / emulator on the same network can load the widget.
    host: true,
    port,
    strictPort: true,
    // Dev-only: Vite 403s any Host header it does not recognise, which is what
    // breaks ngrok and friends. `true` accepts them all.
    allowedHosts: true,
    cors: true,
  };

  if (publicHost) {
    server.hmr = { protocol: 'wss', host: publicHost, clientPort: 443 };
  }

  return {
    plugins: [react(), tailwindcss()],
    server,
    preview: { ...server, strictPort: false },
  };
});
