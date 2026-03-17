import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  PluginOption,
  UserConfigExport,
  defineConfig,
  loadEnv,
} from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { visualizer } from 'rollup-plugin-visualizer';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

const shimsDir = fileURLToPath(
  new URL('node_modules/vite-plugin-node-polyfills/shims/', import.meta.url),
);

// https://vitejs.dev/config/
const config = ({ mode }): UserConfigExport => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [
      nodePolyfills({
        include: ['util', 'http', 'http2', 'https'],
        globals: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Buffer: true,
          process: true,
          global: true,
        },
      }),
      react(),
      viteTsconfigPaths(),
      svgrPlugin(),
      (process.env.ANALYZE ? [
        visualizer({
          filename: path.resolve(__dirname, 'build', 'bundle-stats.html'),
          open: false,
          gzipSize: true,
          brotliSize: true,
          template: 'treemap',
        }) as PluginOption,
      ] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'vite-plugin-node-polyfills/shims/process': path.join(shimsDir, 'process'),
        'vite-plugin-node-polyfills/shims/global': path.join(shimsDir, 'global'),
        'vite-plugin-node-polyfills/shims/buffer': path.join(shimsDir, 'buffer'),
      },
    },
    server: {
      port: 3000,
      open: true,
      host: true,
      proxy: process.env.VITE_ENV === 'local' ? {
        '/api/clinical': {
          target: process.env.VITE_CLINICAL_URL,
          changeOrigin: true,
          rewrite: (url): string => url.replace(/^\/api/, ''),
        },
        '/api/data-capture': {
          target: process.env.VITE_DATA_CAPTURE_URL,
          changeOrigin: true,
          rewrite: (url): string => url.replace(/^\/api/, ''),
        },
        '/api/linx': {
          target: process.env.VITE_LINX_URL,
          changeOrigin: true,
          rewrite: (url): string => url.replace(/^\/api/, ''),
        },
        '/api/audits': {
          target: process.env.VITE_AUDTIS_URL,
          changeOrigin: true,
          rewrite: (url): string => url.replace(/^\/api/, ''),
        },
        '/api/evidence': {
          target: process.env.VITE_EVIDENCES_URL,
          changeOrigin: true,
          rewrite: (url): string => url.replace(/^\/api/, ''),
        },
        '/api/drugs': {
          target: process.env.VITE_DRUGS_URL,
          changeOrigin: true,
          rewrite: (url): string => url.replace(/^\/api/, ''),
        },
        '/api/rna-plot': {
          target: process.env.VITE_RNA_PLOTS_URL,
          changeOrigin: true,
          rewrite: (url): string => url.replace(/^\/api/, ''),
        },
        '/api/reports': {
          target: process.env.VITE_REPORTS_URL,
          changeOrigin: true,
          rewrite: (url): string => url.replace(/^\/api/, ''),
        },
        '/api/notifications': {
          target: process.env.VITE_NOTIFICATIONS_URL,
          changeOrigin: true,
          rewrite: (url): string => url.replace(/^\/api/, ''),
        },
        '/api': {
          target: process.env.VITE_BASE_URL,
          changeOrigin: true,
          rewrite: (url): string => url.replace(/^\/api/, ''),
        },
      } : undefined,
    },
    build: {
      rollupOptions: {
        cache: true,
      },
      outDir: 'build',
      sourcemap: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    ...process.env.VITE_ENV === 'local' ? {
      define: {
        global: 'window',
      },
    } : {},
  });
};

export default config;
