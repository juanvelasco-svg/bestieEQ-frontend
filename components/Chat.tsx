/**
 * Chat.tsx - Componente principal del chatbot BestieEQ
 * Depende de: lib/api.ts, Message.tsx, TypingIndicator.tsx, InstallPrompt.tsx, globals.css
 * Es usado por: app/page.tsx
 *
 * Maneja:
 * - Historial de mensajes en estado de React
 * - Envío de preguntas al backend (con optimistic UI)
 * - Scroll automático al último mensaje
 * - Auto-resize del textarea según el contenido
 * - Botones: "Nuevo tema" (limpiar chat), "Regenerar respuesta"
 * - Teclado virtual en móvil (usa 100dvh para viewport dinámico)
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { preguntarAlChat, type Mensaje } from "@/lib/api";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";
import InstallPrompt from "./InstallPrompt";

/** Mensaje completo en el UI (extiende Mensaje de api.ts con campos de presentación) */
interface MensajeUI extends Mensaje {
  id: string;
  timestamp: string;
  fuentes?: string[];
}

/** Texto y datos del mensaje de bienvenida */
const BIENVENIDA: MensajeUI = {
  id: "bienvenida",
  role: "assistant",
  content: `📚 ¡Hola! Soy tu Bestie en EQ

Estoy aquí para ayudarte a comprender mejor el material de **Química**. Tengo acceso a todos los apuntes y documentos del curso.

💡 **Puedo ayudarte a:**
- Explicar conceptos del temario
- Aclarar dudas específicas
- Repasar temas antes del examen
- Relacionar ideas entre diferentes temas

🎯 **Recuerda:** aprenderás mejor si razonamos juntos. No estoy aquí para hacer tu tarea, sino para guiarte.

¿Qué tema quieres explorar hoy?`,
  timestamp: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
};

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function horaActual() {
  return new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

export default function Chat() {
  const [mensajes, setMensajes] = useState<MensajeUI[]>([BIENVENIDA]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [ultimaPregunta, setUltimaPregunta] = useState("");

  const finRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll al último mensaje cada vez que cambia la lista o aparece el typing indicator
  const scrollAlFinal = useCallback(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollAlFinal(); }, [mensajes, cargando, scrollAlFinal]);

  // En móvil el teclado virtual reduce el viewport: forzar scroll al aparecer
  useEffect(() => {
    const handler = () => setTimeout(scrollAlFinal, 150);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [scrollAlFinal]);

  // Auto-resize del textarea (máximo 120px de alto)
  const ajustarTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, []);

  /**
   * Envía la pregunta al backend.
   * Optimistic UI: el mensaje del usuario aparece inmediatamente,
   * sin esperar la respuesta del servidor.
   */
  const enviar = useCallback(async (pregunta: string, esRegeneracion = false) => {
    const texto = pregunta.trim();
    if (!texto || cargando) return;

    setUltimaPregunta(texto);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Si es regeneración, quitar el último mensaje del bot antes de agregar el nuevo
    const mensajeUsuario: MensajeUI = {
      id: generarId(),
      role: "user",
      content: texto,
      timestamp: horaActual(),
    };

    setMensajes(prev => {
      const base = esRegeneracion ? prev.slice(0, -1) : [...prev, mensajeUsuario];
      return base;
    });

    setCargando(true);

    try {
      // Construir historial sin el mensaje de bienvenida
      const historial: Mensaje[] = mensajes
        .filter(m => m.id !== "bienvenida")
        .map(({ role, content }) => ({ role, content }));

      const respuesta = await preguntarAlChat(texto, historial, esRegeneracion);

      setMensajes(prev => [...prev, {
        id: generarId(),
        role: "assistant",
        content: respuesta.respuesta,
        timestamp: horaActual(),
        fuentes: respuesta.fuentes,
      }]);

    } catch (error) {
      setMensajes(prev => [...prev, {
        id: generarId(),
        role: "assistant",
        content: `⚠️ No pude conectarme con el servidor. Intenta de nuevo en un momento.\n\n_${error instanceof Error ? error.message : "Error desconocido"}_`,
        timestamp: horaActual(),
      }]);
    } finally {
      setCargando(false);
      textareaRef.current?.focus();
    }
  }, [cargando, mensajes]);

  const regenerar = useCallback(() => {
    if (ultimaPregunta && !cargando) enviar(ultimaPregunta, true);
  }, [ultimaPregunta, cargando, enviar]);

  const nuevoTema = useCallback(() => {
    setMensajes([BIENVENIDA]);
    setInput("");
    setUltimaPregunta("");
    textareaRef.current?.focus();
  }, []);

  const manejarTecla = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar(input);
    }
  }, [enviar, input]);

  // Índice del último mensaje del bot (para mostrar botón Regenerar solo ahí)
  const idxUltimoBot = mensajes.reduce((acc, m, i) => m.role === "assistant" ? i : acc, -1);

  return (
    <div className="chat-container" role="main">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="header">
        <div className="avatar-bot" aria-hidden="true">⚗️</div>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold text-sm">BestieEQ</h1>
          <p className="text-xs truncate" style={{ color: "var(--texto-timestamp)" }}>
            Tu tutor de Química
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InstallPrompt />
          <button onClick={nuevoTema} className="btn-accion" aria-label="Nuevo tema">
            🆕 Nuevo tema
          </button>
        </div>
      </header>

      {/* ── Mensajes ────────────────────────────────────────────────────── */}
      <main className="chat-mensajes" role="log" aria-live="polite" aria-label="Conversación">
        {mensajes.map((m, i) => (
          <Message
            key={m.id}
            role={m.role}
            content={m.content}
            timestamp={m.timestamp}
            fuentes={m.fuentes}
            esUltimo={i === idxUltimoBot}
            onRegenerar={i === idxUltimoBot ? regenerar : undefined}
          />
        ))}
        {cargando && <TypingIndicator />}
        <div ref={finRef} aria-hidden="true" />
      </main>

      {/* ── Input ───────────────────────────────────────────────────────── */}
      <footer className="input-area">
        <div className="flex items-end gap-2">
          <label htmlFor="pregunta" className="sr-only">Escribe tu pregunta de química</label>
          <textarea
            id="pregunta"
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); ajustarTextarea(); }}
            onKeyDown={manejarTecla}
            placeholder="Pregunta sobre química... (Enter para enviar)"
            className="input-textarea"
            rows={1}
            disabled={cargando}
            maxLength={1000}
            aria-label="Campo de pregunta"
          />
          <button
            onClick={() => enviar(input)}
            disabled={cargando || !input.trim()}
            className="btn-enviar"
            aria-label="Enviar pregunta"
          >
            {cargando ? (
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs mt-1.5 text-center" style={{ color: "var(--texto-timestamp)" }}>
          Shift+Enter para nueva línea · Enter para enviar
        </p>
      </footer>
    </div>
  );
}
