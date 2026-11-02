import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { serverStatus } from '../services/serverStatus';

export function useServerStatus() {
  const [state, setState] = useState(serverStatus.get());
  useEffect(() => serverStatus.subscribe(setState), []);
  return state;
}

/**
 * Floating pill shown while the backend is waking from sleep, so a slow first
 * request feels intentional rather than broken.
 */
export default function ServerWakeBanner() {
  const { status, pending } = useServerStatus();
  const show = status === 'waking' && pending > 0;

  return (
    <div className="fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[70] flex justify-center px-4 pointer-events-none">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex items-center gap-2.5 pl-3 pr-4 h-10 rounded-full bg-ink text-canvas shadow-lift text-[13px] font-medium"
            role="status"
            aria-live="polite"
          >
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-income animate-ping opacity-60" />
              <span className="relative w-2 h-2 rounded-full bg-income" />
            </span>
            Waking up the server — just a moment…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
