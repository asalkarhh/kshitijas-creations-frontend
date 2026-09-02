import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface ToastItem {
  id: number;
  message: string;
  tone: 'success' | 'info' | 'error';
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastItem['tone']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastItem['tone'] = 'success') => {
      const id = Date.now();
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-atomic="true"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2"
      >
        {toasts.map((toast) => (
          <div
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-xl"
            key={toast.id}
            role="status"
          >
            {toast.tone === 'success' ? (
              <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-emerald-400" />
            ) : toast.tone === 'error' ? (
              <AlertCircle aria-hidden="true" className="size-5 shrink-0 text-rose-400" />
            ) : (
              <Info aria-hidden="true" className="size-5 shrink-0 text-rose" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              aria-label="Dismiss notification"
              className="rounded-full p-1 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose"
              onClick={() => dismiss(toast.id)}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
