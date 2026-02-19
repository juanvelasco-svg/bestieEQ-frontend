/**
 * next.config.js - Configuración de Next.js
 * Depende de: next-pwa (instalado en package.json), variable NEXT_PUBLIC_API_URL (Vercel)
 * Es usado por: Next.js al hacer build en Vercel
 */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",  // PWA desactivada en desarrollo local
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // NEXT_PUBLIC_API_URL se configura en Vercel → Environment Variables
  // Valor: URL del backend en Render (ej: https://bestieEQ-backend.onrender.com)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
};

module.exports = withPWA(nextConfig);
