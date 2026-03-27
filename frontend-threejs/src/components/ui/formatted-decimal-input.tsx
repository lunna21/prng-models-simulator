import * as React from 'react';
import { cn } from '@/lib/utils';

interface FormattedDecimalInputProps
  extends Omit<
    React.ComponentProps<'input'>,
    'type' | 'onChange' | 'value' | 'ref'
  > {
  value: number;
  onChange: (value: number) => void;
  maxDecimals?: number;
}

function formatNum(n: number, maxDecimals: number): string {
  if (n === 0) return '0';
  return n.toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

function sanitizeDecimalInput(raw: string): string {
  const normalized = raw.replace(/,/g, '.');
  let hasDot = false;
  let out = '';

  for (const ch of normalized) {
    if (/\d/.test(ch)) {
      out += ch;
      continue;
    }
    if (ch === '.' && !hasDot) {
      out += ch;
      hasDot = true;
    }
  }

  return out;
}

function clampDecimals(raw: string, maxDecimals: number): string {
  const [intPart, decPart] = raw.split('.');
  if (decPart === undefined) return raw;
  return `${intPart}.${decPart.slice(0, maxDecimals)}`;
}

const FormattedDecimalInput = React.forwardRef<
  HTMLInputElement,
  FormattedDecimalInputProps
>(({ className, value, onChange, onBlur, onFocus, maxDecimals = 2, ...props }, ref) => {
  const innerRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => innerRef.current!);

  const [isFocused, setIsFocused] = React.useState(false);
  const [showEmpty, setShowEmpty] = React.useState(false);
  const [draft, setDraft] = React.useState('');

  const displayValue = isFocused
    ? draft
    : showEmpty
      ? ''
      : formatNum(value, maxDecimals);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = clampDecimals(sanitizeDecimalInput(e.target.value), maxDecimals);

    if (sanitized === '') {
      setDraft('');
      setShowEmpty(true);
      onChange(0);
      return;
    }

    setShowEmpty(false);
    setDraft(sanitized);

    if (sanitized === '.') {
      onChange(0);
      return;
    }

    const parsed = Number(sanitized);
    if (Number.isFinite(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setDraft('');
    setShowEmpty(false);
    onBlur?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setDraft(showEmpty ? '' : String(value));
    onFocus?.(e);
    requestAnimationFrame(() => innerRef.current?.select());
  };

  return (
    <input
      ref={innerRef}
      type="text"
      inputMode="decimal"
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      {...props}
    />
  );
});
FormattedDecimalInput.displayName = 'FormattedDecimalInput';

export { FormattedDecimalInput };
