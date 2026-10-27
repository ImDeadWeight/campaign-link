/**
 * @file Themed single-choice dropdown replacing the native <select> (which
 * follows the OS theme).
 */
import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { scrollOptionIntoView, usePopover } from './usePopover.js';
import './select.css';

/** One choice in a Select. */
export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
}

/** Props for Select. */
interface Props<T extends string | number> {
  value: T;
  options: SelectOption<T>[];
  onChange(value: T): void;
  /** Shown when the value matches no option. */
  placeholder?: string;
  disabled?: boolean;
  title?: string;
  className?: string;
}

/** Themed replacement for <select>; the native one follows the OS theme. */
export function Select<T extends string | number>({ value, options, onChange, placeholder, disabled, title, className }: Props<T>) {
  const { anchorRef, popupRef, open, positioned, setOpen, close, style } = usePopover<HTMLButtonElement>();
  const listId = useId();
  const selectedIndex = options.findIndex((o) => o.value === value);
  const [active, setActive] = useState(selectedIndex);

  useEffect(() => {
    if (open) setActive(Math.max(0, selectedIndex));
  }, [open, selectedIndex]);

  useEffect(() => scrollOptionIntoView(popupRef.current, active), [open, active, popupRef, style]);

  // Pick an option, close, and return focus to the button.
  const choose = (i: number) => {
    const opt = options[i];
    if (opt) onChange(opt.value);
    close();
    anchorRef.current?.focus();
  };

  // Keyboard support matching a native select.
  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => (open ? setActive((a) => Math.min(options.length - 1, a + 1)) : setOpen(true)),
      ArrowUp: () => (open ? setActive((a) => Math.max(0, a - 1)) : setOpen(true)),
      Home: () => setActive(0),
      End: () => setActive(options.length - 1),
      Enter: () => (open ? choose(active) : setOpen(true)),
      ' ': () => (open ? choose(active) : setOpen(true)),
      Escape: () => close(),
      Tab: () => close(),
    };
    const action = keys[e.key];
    if (!action) return;
    if (e.key !== 'Tab') e.preventDefault();
    if (e.key === 'Escape' && open) e.stopPropagation();
    action();
  };

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        className={`select-trigger${className ? ` ${className}` : ''}`}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        disabled={disabled}
        title={title}
        onClick={() => setOpen(!open)}
        onKeyDown={onKeyDown}
      >
        <span className={`select-value${selectedIndex < 0 ? ' muted' : ''}`}>
          {options[selectedIndex]?.label ?? placeholder ?? ''}
        </span>
        <ChevronDown size={16} />
      </button>
      {positioned &&
        createPortal(
          <div ref={popupRef} id={listId} role="listbox" className="popup-list" style={style}>
            {options.map((o, i) => (
              <div
                key={String(o.value)}
                data-index={i}
                role="option"
                aria-selected={o.value === value}
                className={`popup-option${i === active ? ' active' : ''}${o.value === value ? ' selected' : ''}`}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
              >
                {o.label}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
