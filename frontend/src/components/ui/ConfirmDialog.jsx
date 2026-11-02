import Sheet from './Sheet';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open, title = 'Are you sure?', message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  danger = false, onConfirm, onCancel,
}) {
  return (
    <Sheet open={open} onClose={onCancel} size="sm">
      <div className="text-center pt-2 pb-2">
        {danger && (
          <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-expense/10 text-expense flex items-center justify-center">
            <AlertTriangle size={22} strokeWidth={1.9} />
          </div>
        )}
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {message && <p className="text-sm text-ink-2 mt-2 leading-relaxed">{message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3 pt-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button className="btn-secondary" onClick={onCancel}>{cancelLabel}</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} autoFocus>
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}
