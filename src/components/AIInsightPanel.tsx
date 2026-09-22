import React from 'react';
import { 
  Sparkles, 
  Tag, 
  Layers, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2, 
  Clock, 
  Building2, 
  HelpCircle,
  Scale,
  ExternalLink,
  Mail as MailIcon
} from 'lucide-react';
import { EmailInsight, IUSEscopo } from '../types';

const getScopeDescription = (escopo: IUSEscopo): string => {
  switch (escopo) {
    case 'MA': return 'Meio Ambiente (ISO 14001 / ESG)';
    case 'SSO': return 'Saúde e Segurança Ocupacional (ISO 45001 / NRs)';
    case 'RS': return 'Responsabilidade Social (SA8000 / PR 2030)';
    case 'Q': return 'Qualidade (ISO 9001)';
    case 'ENERGIA': return 'Gestão Energética (ISO 50001 / Tarifas)';
    case 'SA': return 'Segurança de Alimentos (ISO 22000 / ANVISA)';
    case 'SI': return 'Segurança da Informação (ISO 27001 / LGPD)';
    case 'SV': return 'Segurança Viária (ISO 39001)';
    case 'MIN': return 'Direito Minerário (ANM / Barragens)';
    case 'TRAB': return 'Trabalhista (CLT / eSocial / MTE)';
    case 'TRIB': return 'Tributos & Taxas de Polícia (TCFA / TFA)';
    default: return escopo;
  }
};

