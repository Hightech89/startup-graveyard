"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "success" | "error";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

const DISMISS_MS = 2800;

const ToastContext = createContext<
  ((message: string, variant?: ToastVariant) => void) | null
>(null);

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = nextId();
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, DISMISS_MS);
    },
    [],
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(100%-1.5rem,22rem)] flex-col gap-2 sm:bottom-6 sm:right-6"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={[
              "toast-enter pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-[0_12px_40px_-12px_rgba(0,0,0,0.85)] backdrop-blur-sm",
              t.variant === "success"
                ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-100"
                : "border-red-500/40 bg-red-500/10 text-red-100",
            ].join(" ")}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

/** Map Supabase Auth errors to friendly copy (never show raw messages in UI). */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("invalid login credentials") ||
    m.includes("invalid email or password")
  ) {
    return "Email or password is incorrect.";
  }
  if (m.includes("email not confirmed") || m.includes("not confirmed")) {
    return "Please confirm your email before signing in.";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "An account with this email already exists.";
  }
  if (m.includes("password") && m.includes("least")) {
    return "Password does not meet requirements.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Connection problem. Check your network and try again.";
  }
  return "Something went wrong. Try again.";
}
