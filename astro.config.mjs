// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // Se sirve en https://ifecolombia.edu.co/perfiles-laborales (subcarpeta, no raíz del dominio)
  base: '/perfiles-laborales/',
  // API calls go to external backend (https://perfilab.ifecolombia.edu.co)
  // Frontend is pure HTML/CSS/JS deployed to cPanel
});
