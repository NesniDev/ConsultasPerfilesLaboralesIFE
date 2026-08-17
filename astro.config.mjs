// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // API calls go to external backend (e.g., https://api.tudominio.com)
  // Frontend is pure HTML/CSS/JS deployed to cPanel
});
