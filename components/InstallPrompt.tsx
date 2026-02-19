/**
 * InstallPrompt.tsx - Botón para instalar la PWA
 * Depende de: nada externo (usa solo APIs del navegador)
 * Es usado por: Chat.tsx (aparece en el header)
 *
 * Android/Chrome: usa el evento nativo beforeinstallprompt
 * iOS/Safari: muestra instrucciones manuales (Safari no soporta el evento nativo)
 */

"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [eventoInstalacion, setEventoInstalacion] = useState<BeforeInstallPromptEvent | null>(null);
  const [mostrar, setMostrar] = useState(false);
  const [esIOS, setEsIOS] = useState(false);
  const [instruccionesIOS, setInstruccionesIOS] = useState(false);

  useEffect(() => {
    // Si ya está instalada como PWA, no mostrar el botón
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Detectar iOS (Safari no soporta beforeinstallprompt)
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setEsIOS(iOS);
    if (iOS) {
      setMostrar(true);
      return;
    }

    // Chrome/Android: escuchar el evento nativo
    const handler = (e: Event) => {
      e.preventDefault();
      setEventoInstalacion(e as BeforeInstallPromptEvent);
      setMostrar(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setMostrar(false));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const instalar = async () => {
    if (esIOS) {
      setInstruccionesIOS(true);
      return;
    }
    if (!eventoInstalacion) return;
    await eventoInstalacion.prompt();
    const { outcome } = await eventoInstalacion.userChoice;
    if (outcome === "accepted") setMostrar(false);
  };

  if (!mostrar) return null;

  return (
    <>
      <button onClick={instalar} className="btn-accion" aria-label="Instalar BestieEQ">
        📲 Instalar
      </button>

      {/* Modal de instrucciones para iOS */}
      {instruccionesIOS && (
        <div
          className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4"
          onClick={() => setInstruccionesIOS(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm rounded-2xl p-5 mb-4"
            style={{ background: "rgba(30,27,75,0.98)", border: "1px solid rgba(255,255,255,0.2)" }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-white font-semibold mb-3 text-center">📲 Instalar en iPhone</h3>
            <ol className="text-sm space-y-2" style={{ color: "var(--texto-secundario)" }}>
              <li>1. Toca el botón <strong className="text-white">Compartir ↑</strong> en Safari</li>
              <li>2. Toca <strong className="text-white">"Agregar a pantalla de inicio"</strong></li>
              <li>3. Toca <strong className="text-white">"Agregar"</strong></li>
            </ol>
            <button
              onClick={() => setInstruccionesIOS(false)}
              className="mt-4 w-full py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: "var(--color-primario)" }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
