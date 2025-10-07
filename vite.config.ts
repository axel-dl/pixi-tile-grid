import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    lib: {
      // Entry point for your library
      entry: resolve(__dirname, 'src/index.ts'),
      
      // Library name for UMD/IIFE builds
      name: 'PixiTileGrid',
      
      // Output file naming
      fileName: (format) => `pixi-tile-grid.${format}.js`,
      
      // Generate multiple formats
      formats: ['es', 'cjs', 'umd']
    },
    
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ['pixi.js'],
      
      output: {
        // Provide global variables for externalized deps in UMD build
        globals: {
          'pixi.js': 'PIXI'
        },
        
        // Preserve source structure for better tree-shaking
        preserveModules: false,
        
        // Export style
        exports: 'named'
      }
    },
    
    // Generate sourcemaps for debugging
    sourcemap: true,
    
    // Target modern browsers
    target: 'esnext',
    
    // Output directory
    outDir: 'dist',
    
    // Clean output directory before build
    emptyOutDir: true
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
