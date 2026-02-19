/**
 * api.ts - Cliente HTTP para comunicarse con el backend en Render
 * Depende de: variable de entorno NEXT_PUBLIC_API_URL (configurada en Vercel)
 * Es usado por: Chat.tsx
 *
 * NEXT_PUBLIC_API_URL es la URL del backend en Render.
 * Se configura en Vercel → Settings → Environment Variables.
 * Ejemplo: https://bestieEQ-backend.onrender.com
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Estructura de un mensaje en el historial de conversación */
export interface Mensaje {
  role: "user" | "assistant";
  content: string;
}

/** Estructura de la respuesta del backend POST /api/chat */
export interface RespuestaChat {
  respuesta: string;
  fuentes: string[];        // Nombres de PDFs usados como fuente
  tiempo_ms: number;
  sin_documentos: boolean;  // True si el índice no devolvió contexto
}

/**
 * Envía una pregunta al chatbot y retorna la respuesta.
 *
 * @param pregunta Texto de la pregunta del estudiante
 * @param historial Mensajes anteriores para mantener contexto
 * @param esRegeneracion True si el usuario presionó "Regenerar respuesta"
 */
export async function preguntarAlChat(
  pregunta: string,
  historial: Mensaje[] = [],
  esRegeneracion = false
): Promise<RespuestaChat> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pregunta,
      historial: historial.slice(-6),  // Solo los últimos 6 mensajes
      es_regeneracion: esRegeneracion,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Error del servidor: ${res.status}`);
  }

  return res.json();
}

/**
 * Verifica si el backend está disponible.
 * Usado en Chat.tsx para mostrar estado de conexión.
 */
export async function verificarConexion(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
