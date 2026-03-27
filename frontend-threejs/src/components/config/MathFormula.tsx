import { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  tex: string;
  colors?: Record<string, string>;
  displayMode?: boolean;
  className?: string;
}

function applyColors(tex: string, colors: Record<string, string>): string {
  let result = tex;
  for (const [symbol, color] of Object.entries(colors)) {
    const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<![\\w\\\\{])${escaped}(?![\\w}])`, 'g');
    result = result.replace(re, `\\textcolor{${color}}{${symbol}}`);
  }
  return result;
}

export function MathFormula({ tex, colors, displayMode = true, className }: MathFormulaProps) {
  const html = useMemo(() => {
    const finalTex = colors ? applyColors(tex, colors) : tex;
    try {
      return katex.renderToString(finalTex, {
        displayMode,
        throwOnError: true,
        strict: false,
      });
    } catch {
      return `<span class="text-destructive">${tex}</span>`;
    }
  }, [tex, colors, displayMode]);

  const Wrapper = displayMode ? 'div' : 'span';

  return (
    <Wrapper
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
