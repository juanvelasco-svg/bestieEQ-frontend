/**
 * TypingIndicator.tsx - Animación "BestieEQ está escribiendo..."
 * Depende de: globals.css (clases avatar-bot, burbuja-bot, typing-dot)
 * Es usado por: Chat.tsx (se muestra mientras espera respuesta del backend)
 */

export default function TypingIndicator() {
  return (
    <div
      className="flex items-start gap-2 mb-4 mensaje-animado"
      role="status"
      aria-label="BestieEQ está preparando tu respuesta"
    >
      <div className="avatar-bot" aria-hidden="true">⚗️</div>

      <div className="burbuja-bot flex items-center gap-1.5 py-3 px-4">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
        <span className="sr-only">Escribiendo...</span>
      </div>
    </div>
  );
}
