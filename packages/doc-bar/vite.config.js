import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import solid from 'vite-plugin-solid';
import { resolve } from 'path';

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react/jsx-runtime': 'ReactJSXRuntime',
  vue: 'Vue',
  svelte: 'Svelte',
  'solid-js': 'SolidJS',
  'solid-js/web': 'SolidJSWeb',
  preact: 'Preact',
  'preact/hooks': 'PreactHooks',
};

export default defineConfig({
  plugins: [
    // Scope each JSX plugin to its own file to avoid transform conflicts
    react({ include: /\/react\.jsx$/ }),
    solid({ include: /\/solid\.jsx$/ }),
    svelte({ include: /\.svelte$/ }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.js'),
        vue: resolve(__dirname, 'src/vue.js'),
        svelte: resolve(__dirname, 'src/svelte.svelte'),
        solid: resolve(__dirname, 'src/solid.jsx'),
        preact: resolve(__dirname, 'src/preact.js'),
        'web-component': resolve(__dirname, 'src/web-component.js'),
      },
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'vue',
        'svelte',
        'solid-js',
        'solid-js/web',
        'preact',
        'preact/hooks',
      ],
      output: [
        {
          format: 'es',
          entryFileNames: '[name].es.js',
          chunkFileNames: '[name].es.js',
          globals,
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs.js',
          chunkFileNames: '[name].cjs.js',
          globals,
        },
      ],
    },
    cssCodeSplit: false,
  },
});
