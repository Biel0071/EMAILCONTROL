import { EmailItem, SyncProgressState } from '../types';

export const MOCK_EMAILS: EmailItem[] = [
  {
    id: 'msg-1',
    threadId: 'th-1',
    fromName: 'Débora Xavier',
    fromEmail: 'deboraxavier@iusnatura.com.br',
    to: 'empresa@dominio.com.br',
    subject: 'Leis Municipais disponibilizadas no portal LeisMunicipais',
    snippet: 'Olá, Informamos que foram disponibilizadas novas publicações legislativas no portal LeisMunicipais, referentes aos municípios monitorados em sua base de interesse...',
    body: `Olá,

Informamos que foram disponibilizadas novas publicações legislativas no portal LeisMunicipais, referentes aos municípios monitorados em sua base de interesse.

Foram catalogados 12 novos atos normativos de relevância ambiental, sanitária e de zoneamento urbano. Acesse o portal para conferir o conteúdo consolidado e avaliar eventuais impactos operacionais.

Atenciosamente,
Débora Xavier
IUS Natura — Equipe de Monitoramento Legislativo`,
    date: '10:15',
    timestamp: Date.now() - 1000 * 60 * 25,
    isRead: false,
    isStarred: true,
    priority: 'p2',
    category: 'legislacao',
    actionRequired: false,
    actionLabel: undefined,
    statusLabel: 'Relevante',
    hasAttachments: true,
    attachments: [
      {
        id: 'att-1',
        name: 'Leis_Municipais_1409.pdf',
        size: '1,2 MB',
        mimeType: 'application/pdf'
      }
    ],
    insight: {
      resumo: 'Esta mensagem é uma notificação automática de monitoramento legislativo.',
      categoria: 'legislacao',
      tipo: 'Monitoramento automático',
      prioridade: 'Alta',
      acaoNecessaria: false,
      prazo: 'Nenhum identificado',
      entidades: ['IUS Natura', 'Leis Municipais', 'Legislação', 'Municípios'],
      porqueImporta: 'Novas publicações legislativas foram identificadas. O sistema relaciona o conteúdo às áreas e normas monitoradas pela sua empresa.',
      complianceAnalysis: {
        escopos: ['MA'],
        aplicabilidade: 'APLICAVEL',
        statusLabel: 'Legislação Aplicável (Meio Ambiente)',
        justificativa: 'Identificada norma relacionada à proteção ambiental e zoneamento urbano municipal. Conforme o Guia IUS, o escopo de MA deve ser identificado para unidades territoriais ativas.',
        diretrizOperacional: 'Cadastrar na CAL de Meio Ambiente e verificar alterações em licenças e monitoramentos operacionais.',
        padraoReferencia: 'ISO 14001:2015 / Guia IUS Requisitos de Meio Ambiente',
        orgaoIdentificado: 'Poder Executivo / Legislativo Municipal',
        esfera: 'Municipal (DOM)',
        temasChave: ['Gestão Ambiental', 'Controle Operacional', 'Leis Municipais'],
        requerAcaoBD: false,
      }
    },
    gmailLink: 'https://mail.google.com/mail/u/0/#inbox/msg-1'
  },
  {
    id: 'msg-2',
    threadId: 'th-2',
    fromName: 'Cliente Horizonte',
    fromEmail: 'contato@clientehorizonte.com.br',
    to: 'empresa@dominio.com.br',
    subject: 'Re: Pedido de orçamento',
    snippet: 'Precisamos confirmar o prazo de entrega e as condições do pedido. Você consegue nos enviar a previsão atualizada? Aguardo retorno.',
    body: `Prezada equipe,

Precisamos confirmar com urgência o prazo final de entrega e as condições contratuais do pedido de consultoria ambiental #4928.

A diretoria precisa deliberar até o final do expediente de hoje para liberação da ordem de serviço. Você consegue nos enviar a previsão atualizada?

Fico no aguardo do retorno com prioridade.

Cordialmente,
Roberto Alencar
Diretoria de Operações — Cliente Horizonte`,
    date: '10:42',
    timestamp: Date.now() - 1000 * 60 * 60,
    isRead: false,
    isStarred: false,
    priority: 'p1',
    category: 'clientes',
    actionRequired: true,
    actionLabel: 'Ação necessária',
    statusLabel: 'Pendente resposta',
    hasAttachments: false,
    attachments: [],
    insight: {
      resumo: 'Solicitação urgente de confirmação de prazos e condições comerciais para deliberação de diretoria.',
      categoria: 'clientes',
      tipo: 'Proposta Comercial / SLA',
      prioridade: 'Urgente',
      acaoNecessaria: true,
      acaoDescricao: 'Enviar proposta revisada com cronograma de entrega antes das 18h.',
      prazo: 'Hoje até o fim do expediente',
      entidades: ['Cliente Horizonte', 'Roberto Alencar', 'Pedido #4928'],
      porqueImporta: 'Contrato prioritário aguardando validação de cronograma para emissão de ordem de compra.'
    },
    gmailLink: 'https://mail.google.com/mail/u/0/#inbox/msg-2'
  },
  {
    id: 'msg-3',
    threadId: 'th-3',
    fromName: 'Fornecedor ABC',
    fromEmail: 'fiscal@fornecedorabc.ind.br',
    to: 'empresa@dominio.com.br',
    subject: 'Nota fiscal disponível — Pedido #28491',
    snippet: 'Documento fiscal referente ao pedido #28491. Segue em anexo o arquivo XML e DANFE...',
    body: `Prezado cliente,

Encaminhamos anexa a Nota Fiscal Eletrônica nº 84.921 (Série 1) referente ao fornecimento de equipamentos laboratoriais do Pedido de Compra nº 28491.

Vencimento da fatura: 25/09/2026.
Chave de Acesso: 3126 0904 9281 9200 0184 5500 1000 0849 2110 9382 1094

Solicitamos confirmação de recebimento para liberação da remessa.

Atenciosamente,
Departamento Fiscal — Fornecedor ABC S/A`,
    date: '09:31',
    timestamp: Date.now() - 1000 * 60 * 120,
    isRead: true,
    isStarred: false,
    priority: 'p3',
    category: 'fornecedores',
    actionRequired: false,
    statusLabel: 'Faturamento',
    hasAttachments: true,
    attachments: [
      {
        id: 'att-2',
        name: 'DANFE_NF84921.pdf',
        size: '480 KB',
        mimeType: 'application/pdf'
      },
      {
        id: 'att-3',
        name: 'NFe_31260904928192.xml',
        size: '18 KB',
        mimeType: 'application/xml'
      }
    ],
    insight: {
      resumo: 'Fatura e DANFE relativos à entrega do pedido #28491 emitidos com vencimento em 25/09.',
      categoria: 'fornecedores',
      tipo: 'Documento Fiscal',
      prioridade: 'Média',
      acaoNecessaria: false,
      prazo: '25/09/2026 (vencimento boleto)',
      entidades: ['Fornecedor ABC S/A', 'NF 84.921', 'Pedido #28491'],
      porqueImporta: 'O documento comprova regularidade fiscal da remessa e define o prazo para liquidação financeira.'
    },
    gmailLink: 'https://mail.google.com/mail/u/0/#inbox/msg-3'
  },
  {
    id: 'msg-4',
    threadId: 'th-4',
    fromName: 'Receita Federal',
    fromEmail: 'notificacoes@rfb.gov.br',
    to: 'empresa@dominio.com.br',
    subject: 'Notificação de regularidade fiscal — Caixa Postal Eletrônica',
    snippet: 'Acesse o portal e-CAC e verifique o comprovante de processamento da declaração...',
    body: `Prezado Contribuinte,

Consta nova mensagem em sua Caixa Postal Eletrônica (DTE) no portal e-CAC da Receita Federal do Brasil.

Assunto: Processamento com êxito da Declaração de Regularidade e Certidão Positiva com Efeitos de Negativa.
Data de disponibilização: 18/09/2026.

Recomendamos o download do relatório oficial para arquivamento no dossiê de compliance da empresa.

Secretaria Especial da Receita Federal do Brasil`,
    date: '09:17',
    timestamp: Date.now() - 1000 * 60 * 180,
    isRead: true,
    isStarred: false,
    priority: 'p3',
    category: 'financeiro',
    actionRequired: false,
    statusLabel: 'Regularidade',
    hasAttachments: false,
    attachments: [],
    insight: {
      resumo: 'Aviso institucional de processamento de declaração fiscal no portal oficial do e-CAC.',
      categoria: 'financeiro',
      tipo: 'Notificação Oficial',
      prioridade: 'Média',
      acaoNecessaria: false,
      prazo: 'Nenhum identificado',
      entidades: ['Receita Federal do Brasil', 'e-CAC', 'DTE'],
      porqueImporta: 'Confirma a manutenção da situação cadastral e regularidade fiscal perante a Fazenda Nacional.'
    },
    gmailLink: 'https://mail.google.com/mail/u/0/#inbox/msg-4'
  },
  {
    id: 'msg-5',
    threadId: 'th-5',
    fromName: 'João Silva',
    fromEmail: 'joao.silva@parceiros.com.br',
    to: 'empresa@dominio.com.br',
    subject: 'Re: Solicitação de orçamento consultoria regulatória',
    snippet: 'Conforme conversamos, segue a documentação solicitada. Fico no aguardo do seu retorno para darmos continuidade...',
    body: `Olá Débora,

Conforme conversamos na nossa reunião de ontem, estou encaminhando o escopo atualizado do projeto de adequação regulatória.

Incluímos as cláusulas de confidencialidade e o cronograma estimado para 90 dias de implantação. Fico no aguardo do seu retorno para darmos continuidade à contratação.

Um abraço,
João Silva`,
    date: 'Ontem',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    isRead: false,
    isStarred: false,
    priority: 'p3',
    category: 'clientes',
    actionRequired: true,
    actionLabel: 'Aguardando resposta',
    statusLabel: 'Proposta pendente',
    hasAttachments: true,
    attachments: [
      {
        id: 'att-4',
        name: 'Escopo_Regulatorio_v2.docx',
        size: '890 KB',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    ],
    insight: {
      resumo: 'Envio de documentação contratual e escopo com solicitação de feedback para fechamento.',
      categoria: 'clientes',
      tipo: 'Negociação em andamento',
      prioridade: 'Média',
      acaoNecessaria: true,
      acaoDescricao: 'Revisar escopo e enviar posicionamento sobre contratação.',
      prazo: 'Até próxima semana',
      entidades: ['João Silva', 'Parceiros Consultoria'],
      porqueImporta: 'O cliente concluiu a fase preliminar e aguarda manifestação para formalização do contrato.'
    },
    gmailLink: 'https://mail.google.com/mail/u/0/#inbox/msg-5'
  },
  {
    id: 'msg-6',
    threadId: 'th-6',
    fromName: 'Jurídico IUS',
    fromEmail: 'juridico@iusnatura.com.br',
    to: 'empresa@dominio.com.br',
    subject: 'Contrato atualizado — assinatura pendente',
    snippet: 'Segue em anexo a versão atualizada do contrato de prestação de serviços. Solicitamos a assinatura até 20/09...',
    body: `Prezada equipe gestora,

O departamento jurídico concluiu a revisão da minuta contratual referente ao termo aditivo de renovação anual da plataforma.

Todas as considerações de proteção de dados (LGPD) e segurança da informação foram incorporadas. Solicitamos a assinatura digital via DocuSign até o dia 20/09/2026.

Link direto para assinatura foi encaminhado aos signatários legais.

Permanecemos à disposição para dúvidas.

Dr. Marcelo Guimarães
Coordenação Jurídica — IUS Natura`,
    date: '12 set.',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 6,
    isRead: true,
    isStarred: true,
    priority: 'p2',
    category: 'legislacao',
    actionRequired: true,
    actionLabel: 'Pendente assinatura',
    statusLabel: 'Prazo 20/09',
    hasAttachments: true,
    attachments: [
      {
        id: 'att-5',
        name: 'Termo_Aditivo_2026_RevFinal.pdf',
        size: '2,4 MB',
        mimeType: 'application/pdf'
      }
    ],
    insight: {
      resumo: 'Termo aditivo revisado com inclusão de cláusulas LGPD aguardando formalização digital.',
      categoria: 'legislacao',
      tipo: 'Contratos e Compliance',
      prioridade: 'Alta',
      acaoNecessaria: true,
      acaoDescricao: 'Assinar termo aditivo via plataforma digital.',
      prazo: '20/09/2026',
      entidades: ['Dr. Marcelo Guimarães', 'IUS Natura', 'LGPD', 'DocuSign'],
      porqueImporta: 'Necessário para garantir a continuidade ininterrupta do serviço contratado sem lapsos regulatórios.',
      complianceAnalysis: {
        escopos: ['SI'],
        aplicabilidade: 'APLICAVEL',
        statusLabel: 'Legislação Aplicável (Segurança da Informação)',
        justificativa: 'Norma/aditivo contratual relacionado à proteção de dados pessoais (LGPD) e segurança da informação de conformidade corporativa.',
        diretrizOperacional: 'Cadastrar na CAL de Segurança da Informação e notificar o Encarregado de Proteção de Dados (DPO).',
        padraoReferencia: 'Lei 13.709/18 (LGPD) / ABNT NBR ISO/IEC 27001',
        orgaoIdentificado: 'Coordenação Jurídica / ANPD',
        esfera: 'Federal (DOU)',
        temasChave: ['Proteção de Dados', 'LGPD', 'Termo Aditivo'],
        requerAcaoBD: false,
      }
    },
    gmailLink: 'https://mail.google.com/mail/u/0/#inbox/msg-6'
  },
  {
    id: 'msg-7',
    threadId: 'th-7',
    fromName: 'Banco do Brasil Corporativo',
    fromEmail: 'notificacoes@bb.com.br',
    to: 'empresa@dominio.com.br',
    subject: 'Comprovante de liquidação de títulos e borderô',
    snippet: 'O borderô de cobrança e liquidação nº 98124 foi liquidado com sucesso na conta corrente empresarial...',
    body: `Aviso de Operação Bancária

Informamos que os pagamentos agendados para o lote nº 98124 foram liquidados com êxito na data de hoje.

Total liquidado: R$ 48.720,00
Beneficiários: 6 fornecedores homologados
Autenticação Bancária: A489.2019.8210.9981

O extrato detalhado está disponível para download no Gerenciador Financeiro.`,
    date: '08 set.',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10,
    isRead: true,
    isStarred: false,
    priority: 'p4',
    category: 'financeiro',
    actionRequired: false,
    statusLabel: 'Conciliado',
    hasAttachments: false,
    attachments: [],
    insight: {
      resumo: 'Confirmação de liquidação automática de borderô no valor de R$ 48.720,00.',
      categoria: 'financeiro',
      tipo: 'Comprovante Bancário',
      prioridade: 'Baixa',
      acaoNecessaria: false,
      prazo: 'Nenhum identificado',
      entidades: ['Banco do Brasil', 'Gerenciador Financeiro', 'Lote 98124'],
      porqueImporta: 'Registro de conciliação para fechamento contábil e fiscal de contas a pagar.'
    },
    gmailLink: 'https://mail.google.com/mail/u/0/#inbox/msg-7'
  }
];

export const MOCK_SYNC_STATE: SyncProgressState = {
  step: 5,
  percent: 78,
  processedEmails: 8421,
  totalEmails: 10742,
  threadsCount: 2184,
  sendersCount: 1347,
  analyzedCount: 824,
  categoriesCount: {
    clientes: 2341,
    financeiro: 1982,
    fornecedores: 1203,
    legislacao: 842
  },
  prioritiesCount: {
    urgentes: 28,
    alta: 147,
    pendentes: 312,
    aguardando: 284
  },
  status: 'syncing',
  currentActivity: 'Analisando conteúdo e contexto com IA',
  estimatedRemainingTime: '2 min 14 s'
};
