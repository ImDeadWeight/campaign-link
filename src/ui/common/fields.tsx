/**
 * @file Small labelled form inputs shared by editors.
 */
import { useEffect, useState } from 'react';

/** Number input that tolerates a blank/partial value while typing. */
export function NumberInput({ value, onChange, min, max }: { value: number; onChange(n: number): void; min?: number; max?: number }) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    if (Number.parseInt(text, 10) !== value) setText(String(value));
    // Only resync when the stored value changes from outside.
  }, [value]);
  return (
    <input
      type="number"
      value={text}
      min={min}
      max={max}
      onChange={(e) => {
        setText(e.target.value);
        const n = Number.parseInt(e.target.value, 10);
        if (Number.isFinite(n)) onChange(min !== undefined ? Math.max(min, n) : n);
      }}
    />
  );
}

/** Labelled single-line text input. */
export function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange(v: string): void; placeholder?: string }) {
  return (
    <label className="field">
      {label}
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

/** Labelled NumberInput. */
export function NumberField({ label, value, onChange, min }: { label: string; value: number; onChange(n: number): void; min?: number }) {
  return (
    <label className="field">
      {label}
      <NumberInput value={value} onChange={onChange} min={min} />
    </label>
  );
}
