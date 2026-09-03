import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SharedArrayBuffer (WASM multi-thread do ONNX Runtime) exige cross-origin
// isolation. `credentialless` mantém recursos cross-origin carregáveis sem CORP,
// diferente de `require-corp`. Browsers sem suporte caem em single-thread.
const CROSS_ORIGIN_ISOLATION_HEADERS = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
};

export default defineConfig({
  plugins: [react()],
  server: {
    headers: CROSS_ORIGIN_ISOLATION_HEADERS,
  },
  preview: {
    headers: CROSS_ORIGIN_ISOLATION_HEADERS,
  },
  optimizeDeps: {
    // O pré-bundle do esbuild quebra a resolução dos assets .wasm do runtime.
    exclude: ['onnxruntime-web'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // O ORT cria seus workers de pthread com `new Worker(import.meta.url)`.
        // Se ele ficar no mesmo chunk do app, o worker reexecuta o código React e
        // quebra com "document is not defined", travando a criação da sessão.
        manualChunks(id) {
          if (id.includes('onnxruntime-web')) return 'onnxruntime';
          return undefined;
        },
      },
    },
  },
});
