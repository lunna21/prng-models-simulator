import * as React from 'react';
import { cn } from '@/lib/utils';

interface FormattedNumberInputProps
  extends Omit<
    React.ComponentProps<'input'>,
    'type' | 'onChange' | 'value' | 'ref'
  > {
  value: number;
  onChange: (value: number) => void;
}

function formatNum(n: number): string {
  if (n === 0) return '0';
  return n.toLocaleString('es-MX');
}

function parseNum(s: string): number | null {
  const cleaned = s.replace(/\D/g, '');
  if (cleaned === '') return null;
  return Number(cleaned);
}

function findCaretFromDigits(formatted: string, targetDigits: number): number {
  let digits = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      digits++;
      if (digits === targetDigits) return i + 1;
    }
  }
  return formatted.length;
}

const FormattedNumberInput = React.forwardRef<
  HTMLInputElement,
  FormattedNumberInputProps
>(({ className, value, onChange, onBlur, onFocus, ...props }, ref) => {
  const innerRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => innerRef.current!);

  const [showEmpty, setShowEmpty] = React.useState(false);
  const pendingDigits = React.useRef<number | null>(null);

  const displayValue = showEmpty ? '' : formatNum(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (raw === '' || raw.replace(/\D/g, '') === '') {
      setShowEmpty(true);
      onChange(0);
      return;
    }

    setShowEmpty(false);
    const parsed = parseNum(raw);
    if (parsed !== null) {
      onChange(parsed);
      const caretPos = e.target.selectionStart ?? 0;
      const digitsBefore = raw.slice(0, caretPos).replace(/\D/g, '').length;
      pendingDigits.current = digitsBefore;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setShowEmpty(false);
    onBlur?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onFocus?.(e);
    requestAnimationFrame(() => innerRef.current?.select());
  };

  React.useLayoutEffect(() => {
    if (pendingDigits.current !== null && innerRef.current) {
      const formatted = innerRef.current.value;
      const caret = findCaretFromDigits(formatted, pendingDigits.current);
      innerRef.current.setSelectionRange(caret, caret);
      pendingDigits.current = null;
    }
  });

  return (
    <input
      ref={innerRef}
      type="text"
      inputMode="numeric"
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
FormattedNumberInput.displayName = 'FormattedNumberInput';

export { FormattedNumberInput };
