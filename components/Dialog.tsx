"use client";

import { useState, useEffect } from "react";

type DialogProps = {
  open: boolean;
  title: string;
  message?: string;
  // If provided, shows a text input seeded with this value
  inputDefault?: string | null;
  inputPlaceholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: (value: string) => void;
  onCancel: () => void;
};

export function Dialog({
  open,
  title,
  message,
  inputDefault,
  inputPlaceholder,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: DialogProps) {
  const [value, setValue] = useState(inputDefault ?? "");
  const hasInput = inputDefault !== undefined && inputDefault !== null;

  // Re-seed the input each time the dialog opens
  useEffect(() => {
    if (open) setValue(inputDefault ?? "");
  }, [open, inputDefault]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center">
      <div className="w-full max-w-sm rounded-t-2xl bg-cream p-6 sm:rounded-2xl">
        <h2 className="font-serif text-xl text-ink">{title}</h2>
        {message && <p className="mt-2 text-sm text-stone">{message}</p>}

        {hasInput && (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && value.trim()) onConfirm(value.trim());
              if (e.key === "Escape") onCancel();
            }}
            placeholder={inputPlaceholder}
            className="mt-4 w-full border-b border-stone-light bg-transparent pb-2 text-ink placeholder:text-stone outline-none focus:border-ink"
          />
        )}

        <div className="mt-6 flex items-center justify-end gap-5">
          <button
            onClick={onCancel}
            className="text-xs uppercase tracking-wide text-stone hover:text-ink"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => onConfirm(value.trim())}
            disabled={hasInput && !value.trim()}
            className={`text-xs uppercase tracking-wide underline underline-offset-4 disabled:text-stone disabled:no-underline ${
              destructive ? "text-red-700 hover:text-red-800" : "text-ink hover:text-ink-soft"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}