import React, { useState } from 'react';
import { X, Send, CornerUpLeft } from 'lucide-react';
import { EmailItem } from '../types';

interface ReplyModalProps {
  email: EmailItem;
  isOpen: boolean;
  onClose: () => void;
  onSendReply: (emailId: string, replyText: string) => Promise<void>;
}

export const ReplyModal: React.FC<ReplyModalProps> = ({
  email,
  isOpen,
  onClose,
  onSendReply,
}) => {
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSending(true);
    try {
      await onSendReply(email.id, replyText);
      setReplyText('');
      onClose();
    } catch (err: any) {
      alert('Erro ao enviar resposta: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#131823] border border-slate-200 dark:border-[#1f2737] rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-12 px-4 border-b border-slate-200 dark:border-[#1f2737] flex items-center justify-between bg-slate-50 dark:bg-[#0e121b]">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <CornerUpLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Responder e-mail</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-[#182030] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 w-14">Para:</span>
            <span className="text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-[#0a0d14] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1f2737] flex-1 truncate font-mono text-[11px]">
              {email.fromName} &lt;{email.fromEmail}&gt;
            </span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 w-14">Assunto:</span>
            <span className="text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-[#0a0d14] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1f2737] flex-1 truncate font-medium">
              Re: {email.subject.replace(/^Re:\s*/i, '')}
            </span>
          </div>

          <div className="pt-2">
            <textarea
              required
              rows={6}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Digite sua resposta operacional..."
              className="w-full bg-slate-50 dark:bg-[#0a0d14] border border-slate-300 dark:border-[#1f2737] rounded-lg p-3 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none leading-relaxed transition-colors"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#1f2737]/60">
            <span className="text-[11px] text-slate-500">
              Operação sincronizada diretamente com o Gmail.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#182030] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSending || !replyText.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 text-white dark:text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Enviando...' : 'Enviar resposta'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