interface AIInsightPanelProps {
  insight?: EmailInsight;
  category: string;
  isAuthenticated?: boolean;
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({
  insight,
  category,
  isAuthenticated = false,
}) => {
  if (!insight) {
    return (
      <aside className="w-80 bg-slate-50 dark:bg-[#0e121b] flex flex-col justify-between shrink-0 overflow-y-auto border-l border-slate-200 dark:border-[#1f2737] p-4 text-slate-500 dark:text-slate-400 text-xs transition-colors">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-[#1f2737]/60">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold tracking-wider text-slate-900 dark:text-slate-200 uppercase">
            INTELIGÊNCIA
          </span>
        </div>
        <p className="mt-4 text-slate-500 dark:text-slate-400">
          Selecione um e-mail para visualizar a extração de inteligência operacional.
        </p>
      </aside>
    );
  }

  const getPriorityBadge = (p: EmailInsight['prioridade']) => {
    switch (p) {
      case 'Urgente':
        return (
          <span className="font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800/40 text-[10px]">
            Urgente
          </span>
        );
      case 'Alta':
        return (
          <span className="font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40 text-[10px]">
            Alta
          </span>
        );
      case 'Média':
        return (
          <span className="font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800/40 text-[10px]">
            Média
          </span>
        );
      case 'Baixa':
        return (
          <span className="font-medium text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px]">
            Baixa
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'clientes':
        return 'Clientes';
      case 'financeiro':
        return 'Financeiro';
      case 'fornecedores':
        return 'Fornecedores';
      case 'legislacao':
        return 'Legislação';
      default:
        return cat;
    }
  };

  return (
    <aside className="w-80 bg-slate-50 dark:bg-[#0e121b] flex flex-col justify-between shrink-0 overflow-y-auto border-l border-slate-200 dark:border-[#1f2737] select-none text-slate-700 dark:text-slate-300 transition-colors">
      <div className="p-4 space-y-4">
        {/* AI Header Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1f2737]/60">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-wider text-slate-900 dark:text-slate-200 uppercase">
              INTELIGÊNCIA
            </span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
            isAuthenticated 
              ? 'text-emerald-700 dark:text-emerald-400/90 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' 
              : 'text-amber-700 dark:text-amber-400/90 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
          }`}>
            {isAuthenticated ? 'Diretrizes Ativas' : 'Ambiente Demonstrativo'}
          </span>
        </div>

        {/* Section: Resumo */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-200">Resumo</h3>
          <div className="p-2.5 rounded-lg bg-white dark:bg-[#131823] border border-slate-200 dark:border-[#1f2737] text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-xs">
            {insight.resumo}
          </div>
        </div>

        {/* Section: Metadados Estruturados */}
        <div className="space-y-2.5 bg-white dark:bg-[#131823]/60 p-3 rounded-lg border border-slate-200 dark:border-[#1f2737] shadow-xs">
          {/* Categoria */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>Categoria</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-200 uppercase text-[11px]">
              {getCategoryLabel(insight.categoria || category)}
            </span>
          </div>

          {/* Tipo */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>Tipo</span>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px] text-[11px]">
              {insight.tipo}
            </span>
          </div>

          {/* Prioridade */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>Prioridade</span>
            </span>
            <span className="text-[11px]">{getPriorityBadge(insight.prioridade)}</span>
          </div>

          {/* Ação necessária */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>Ação necessária</span>
            </span>
            <span
              className={`font-bold text-[11px] ${
                insight.acaoNecessaria ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {insight.acaoNecessaria ? 'SIM' : 'NÃO'}
            </span>
          </div>

          {insight.acaoDescricao && (
            <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 p-2.5 rounded border border-amber-200 dark:border-amber-500/20 leading-tight">
              {insight.acaoDescricao}
            </div>
          )}

          {/* Prazo */}
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200 dark:border-[#1f2737]/40">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>Prazo</span>
            </span>
            <span
              className={`text-[11px] font-semibold ${
                insight.prazo !== 'Nenhum identificado' ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {insight.prazo}
            </span>
          </div>
        </div>

        {/* Section: Entidades Identificadas */}
        {insight.entidades && insight.entidades.length > 0 && (
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Entidades identificadas</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {insight.entidades.map((ent, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-[#161c28] border border-slate-200 dark:border-[#1f2737] text-[11px] text-slate-700 dark:text-slate-300 font-medium shadow-2xs"
                >
                  {ent}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Section: Diretrizes IUS Natura - Inteligência em Requisitos Legais */}
        {insight.complianceAnalysis && (
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-[#1f2737]/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5" />
                <span>Diretrizes IUS Natura</span>
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-medium">Diretriz Vigente</span>
            </div>

            {/* Status da Aplicabilidade */}
            <div className="p-3 rounded-lg border bg-white dark:bg-[#121824] border-slate-200 dark:border-[#1f2737] space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Enquadramento CAL:</span>
                <div>
                  {insight.complianceAnalysis.aplicabilidade === 'APLICAVEL' && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Aplicável
                    </span>
                  )}
                  {insight.complianceAnalysis.aplicabilidade === 'CAL_EXCLUSAO' && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-slate-500 dark:text-zinc-400" /> CAL de Exclusão
                    </span>
                  )}
                  {insight.complianceAnalysis.aplicabilidade === 'PARA_IUS_NATURA' && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500 dark:text-amber-400" /> Para Ius Natura
                    </span>
                  )}
                  {insight.complianceAnalysis.aplicabilidade === 'AVALIAR_CLIENTE_ATIVO' && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 dark:bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 flex items-center gap-1">
                      <Scale className="w-3 h-3 text-sky-500 dark:text-sky-400" /> Avaliar Cliente Ativo
                    </span>
                  )}
                  {insight.complianceAnalysis.aplicabilidade === 'INFORMATIVO' && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      Informativo
                    </span>
                  )}
                </div>
              </div>

              {/* Escopos IUS */}
              {insight.complianceAnalysis.escopos.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-[#1f2737]/60">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Escopos IUS Mapeados:</span>
                  <div className="flex flex-wrap gap-1">
                    {insight.complianceAnalysis.escopos.map((escopo) => (
                      <span
                        key={escopo}
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-50 dark:bg-[#182232] text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60"
                        title={getScopeDescription(escopo)}
                      >
                        {escopo} - {getScopeDescription(escopo)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Órgão e Esfera */}
              {(insight.complianceAnalysis.orgaoIdentificado || insight.complianceAnalysis.esfera) && (
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-[#1f2737]/40 text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400 dark:text-slate-500">Órgão / Esfera:</span>
                  <span className="font-mono text-[10px] text-slate-800 dark:text-slate-200">
                    {insight.complianceAnalysis.orgaoIdentificado || 'Publicação Legal'} 
                    {insight.complianceAnalysis.esfera ? ` • ${insight.complianceAnalysis.esfera}` : ''}
                  </span>
                </div>
              )}

              {/* Padrão de Referência */}
              {insight.complianceAnalysis.padraoReferencia && (
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-[#1f2737]/40 text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400 dark:text-slate-500">Padrão:</span>
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate max-w-[160px]" title={insight.complianceAnalysis.padraoReferencia}>
                    {insight.complianceAnalysis.padraoReferencia}
                  </span>
                </div>
              )}
            </div>

            {/* Diretriz Operacional */}
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/25 space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                Diretriz Operacional
              </span>
              <p className="text-[11px] text-emerald-900 dark:text-emerald-200/90 leading-relaxed font-medium">
                {insight.complianceAnalysis.diretrizOperacional}
              </p>
            </div>

            {/* Justificativa Técnica */}
            <div className="p-2.5 rounded-lg bg-white dark:bg-[#131823] border border-slate-200 dark:border-[#1f2737] space-y-1 shadow-xs">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Regra Técnica (Documento IUS)
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {insight.complianceAnalysis.justificativa}
              </p>
            </div>

            {/* Ação BD se requer texto integral */}
            {insight.complianceAnalysis.requerAcaoBD && (
              <a
                href={`mailto:BD@iusnatura.com.br?subject=${encodeURIComponent(`Solicitação de Texto Integral - ${insight.complianceAnalysis.orgaoIdentificado || 'Legislação'}`)}&body=${encodeURIComponent(`Olá equipe BD IUS Natura,\n\nSolicito o texto integral da norma regulatória identificada no monitoramento:\n\nAssunto: ${insight.resumo}\nÓrgão: ${insight.complianceAnalysis.orgaoIdentificado || 'Regulatório'}\n\nAtenciosamente,\nEquipe IUS Email Control`)}`}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <MailIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Solicitar Texto ao BD (BD@iusnatura.com.br)</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </a>
            )}
          </div>
        )}

        {/* Section: Por que isso importa? */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-[#1f2737]/60">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Por que isso importa?</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-[#131823]/40 p-2.5 rounded-lg border border-slate-200 dark:border-[#1f2737]/60 shadow-xs">
            {insight.porqueImporta}
          </p>
        </div>
      </div>

      {/* AI Disclaimer Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-[#1f2737] bg-slate-100/70 dark:bg-[#0a0d14]/60">
        <p className="text-[10px] text-slate-500 leading-normal">
          As <span className="text-slate-700 dark:text-slate-400 font-semibold">informações são extraídas e inferidas</span> a partir do conteúdo real do e-mail, sem geração de dados fictícios.
        </p>
      </div>
    </aside>
  );
};
