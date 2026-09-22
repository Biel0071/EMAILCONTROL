import React from 'react';
import { Paperclip, Star, RefreshCw, Mail, Loader2 } from 'lucide-react';
import { EmailItem } from '../types';

interface InboxListProps {
  emails: EmailItem[];
  selectedEmailId: string | null;
  onSelectEmail: (email: EmailItem) => void;
  onToggleStar: (id: string, currentStarred: boolean) => void;
  filterLabel: string;
  isSyncing?: boolean;
  onRefreshSync?: () => void;
}

export const InboxList: React.FC<InboxListProps> = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  onToggleStar,
  filterLabel,
  isSyncing = false,
  onRefreshSync,
}) => {
  const getCategoryBadge = (category: EmailItem['category']) => {
    switch (category) {
      case 'clientes':
        return (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 shrink-0">
            Clientes
          </span>
        );
      case 'financeiro':
        return (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 shrink-0">
            Financeiro
          </span>
        );
      case 'fornecedores':
        return (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 shrink-0">
            Fornecedores
          </span>
        );
      case 'legislacao':
        return (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50 shrink-0">
            Legislação
          </span>
        );
    }
  };

  const getPriorityStripe = (priority: EmailItem['priority']) => {
    switch (priority) {
      case 'p1':
        return 'border-l-rose-500';
      case 'p2':
        return 'border-l-amber-500';
      case 'p3':
        return 'border-l-emerald-500';
      case 'p4':
      default:
        return 'border-l-transparent';
    }
  };

  const getAvatarInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name.slice(0, 2) || 'GC').toUpperCase();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#080b10] select-none text-slate-700 dark:text-slate-300 overflow-hidden transition-colors">
      {/* Top Header of List */}
      <div className="h-12 border-b border-slate-200 dark:border-[#1f2737] px-4 flex items-center justify-between shrink-0 bg-slate-50/90 dark:bg-[#0e121b] transition-colors">
        <div className="flex items-baseline gap-2 min-w-0">
          <h1 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider truncate">
            {filterLabel}
          </h1>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium tnum">
            ({emails.length})
          </span>
        </div>

        {onRefreshSync && (
          <button
            onClick={onRefreshSync}
            disabled={isSyncing}
            className="p-1 rounded text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#182030] transition-colors cursor-pointer"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
          </button>
        )}
      </div>

      {/* Email List Items Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1f2737]/40">
        {isSyncing && emails.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Sincronizando com o Gmail...</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                Conectando à sua conta e mapeando mensagens com inteligência artificial.
              </p>
            </div>
          </div>
        ) : emails.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#131823] border border-slate-200 dark:border-[#1f2737] flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Mail className="w-5 h-5 opacity-60" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nenhum e-mail nesta pasta</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                Sua caixa de entrada está organizada ou não há mensagens para o filtro atual.
              </p>
            </div>
            {onRefreshSync && (
              <button
                onClick={onRefreshSync}
                className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Sincronizar Novamente
              </button>
            )}
          </div>
        ) : (
          emails.map((email) => {
            const isSelected = email.id === selectedEmailId;
            const priorityBorder = getPriorityStripe(email.priority);

            return (
              <article
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={`p-3 border-l-[3px] transition-colors cursor-pointer relative ${priorityBorder} ${
                  isSelected
                    ? 'bg-emerald-50/70 dark:bg-[#131823] text-slate-900 dark:text-slate-100 ring-1 ring-inset ring-emerald-500/30 dark:ring-emerald-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50/80 dark:bg-[#080b10] dark:hover:bg-[#0e121b] text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Star Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar(email.id, email.isStarred);
                    }}
                    className="mt-0.5 text-slate-300 dark:text-slate-600 hover:text-amber-500 dark:hover:text-amber-400 transition-colors p-0.5 cursor-pointer"
                    title={email.isStarred ? 'Remover favorito' : 'Favoritar'}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        email.isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>

                  {/* Avatar Initials + Unread dot */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#131823] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1f2737] flex items-center justify-center text-[10px] font-bold">
                      {getAvatarInitials(email.fromName)}
                    </div>
                    {!email.isRead && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#080b10]"></span>
                    )}
                  </div>

                  {/* Middle Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-xs truncate ${
                          !email.isRead 
                            ? 'font-bold text-slate-950 dark:text-slate-100' 
                            : 'font-medium text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {email.fromName}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {email.hasAttachments && (
                          <Paperclip className="w-3 h-3 text-slate-400" />
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tnum">
                          {email.date}
                        </span>
                      </div>
                    </div>

                    {/* Subject line (dedicated row for clean scanning) */}
                    <h2
                      className={`text-xs truncate block mb-1 ${
                        !email.isRead 
                          ? 'font-bold text-slate-950 dark:text-slate-100' 
                          : 'font-medium text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {email.subject}
                    </h2>

                    {/* Metadata Badges Bar */}
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      {getCategoryBadge(email.category)}
                      {email.insight?.complianceAnalysis?.aplicabilidade === 'APLICAVEL' && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60 shrink-0 flex items-center gap-1">
                          CAL Aplicável
                          {email.insight.complianceAnalysis.escopos.length > 0 && (
                            <span className="font-mono text-[8px] text-emerald-700 dark:text-emerald-300">
                              ({email.insight.complianceAnalysis.escopos.slice(0, 2).join(',')})
                            </span>
                          )}
                        </span>
                      )}
                      {email.insight?.complianceAnalysis?.aplicabilidade === 'CAL_EXCLUSAO' && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700 shrink-0">
                          CAL Exclusão
                        </span>
                      )}
                      {email.insight?.complianceAnalysis?.aplicabilidade === 'PARA_IUS_NATURA' && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60 shrink-0">
                          Para Ius Natura
                        </span>
                      )}
                      {email.actionRequired && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 shrink-0">
                          Ação necessária
                        </span>
                      )}
                    </div>

                    {/* Short Snippet */}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                      {email.snippet}
                    </p>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
