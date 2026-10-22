import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  position?: 'center' | 'right';
}

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export const Modal = ({ isOpen, onClose, title, children, position = 'center' }: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(focusableSelector)?.focus();
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    (
    <div
      className={`fixed inset-0 z-50 flex bg-ink/45 p-4 backdrop-blur-sm ${
        position === 'right' ? 'justify-end p-0' : 'items-center justify-center'
      }`}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        aria-labelledby="modal-title"
        aria-modal="true"
        className={`max-h-full overflow-auto bg-surface shadow-2xl ${
          position === 'right'
            ? 'h-full w-[min(88vw,24rem)] rounded-l-3xl p-6'
            : 'w-full max-w-lg rounded-3xl p-6 sm:p-8'
        }`}
        ref={panelRef}
        role="dialog"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-ink" id="modal-title">
            {title}
          </h2>
          <button
            aria-label={`Close ${title}`}
            className="grid size-11 shrink-0 place-items-center rounded-full text-maroon hover:bg-rose/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
    ),
    document.body,
  );
};
