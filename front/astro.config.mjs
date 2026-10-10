// Configuração do front Astro do ClimaSP.
//
// O Tailwind 4 entra pelo plugin do Vite, não por uma integração: o
// @astrojs/tailwind foi descontinuado quando o Tailkit 4 assumiu o
// processamento via PostCSS/Vite nativo.

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});