export type EmailPriority = 'p1' | 'p2' | 'p3' | 'p4';

export type EmailCategory = 'clientes' | 'financeiro' | 'fornecedores' | 'legislacao';

export interface EmailAttachment {
  id: string;
  name: string;
  size: string;
  mimeType: string;
  url?: string;
}

export type IUSEscopo = 
  | 'MA'        // Meio Ambiente (ISO 14001, ESG)
  | 'SSO'       // Saúde e Segurança Ocupacional (ISO 45001, NRs)
  | 'RS'        // Responsabilidade Social (SA8000, PR 2030, NBR 16001, ISO 26000)
  | 'Q'         // Qualidade (ISO 9001, foco na atividade-fim)
  | 'ENERGIA'   // Gestão Energética (ISO 50001, ANEEL, Tarifas)
  | 'SA'        // Segurança de Alimentos (ISO 22000, ANVISA, MAPA)
  | 'SI'        // Segurança da Informação (ISO 27001, LGPD, ANPD)
  | 'SV'        // Segurança Viária (ISO 39001, Trânsito, Faixa de Domínio)
  | 'MIN'       // Direito Minerário (Código de Mineração, ANM, PNSB)
  | 'TRAB'      // Trabalhista (CLT, eSocial, MTE)
  | 'TRIB';      // Tributos Aplicáveis a Sistemas de Gestão (Taxas de Poder de Polícia)

export type AplicabilidadeStatus = 
  | 'APLICAVEL'             // Cumpre requisitos para cadastro na CAL do cliente
  | 'CAL_EXCLUSAO'          // Não aplicável conforme regras excludentes oficiais
  | 'PARA_IUS_NATURA'       // Ações de ADI/ADC, MPs ou comunicação interna
  | 'AVALIAR_CLIENTE_ATIVO' // Depende de existir cliente com escopo ou atividade específica
  | 'INFORMATIVO';          // Publicação de consulta pública, comunicado ou neutro

export interface ComplianceAnalysis {
  escopos: IUSEscopo[];
  aplicabilidade: AplicabilidadeStatus;
  statusLabel: string;
  justificativa: string;
  diretrizOperacional: string;
  padraoReferencia: string;
  orgaoIdentificado?: string;
  esfera?: 'Federal (DOU)' | 'Estadual (DOE)' | 'Municipal (DOM)' | 'Regulatória';
  temasChave: string[];
  requerAcaoBD: boolean;
}

export interface EmailInsight {
  resumo: string;
  categoria: EmailCategory;
  tipo: string;
  prioridade: 'Urgente' | 'Alta' | 'Média' | 'Baixa';
  acaoNecessaria: boolean;
  acaoDescricao?: string;
  prazo: string;
  entidades: string[];
  porqueImporta: string;
  isInferido?: boolean;
  complianceAnalysis?: ComplianceAnalysis;
}

export interface EmailItem {
  id: string;
  threadId: string;
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  bodyHtml?: string;
  date: string;
  timestamp: number;
  isRead: boolean;
  isStarred: boolean;
  priority: EmailPriority;
  category: EmailCategory;
  actionRequired: boolean;
  actionLabel?: string;
  statusLabel?: string;
  hasAttachments: boolean;
  attachments: EmailAttachment[];
  insight?: EmailInsight;
  gmailLink?: string;
}

export interface SyncStep {
  id: number;
  title: string;
  description: string;
  status: 'done' | 'current' | 'pending';
  time?: string;
}

export interface SyncProgressState {
  step: number;
  percent: number;
  processedEmails: number;
  totalEmails: number;
  threadsCount: number;
  sendersCount: number;
  analyzedCount: number;
  categoriesCount: {
    clientes: number;
    financeiro: number;
    fornecedores: number;
    legislacao: number;
  };
  prioritiesCount: {
    urgentes: number;
    alta: number;
    pendentes: number;
    aguardando: number;
  };
  status: 'idle' | 'syncing' | 'completed' | 'error';
  currentActivity: string;
  estimatedRemainingTime?: string;
  errorMessage?: string;
  errorType?: 'api_not_enabled' | 'auth_expired' | 'rate_limit' | 'generic';
  activationUrl?: string;
}

export type FilterFolder = 
  | 'inbox' 
  | 'important' 
  | 'urgent' 
  | 'pending' 
  | 'waiting'
  | 'ius_aplicavel'
  | 'ius_exclusao'
  | 'ius_ma'
  | 'ius_sso'
  | 'ius_si'
  | 'ius_trab';

export type AppScreen = 'connect' | 'sync' | 'inbox';

export interface AuthStatus {
  authenticated: boolean;
  hasGoogleCredentials: boolean;
  mode: 'live' | 'mock';
  accountType?: 'personal' | 'enterprise';
  user?: {
    email: string;
    name: string;
    picture?: string;
  };
}
