"use client";

import type React from "react";

import { useCallback, useEffect, useRef, useState } from "react";

export type CursorPosition = {
  line: number;
  column: number;
};

export type UseVirtualCursorOptions = {
  content: string;
  initialPosition?: CursorPosition;
  onPositionChange?: (position: CursorPosition) => void;
  onContentChange?: (content: string) => void;
  editable?: boolean;
};

export type UseVirtualCursorReturn = {
  position: CursorPosition;
  setPosition: (position: CursorPosition) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleClick: (e: React.MouseEvent) => void;
  lines: string[];
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
};

export function useVirtualCursor({
  content,
  initialPosition = { line: 0, column: 0 },
  onPositionChange,
  onContentChange,
  editable = false,
}: UseVirtualCursorOptions): UseVirtualCursorReturn {
  const [position, setPositionState] =
    useState<CursorPosition>(initialPosition);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const lines = content.split("\n");

  const setPosition = useCallback(
    (newPosition: CursorPosition) => {
      // Validar límites
      const clampedLine = Math.max(
        0,
        Math.min(newPosition.line, lines.length - 1)
      );
      const lineLength = lines[clampedLine]?.length ?? 0;
      const clampedColumn = Math.max(
        0,
        Math.min(newPosition.column, lineLength)
      );

      const clampedPosition = { line: clampedLine, column: clampedColumn };
      setPositionState(clampedPosition);
      onPositionChange?.(clampedPosition);
    },
    [lines, onPositionChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isFocused) {
        return;
      }

      const { line, column } = position;
      const currentLineLength = lines[line]?.length ?? 0;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (line > 0) {
            const newLine = line - 1;
            const newLineLength = lines[newLine]?.length ?? 0;
            setPosition({
              line: newLine,
              column: Math.min(column, newLineLength),
            });
          }
          break;

        case "ArrowDown":
          e.preventDefault();
          if (line < lines.length - 1) {
            const newLine = line + 1;
            const newLineLength = lines[newLine]?.length ?? 0;
            setPosition({
              line: newLine,
              column: Math.min(column, newLineLength),
            });
          }
          break;

        case "ArrowLeft":
          e.preventDefault();
          if (column > 0) {
            setPosition({ line, column: column - 1 });
          } else if (line > 0) {
            // Ir al final de la línea anterior
            const newLine = line - 1;
            setPosition({ line: newLine, column: lines[newLine]?.length ?? 0 });
          }
          break;

        case "ArrowRight":
          e.preventDefault();
          if (column < currentLineLength) {
            setPosition({ line, column: column + 1 });
          } else if (line < lines.length - 1) {
            // Ir al inicio de la siguiente línea
            setPosition({ line: line + 1, column: 0 });
          }
          break;

        case "Home":
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            // Ctrl+Home: ir al inicio del documento
            setPosition({ line: 0, column: 0 });
          } else {
            // Home: ir al inicio de la línea
            setPosition({ line, column: 0 });
          }
          break;

        case "End":
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            // Ctrl+End: ir al final del documento
            const lastLine = lines.length - 1;
            setPosition({
              line: lastLine,
              column: lines[lastLine]?.length ?? 0,
            });
          } else {
            // End: ir al final de la línea
            setPosition({ line, column: currentLineLength });
          }
          break;

        case "PageUp":
          e.preventDefault();
          setPosition({ line: Math.max(0, line - 10), column });
          break;

        case "PageDown":
          e.preventDefault();
          setPosition({ line: Math.min(lines.length - 1, line + 10), column });
          break;

        // Soporte básico de edición si está habilitado
        default:
          if (editable && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const newLines = [...lines];
            const currentLine = newLines[line] ?? "";
            newLines[line] =
              currentLine.slice(0, column) + e.key + currentLine.slice(column);
            onContentChange?.(newLines.join("\n"));
            setPosition({ line, column: column + 1 });
          } else if (editable && e.key === "Backspace") {
            e.preventDefault();
            if (column > 0) {
              const newLines = [...lines];
              const currentLine = newLines[line] ?? "";
              newLines[line] =
                currentLine.slice(0, column - 1) + currentLine.slice(column);
              onContentChange?.(newLines.join("\n"));
              setPosition({ line, column: column - 1 });
            } else if (line > 0) {
              const newLines = [...lines];
              const prevLineLength = newLines[line - 1]?.length ?? 0;
              newLines[line - 1] =
                (newLines[line - 1] ?? "") + (newLines[line] ?? "");
              newLines.splice(line, 1);
              onContentChange?.(newLines.join("\n"));
              setPosition({ line: line - 1, column: prevLineLength });
            }
          } else if (editable && e.key === "Enter") {
            e.preventDefault();
            const newLines = [...lines];
            const currentLine = newLines[line] ?? "";
            newLines[line] = currentLine.slice(0, column);
            newLines.splice(line + 1, 0, currentLine.slice(column));
            onContentChange?.(newLines.join("\n"));
            setPosition({ line: line + 1, column: 0 });
          } else if (editable && e.key === "Delete") {
            e.preventDefault();
            const currentLine = lines[line] ?? "";
            if (column < currentLine.length) {
              const newLines = [...lines];
              newLines[line] =
                currentLine.slice(0, column) + currentLine.slice(column + 1);
              onContentChange?.(newLines.join("\n"));
            } else if (line < lines.length - 1) {
              const newLines = [...lines];
              newLines[line] = currentLine + (newLines[line + 1] ?? "");
              newLines.splice(line + 1, 1);
              onContentChange?.(newLines.join("\n"));
            }
          }
          break;
      }
    },
    [position, lines, isFocused, editable, onContentChange, setPosition]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      setIsFocused(true);

      // Buscar el elemento de línea más cercano
      const target = e.target as HTMLElement;
      const lineElement = target.closest("[data-line]");

      if (lineElement) {
        const lineNumber =
          Number.parseInt(lineElement.getAttribute("data-line") ?? "1", 10) - 1;

        // Calcular la columna basada en la posición del click
        const rect = lineElement.getBoundingClientRect();
        const clickX = e.clientX - rect.left;

        // Estimar la columna basada en el ancho de caracteres monoespaciados
        const charWidth = 8.4; // Aproximación para fuente monoespaciada a 14px
        const estimatedColumn = Math.round(clickX / charWidth);
        const lineLength = lines[lineNumber]?.length ?? 0;

        setPosition({
          line: lineNumber,
          column: Math.max(0, Math.min(estimatedColumn, lineLength)),
        });
      }
    },
    [lines, setPosition]
  );

  // Enfocar el contenedor al montar
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.focus();
    }
  }, []);

  return {
    position,
    setPosition,
    containerRef,
    handleKeyDown,
    handleClick,
    lines,
    isFocused,
    setIsFocused,
  };
}
