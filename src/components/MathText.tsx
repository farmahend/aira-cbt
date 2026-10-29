import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      typesetClear?: (elements?: HTMLElement[]) => void;
    };
  }
}

interface MathTextProps {
  text?: string | null;
  className?: string;
}

/**
 * Renders plain text plus MathJax TeX delimiters:
 * inline: \\( ... \\)   display: $$ ... $$ or \\[ ... \\]
 * Keep raw TeX in the stored question; this component only renders it.
 */
export const MathText: React.FC<MathTextProps> = ({ text = '', className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const value = String(text ?? '');

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      const node = containerRef.current;
      if (!node || cancelled) return;
      try {
        if (window.MathJax?.typesetClear) window.MathJax.typesetClear([node]);
        if (window.MathJax?.typesetPromise) await window.MathJax.typesetPromise([node]);
      } catch (error) {
        console.error('MathJax gagal merender rumus:', error);
      }
    };
    void render();
    return () => {
      cancelled = true;
      if (containerRef.current && window.MathJax?.typesetClear) {
        window.MathJax.typesetClear([containerRef.current]);
      }
    };
  }, [value]);

  return <div ref={containerRef} className={`math-text ${className}`}>{value}</div>;
};
