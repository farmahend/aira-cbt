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

const equationTools = [
  { label: 'Akar √', insert: String.raw`\\(\\sqrt{\\placeholder{}}\\)`, cursor: 13, icon: Radical },
  { label: 'Pangkat n', insert: String.raw`\\(\\placeholder{}^{\\placeholder{}}\\)`, cursor: 13, icon: Superscript },
  { label: 'Pangkat ²', insert: String.raw`\\(x^2\\)`, cursor: 5, icon: Superscript },
  { label: 'Pangkat ³', insert: String.raw`\\(x^3\\)`, cursor: 5, icon: Superscript },
  { label: 'Pecahan', insert: String.raw`\\(\\frac{\\placeholder{}}{\\placeholder{}}\\)`, cursor: 13, icon: Divide },
  { label: 'Indeks', insert: String.raw`\\(x_{\\placeholder{}}\\)`, cursor: 8, icon: Superscript },
  { label: 'π', insert: String.raw`\\(\\pi\\)`, cursor: 4, icon: Pi },
  { label: 'Σ', insert: String.raw`\\(\\sum_{i=1}^{n}\\)`, cursor: 4, icon: Sigma },
  { label: 'Integral ∫', insert: String.raw`\\(\\int_{a}^{b}\\)`, cursor: 4, icon: Sigma },
  { label: '×', insert: String.raw`\\(\\times\\)`, cursor: 4, icon: Parentheses },
  { label: '÷', insert: String.raw`\\(\\div\\)`, cursor: 4, icon: Divide },
  { label: '≤', insert: String.raw`\\(\\leq\\)`, cursor: 4, icon: Parentheses },
  { label: '≥', insert: String.raw`\\(\\geq\\)`, cursor: 4, icon: Parentheses },
  { label: '≠', insert: String.raw`\\(\\neq\\)`, cursor: 4, icon: Parentheses },
  { label: '±', insert: String.raw`\\(\\pm\\)`, cursor: 4, icon: Parentheses },
  { label: 'θ', insert: String.raw`\\(\\theta\\)`, cursor: 4, icon: Pi },
  { label: '°', insert: String.raw`\\(^{\\circ}\\)`, cursor: 4, icon: Pi },
  { label: '∞', insert: String.raw`\\(\\infty\\)`, cursor: 4, icon: Sigma },
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
          {equationTools.map((tool) => {
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
        <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Pratinjau rumus — bentuk matematika</div>
        <MathText text={value || 'Hasil rumus dan teks akan terlihat di sini.'} className="min-h-6 text-sm text-slate-800" />
      </div>
      <p className="text-xs text-slate-500">Klik simbol untuk menyisipkan template rumus. Pratinjau di bawah menampilkan bentuk matematika yang dirender; teks sumber tetap disimpan agar rumus bisa diedit kembali.</p>
    </div>
  );
};
