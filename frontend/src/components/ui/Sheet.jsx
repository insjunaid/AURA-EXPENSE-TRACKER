import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';

export function useIsDesktop(query = '(min-width: 640px)') {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/**
 * Bottom sheet on phones (drag the handle down to dismiss), centred dialog
 * on larger screens. Locks page scroll and closes on Escape.
 */
export default function Sheet({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  const isDesktop = useIsDesktop();
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const width = size === 'sm' ? 'sm:max-w-sm' : size === 'lg' ? 'sm:max-w-xl' : 'sm:max-w-md';

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className={`relative w-full ${width} bg-surface text-ink
              rounded-t-[28px] sm:rounded-[28px] shadow-sheet sm:shadow-lift
              border-t border-line/70 sm:border
              flex flex-col max-h-[92dvh] sm:max-h-[86vh]`}
            initial={isDesktop ? { opacity: 0, scale: 0.96, y: 8 } : { y: '100%' }}
            animate={isDesktop ? { opacity: 1, scale: 1, y: 0 } : { y: 0 }}
            exit={isDesktop ? { opacity: 0, scale: 0.97, y: 4 } : { y: '100%' }}
            transition={isDesktop ? { duration: 0.18, ease: [0.22, 1, 0.36, 1] } : { type: 'spring', damping: 32, stiffness: 340 }}
            drag={isDesktop ? false : 'y'}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose?.();
            }}
          >
            {/* Grab handle (mobile) */}
            <div
              className="sm:hidden pt-3 pb-1 flex justify-center touch-none cursor-grab"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-1.5 rounded-full bg-line" />
            </div>

            {(title || onClose) && (
              <div
                className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-2 sm:pt-6 pb-3 touch-none sm:touch-auto"
                onPointerDown={(e) => !isDesktop && e.target === e.currentTarget && dragControls.start(e)}
              >
                <div className="min-w-0">
                  {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
                  {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
                </div>
                {onClose && (
                  <button onClick={onClose} className="icon-btn -mr-2 -mt-1 w-10 h-10 shrink-0" aria-label="Close">
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 pb-4">
              {children}
            </div>

            {footer && (
              <div className="px-5 sm:px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6 border-t border-line/60 bg-surface rounded-b-[28px]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
