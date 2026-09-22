import React from 'react';
import { 
  Check, 
  Loader2, 
  Mail, 
  MessageSquare, 
  Users, 
  FileText, 
  Sparkles, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Package,
  Scale,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
  Star,
  CornerUpLeft
} from 'lucide-react';
import { SyncProgressState } from '../types';

interface SyncProgressProps {
  syncState: SyncProgressState;
  onContinueInBackground: () => void;
  isAuthenticated?: boolean;
  onRetry?: () => void;
}

export const SyncProgress: React.FC<SyncProgressProps> = ({
  syncState,
  onContinueInBackground,
  isAuthenticated = false,
  onRetry,
}) => {
  const steps = [
    {
      id: 1,
      title: isAuthenticated ? 'Conectado ao Gmail' : 'Modo Demonstração Corporativo',
      desc: isAuthenticated 
        ? 'Autenticação Google OAuth realizada com sucesso.' 
        : 'Simulação corporativa para homologação operacional das diretrizes.',
    },
    {
      id: 2,
      title: 'E-mails encontrados',
      desc: `${syncState.totalEmails.toLocaleString('pt-BR')} mensagens detectadas para sincronização prioritária.`,
    },
    {
      id: 3,
      title: 'Conversas identificadas',
      desc: `${syncState.threadsCount.toLocaleString('pt-BR')} conversas agrupadas em tópicos.`,
    },
    {
      id: 4,
      title: 'Remetentes mapeados',
      desc: `${syncState.sendersCount.toLocaleString('pt-BR')} remetentes e empresas identificados.`,
    },
    {
      id: 5,
      title: 'Analisando conteúdo e contexto com IA',
      desc: 'Processando mensagens e extraindo inteligência factual.',
    },
    {
      id: 6,
      title: 'Classificando prioridades operacionais',
      desc: 'Identificando urgências, prazos e ações necessárias.',
    },
    {
      id: 7,
      title: 'Identificando ações e prazos',
      desc: 'Finalizando análise inteligente e estruturação da caixa.',
    },
  ];

  // Circumference for r=64 is 2 * PI * 64 = 402.12
  const circumference = 402.12;
  const strokeOffset = circumference - (circumference * syncState.percent) / 100;

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50 dark:bg-[#080b10] text-slate-800 dark:text-slate-200 transition-colors">
      {/* Left / Center Main Progress Content */}
      <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {/* Title Section */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-0.5 w-4 bg-emerald-500 rounded-full"></span>
            <span className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-500 uppercase">
              Sincronização
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {syncState.status === 'completed' ? (
              <>Sua <span className="text-emerald-600 dark:text-emerald-400">caixa de entrada</span> está pronta</>
            ) : syncState.status === 'error' ? (
              <>Atenção na <span className="text-rose-600 dark:text-rose-400">sincronização</span></>
            ) : (
              <>Conhecendo sua <span className="text-emerald-600 dark:text-emerald-400">caixa de entrada</span></>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {syncState.status === 'completed'
              ? 'Todos os seus e-mails foram analisados, categorizados e priorizados com sucesso.'
              : syncState.status === 'error'
              ? 'Identificamos uma pendência para concluir a sincronização da sua caixa de entrada.'
              : 'Estamos sincronizando seus e-mails e criando uma visão inteligente da sua comunicação.'}
          </p>
        </div>

        {/* Live Operational Status Banner */}
        {syncState.currentActivity && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-[#0e141f] border border-slate-200 dark:border-[#182232] shadow-xs">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {syncState.status === 'syncing' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                syncState.status === 'syncing'
                  ? 'bg-emerald-500'
                  : syncState.status === 'completed'
                  ? 'bg-emerald-400'
                  : syncState.status === 'error'
                  ? 'bg-rose-500'
                  : 'bg-slate-500'
              }`}></span>
            </span>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                {syncState.currentActivity}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded font-mono shrink-0 bg-emerald-50 dark:bg-[#141d2c] text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                {syncState.status === 'completed'
                  ? '100% CONCLUÍDO'
                  : syncState.status === 'syncing'
                  ? `ETAPA ${syncState.step}/7`
                  : syncState.status === 'error'
                  ? 'PENDÊNCIA'
                  : 'AGUARDANDO'}
              </span>
            </div>
          </div>
        )}

        {/* Error Alert Box if status === error */}
        {syncState.status === 'error' && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-5 space-y-3.5 shadow-sm dark:shadow-lg">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  {syncState.errorType === 'api_not_enabled'
                    ? 'Gmail API não está ativada no Google Cloud'
                    : syncState.errorType === 'auth_expired'
                    ? 'Sessão Google Expirada'
                    : 'Falha durante a sincronização'}
                </h2>
                <p className="text-xs text-rose-700 dark:text-rose-300/90 mt-1 leading-relaxed">
                  {syncState.errorMessage || 'Não foi possível completar a conexão com o Gmail.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 pl-12">
              {syncState.activationUrl && (
                <a
                  href={syncState.activationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-rose-600 hover:bg-rose-500 text-white dark:bg-rose-500 dark:hover:bg-rose-400 dark:text-slate-950 font-bold px-4 py-2 rounded-lg text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>Ativar Gmail API no Google Cloud</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 dark:bg-[#182232] dark:hover:bg-[#202d42] dark:text-slate-200 dark:border-[#2a3a52] font-semibold px-4 py-2 rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tentar Novamente</span>
                </button>
              )}
              <button
                onClick={onContinueInBackground}
                className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-2 cursor-pointer transition-colors"
              >
                Continuar para a Central mesmo assim
              </button>
            </div>
          </div>
        )}

        {/* Completion Banner if status === completed */}
        {syncState.status === 'completed' && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Sincronização 100% Concluída</h3>
                <p className="text-xs text-emerald-700 dark:text-slate-400">
                  {syncState.processedEmails.toLocaleString('pt-BR')} e-mails sincronizados e organizados na sua caixa.
                </p>
              </div>
            </div>
            <button
              onClick={onContinueInBackground}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 font-bold px-5 py-2 rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Acessar Central de E-mail</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Circular Gauge & Progression Checklist */}
        <div className="flex flex-col lg:flex-row items-center gap-8 py-2 bg-white dark:bg-[#0e141f]/40 p-6 rounded-2xl border border-slate-200 dark:border-[#182232] shadow-xs">
          {/* Circular Progress Gauge */}
          <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="64"
                fill="none"
                stroke="currentColor"
                strokeWidth="11"
                className="text-slate-200 dark:text-[#121b27]"
              />
              <circle
                cx="80"
                cy="80"
                r="64"
                fill="none"
                stroke="#10b981"
                strokeWidth="11"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="filter drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none tnum">
                {syncState.percent}%
              </span>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-2 tnum">
                {syncState.processedEmails.toLocaleString('pt-BR')} de {syncState.totalEmails.toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">e-mails processados</span>
            </div>
          </div>

          {/* Steps Progression Checklist */}
          <div className="flex-1 w-full space-y-2.5">
            {steps.map((s) => {
              const isDone = s.id < syncState.step || (s.id === 7 && syncState.percent === 100);
              const isCurrent = s.id === syncState.step && syncState.percent < 100;
              const isPending = s.id > syncState.step && syncState.percent < 100;

              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                    isCurrent
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30'
                      : isDone
                      ? 'bg-slate-50 dark:bg-[#101724]/60 border-slate-200 dark:border-[#182333]'
                      : 'bg-white dark:bg-[#0c1017]/40 border-slate-200 dark:border-[#141b26]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isDone && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                    {isCurrent && (
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </span>
                    )}
                    {isPending && (
                      <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700"></span>
                    )}

                    <span
                      className={`font-medium ${
                        isCurrent
                          ? 'text-emerald-800 dark:text-emerald-300 font-semibold'
                          : isDone
                          ? 'text-slate-900 dark:text-slate-200'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {s.title}
                    </span>
                    <span className="text-slate-500 dark:text-slate-500 hidden sm:inline text-[11px]">
                      — {s.desc}
                    </span>
                  </div>
                  <div className="shrink-0 font-mono">
                    {isDone ? (
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                        Concluído
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/40 animate-pulse">
                        Em andamento
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        Pendente
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metric Counter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Card 1 */}
          <div className="bg-white dark:bg-[#0e141f] border border-slate-200 dark:border-[#182232] rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
            <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-2" />
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white tnum">
                {syncState.totalEmails.toLocaleString('pt-BR')}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Total de e-mails</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-[#0e141f] border border-slate-200 dark:border-[#182232] rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-2" />
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white tnum">
                {syncState.threadsCount.toLocaleString('pt-BR')}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Conversas agrupadas</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-[#0e141f] border border-slate-200 dark:border-[#182232] rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-2" />
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white tnum">
                {syncState.sendersCount.toLocaleString('pt-BR')}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Remetentes identificados</div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-[#0e141f] border border-slate-200 dark:border-[#182232] rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-2" />
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white tnum">
                {syncState.analyzedCount.toLocaleString('pt-BR')}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Mensagens analisadas</div>
            </div>
          </div>
        </div>

        {/* Intelligence Breakdown Panel */}
        <div className="bg-white dark:bg-[#0e141f] border border-slate-200 dark:border-[#182232] rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                Inteligência
              </span>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Entendendo sua comunicação</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nossa IA está analisando o conteúdo dos seus e-mails para identificar o que realmente importa sem inventar dados.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-2 border-t border-slate-100 dark:border-[#17212f]">
            {/* Left: Categorias Identificadas (Clientes, Financeiro, Fornecedores, Legislação) */}
            <div>
              <h3 className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-3">
                Categorias Identificadas
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    <span>Clientes</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-300 font-semibold tnum">
                    {syncState.categoriesCount.clientes.toLocaleString('pt-BR')}
                  </span>
                </li>
                <li className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <CreditCard className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Financeiro</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-300 font-semibold tnum">
                    {syncState.categoriesCount.financeiro.toLocaleString('pt-BR')}
                  </span>
                </li>
                <li className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Package className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    <span>Fornecedores</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-300 font-semibold tnum">
                    {syncState.categoriesCount.fornecedores.toLocaleString('pt-BR')}
                  </span>
                </li>
                <li className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Scale className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Legislação</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-300 font-semibold tnum">
                    {syncState.categoriesCount.legislacao.toLocaleString('pt-BR')}
                  </span>
                </li>
              </ul>
            </div>

            {/* Right: Prioridades em Análise (Urgentes, Alta prioridade, Pendentes, Aguardando resposta) */}
            <div>
              <h3 className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-3">
                Prioridades em Análise
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Urgentes</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold tnum">{syncState.prioritiesCount.urgentes}</span>
                </li>
                <li className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 shrink-0" />
                    <span>Alta prioridade</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold tnum">{syncState.prioritiesCount.alta}</span>
                </li>
                <li className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Pendentes</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold tnum">{syncState.prioritiesCount.pendentes}</span>
                </li>
                <li className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <CornerUpLeft className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>Aguardando resposta</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold tnum">{syncState.prioritiesCount.aguardando}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Tempo estimado: {syncState.estimatedRemainingTime || 'Em andamento'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                O tempo varia de acordo com o volume da sua caixa de entrada empresarial.
              </div>
            </div>
          </div>

          {/* Continuar em segundo plano button */}
          <div className="flex flex-col items-end">
            <button
              onClick={onContinueInBackground}
              className="bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-semibold px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Continuar em segundo plano</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <span className="text-[10px] text-slate-500 mt-1.5">
              Você pode operar a Central de E-mail enquanto a sincronização conclui.
            </span>
          </div>
        </div>
      </main>

      {/* Right Feature Graphic Showcase */}
      <aside className="w-80 bg-slate-50 dark:bg-[#0a0f17] border-l border-slate-200 dark:border-[#151c27] flex flex-col justify-between p-7 relative overflow-hidden hidden xl:flex transition-colors">
        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -left-12 w-48 h-48 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* 3D Glass Envelopes */}
        <div className="relative w-full h-64 flex items-center justify-center my-4">
          <div className="absolute transform rotate-[18deg] translate-x-8 -translate-y-4 w-36 h-28 rounded-2xl bg-emerald-100/70 border border-emerald-300/40 dark:bg-emerald-950/30 dark:border-emerald-500/20 backdrop-blur-md opacity-40 shadow-xl transition-colors"></div>
          <div className="absolute transform rotate-[12deg] translate-x-3 -translate-y-2 w-40 h-32 rounded-2xl bg-emerald-200/60 border border-emerald-400/40 dark:bg-emerald-900/30 dark:border-emerald-400/30 backdrop-blur-md opacity-70 shadow-xl transition-colors"></div>
          <div className="relative transform rotate-[5deg] w-44 h-36 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-950/70 dark:to-[#0d1622]/90 border border-emerald-400/50 backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.25)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)] flex items-center justify-center glow-effect transition-colors">
            <Mail className="w-14 h-14 text-white dark:text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
          </div>
        </div>

        {/* Promotional Copy */}
        <div className="space-y-2.5 z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            Mais que e-mails,<br />
            <span className="text-emerald-600 dark:text-emerald-400">inteligência para<br />o seu dia a dia.</span>
          </h2>
          <div className="h-0.5 w-6 bg-emerald-500 rounded my-2"></div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            O Email Control analisa, organiza e prioriza sua comunicação para que você foque no que realmente gera resultados operacionais.
          </p>
        </div>

        {/* Security Badge Box */}
        <div className="bg-white dark:bg-[#0e1520]/80 border border-slate-200 dark:border-[#1b2636] rounded-xl p-3.5 flex items-center gap-3.5 z-10 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#141e2d] border border-slate-200 dark:border-[#223043] flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-200">Seus dados estão seguros</div>
            <div className="text-[10px] text-slate-500 leading-tight">
              Conexão oficial e criptografada com o Google.
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
