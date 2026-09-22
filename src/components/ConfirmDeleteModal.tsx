import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemTitle?: string;
  isCalendarSynced?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  message,
  itemTitle,
  isCalendarSynced,
  onConfirm,
  onClose,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl relative"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 id="confirm-dialog-title" className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {itemTitle && (
            <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Rencana yang dipilih:</span>
              <span className="text-slate-900 font-extrabold text-sm block mt-0.5">{itemTitle}</span>
              {isCalendarSynced && (
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-600">
                  ⚠️ Acara ini juga akan dihapus dari akun Google Calendar Anda.
                </span>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="py-2.5 px-4 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              Batalkan
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isLoading ? 'Menghapus...' : 'Ya, Hapus Rencana'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
