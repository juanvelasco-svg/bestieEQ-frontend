/**
 * Message.tsx - Burbuja de mensaje individual (usuario o bot)
 * Depende de: globals.css, react-markdown, remark-gfm
 * Es usado por: Chat.tsx
 *
 * Los mensajes del bot renderizan markdown (negritas, listas, fórmulas en código).
 * Los mensajes del usuario son texto plano.
 */

"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  fuentes?: string[];
  esUltimo?: boolean;
  onRegenerar?: () => void;
}

export default function Message({
  role,
  content,
  timestamp,
  fuentes = [],
  esUltimo = false,
  onRegenerar,
}: MessageProps) {
  const esBot = role === "assistant";

  return (
    <div
      className={`flex items-start gap-2 mb-4 mensaje-animado ${esBot ? "flex-row" : "flex-row-reverse"}`}
      role="article"
      aria-label={esBot ? "Mensaje de BestieEQ" : "Tu mensaje"}
    >
      {/* Avatar solo para el bot */}
      {esBot && (
        <div className="avatar-bot flex-shrink-0" aria-hidden="true">⚗️</div>
      )}

      <div className={`flex flex-col gap-1 ${esBot ? "items-start" : "items-end"} max-w-[80%]`}>

        {/* Burbuja principal */}
        <div className={esBot ? "burbuja-bot" : "burbuja-usuario"}>
          {esBot ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          ) : (
            <p>{content}</p>
          )}
        </div>

        {/* Fuentes de documentos: solo en mensajes del bot cuando hay fuentes */}
        {esBot && fuentes.length > 0 && (
          <div className="fuentes-container" role="note" aria-label="Documentos consultados">
            📚 Fuente{fuentes.length > 1 ? "s" : ""}: {fuentes.join(", ")}
          </div>
        )}

        {/* Timestamp y botón regenerar */}
        <div className="flex items-center gap-2 flex-wrap">
          <time dateTime={timestamp} className="text-xs" style={{ color: "var(--texto-timestamp)" }}>
            {timestamp}
          </time>

          {/* Botón regenerar solo en el último mensaje del bot */}
          {esBot && esUltimo && onRegenerar && (
            <button
              onClick={onRegenerar}
              className="btn-accion"
              aria-label="Regenerar esta respuesta"
            >
              🔄 Regenerar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
