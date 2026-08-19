import { useCallback, useRef, useEffect } from 'react';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Editor de texto controlado.
 *
 * **Por qué textarea y no contentEditable:** textarea es más simple de
 * controlar con React, genera eventos de input predecibles, y es
 * suficiente para el caso educativo. contentEditable tiene edge cases
 * complejos (IME, composición, selección) que distraerían del propósito.
 *
 * **Accesibilidad:** usa role="textbox" y aria-label descriptivo.
 */
export function TextEditor({ value, onChange, disabled }: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  // Auto-resize textarea según el contenido
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(300, textarea.scrollHeight)}px`;
    }
  }, [value]);

  return (
    <div className="w-full">
      <label htmlFor="editor-textarea" className="sr-only">
        Editor de texto
      </label>
      <textarea
        ref={textareaRef}
        id="editor-textarea"
        role="textbox"
        aria-label="Editor de texto colaborativo"
        aria-multiline="true"
        className="w-full min-h-[300px] p-4 font-mono text-sm leading-relaxed
                   bg-editor-bg text-editor-text border border-gray-700 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-editor-accent focus:border-transparent
                   resize-none placeholder-gray-500"
        placeholder="Comienza a escribir aquí..."
        value={value}
        onChange={handleChange}
        disabled={disabled}
        spellCheck={false}
      />
    </div>
  );
}
