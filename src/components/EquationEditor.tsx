import React, { useRef } from 'react';
import { MathText } from './MathText';
import { Radical, Superscript, Divide, Pi, Parentheses, Sigma } from 'lucide-react';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

const tools = [
  { label: '√ Akar', insert: '√( )', cursor: 3, icon: Radical },
  { label: 'Pangkat ²', insert: '²', cursor: 1, icon: Superscript },
  { label: 'Pangkat ³', insert: '³', cursor: 1, icon: Superscript },
  { label: 'Pangkat n', insert: '^( )', cursor: 2, icon: Superscript },
  { label: 'Pecahan', insert: '( )/( )', cursor: 2, icon: Divide },
  { label: 'π', insert: 'π', cursor: 1, icon: Pi },
  { label: 'Σ', insert: 'Σ', cursor: 1, icon: Sigma },
  { label: 'Integral ∫', insert: '∫', cursor: 1, icon: Sigma },
  { label: '×', insert: '×', cursor: 1, icon: Parentheses },
  { label: '÷', insert: '÷', cursor: 1, icon: Divide },
  { label: '≤', insert: '≤', cursor: 1, icon: Parentheses },
  { label: '≥', insert: '≥', cursor: 1, icon: Parentheses },
  { label: '≠', insert: '≠', cursor: 1, icon: Parentheses },
  { label: '±', insert: '±', cursor: 1, icon: Parentheses },
  { label: 'θ', insert: 'θ', cursor: 1, icon: Pi },
  { label: '°', insert: '°', cursor: 1, icon: Pi },
  { label: '→', insert: '→', cursor: 1, icon: Parentheses },
  { label: '∞', insert: '∞', cursor: 1, icon: Sigma },
];

export const EquationEditor: React.FC<Props> = ({
  label, value, onChange, placeholder, rows = 3, className = ''
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const insert = (snippet: string, cursorOffset: number) => {
    const input = inputRef.current;
    if (!input) {
      onChange(value + snippet);
      return;
    }
    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const next = value.slice(0, start) + snippet + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      input.focus();
      const pos = start + cursorOffset;
      input.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-800">{label}</label>
      <div className="rounded-xl border border-slate-200 bg-white p-2">
        <div className="flex flex-wrap gap-1.5 pb-2" aria-label="Toolbar rumus matematika">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.label}
                type="button"
                title={tool.label}
                onClick={() => insert(tool.insert, tool.cursor)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900"
              >
                <Icon className="h-3.5 w-3.5" />
                {tool.label}
              </button>
            );
          })}
        </div>
        <textarea
          ref={inputRef}
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 ${className}`}
        />
      </div>
      <div className="rounded-lg bg-slate-50 px-3 py-2">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Pratinjau teks matematika</div>
        <MathText text={value || 'Hasil rumus dan teks akan terlihat di sini.'} className="min-h-6 text-sm text-slate-800" />
      </div>
      <p className="text-xs text-slate-500">Klik simbol untuk menyisipkannya di posisi kursor. Simbol ditampilkan langsung, tanpa perlu menulis kode LaTeX.</p>
    </div>
  );
};
