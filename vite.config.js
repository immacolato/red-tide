import { defineConfig } from 'vite';
import { resolve } from 'path';
import { execSync } from 'child_process';

// Get build info
const getBuildInfo = () => {
  try {
    const commitHash = execSync('git rev-parse HEAD').toString().trim();
    const buildDate = new Date().toISOString().split('T')[0];
    return { commitHash, buildDate };
  } catch (e) {
    return { commitHash: 'unknown', buildDate: new Date().toISOString().split('T')[0] };
  }
};

export default defineConfig({
  root: '.',
  base: '/red-tide/', // Per GitHub Pages - will become /red-tide/ after rename
  define: {
    'BUILD_DATE': JSON.stringify(getBuildInfo().buildDate),
    'COMMIT_HASH': JSON.stringify(getBuildInfo().commitHash)
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@entities': resolve(__dirname, './src/entities'),
      '@systems': resolve(__dirname, './src/systems'),
      '@rendering': resolve(__dirname, './src/rendering'),
      '@ui': resolve(__dirname, './src/ui'),
      '@utils': resolve(__dirname, './src/utils')
    }
  }
});
