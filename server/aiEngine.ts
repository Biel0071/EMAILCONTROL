import { complianceEngine, ComplianceAnalysis } from './complianceEngine.ts';

export interface AIExtractionInput {
  subject: string;
  body: string;
  snippet: string;
  fromName: string;
  fromEmail: string;
}

export interface AIExtractionResult {
  resumo: string;
  categoria: 'clientes' | 'financeiro' | 'fornecedores' | 'legislacao';
  tipo: string;
  prioridade: 'Urgente' | 'Alta' | 'Média' | 'Baixa';
  acaoNecessaria: boolean;
  acaoDescricao?: string;
  prazo: string;
  entidades: string[];
  porqueImporta: string;
  isInferido: boolean;
  complianceAnalysis?: ComplianceAnalysis;
}

/**
 * Extracts intelligence from email content without fabricating data.
 * Adheres strictly to the 4 official categories: clientes, financeiro, fornecedores, legislacao.
 */
export function analyzeEmail(input: AIExtractionInput): AIExtractionResult {
  const fullText = `${input.subject} ${input.body} ${input.snippet}`.toLowerCase();

  // 1. Categorization (strictly Clientes, Financeiro, Fornecedores, Legislação)
  let categoria: 'clientes' | 'financeiro' | 'fornecedores' | 'legislacao' = 'clientes';
  let tipo = 'Comunicação Geral';

  // Exclude 'pedido de orçamento' from matching as supplier 'pedido'
  const supplierText = fullText.replace(/pedido de or[çc]amento/g, '');

  let legislacaoScore = (fullText.match(/\bleis?\b|legislativ|decreto|resolu[çc][aã]o|portaria|normativ|jur[ií]dic|regulamenta[çc]|ac[oó]rd[aã]o|parecer|di[aá]rio oficial|leismunicipais|compliance|\blgpd\b/g) || []).length;
  let financeiroScore = (fullText.match(/nota fiscal|nf-e|nfe|danfe|fatura|boleto|pagamento|banco|border[oô]|comprovante|receita federal|imposto|darf|financeir|extrato|cr[eé]dito|d[eé]bito/g) || []).length;
  let fornecedorScore = (supplierText.match(/fornecedor|pedido|remessa|despacho|rastreamento|transportadora|insumo|estoque|pe[çc]a|ordem de compra|compras/g) || []).length;
  let clientesScore = (fullText.match(/cliente|or[çc]amento|proposta|contrat|reuni[aã]o|alinhamento|atendimento|servi[çc]o|projeto|cronograma/g) || []).length;

  if (input.fromName.toLowerCase().includes('cliente') || fullText.includes('orçamento')) {
    clientesScore += 4;
  }
  if (input.fromName.toLowerCase().includes('fornecedor')) {
    fornecedorScore += 4;
  }
  if (fullText.includes('leismunicipais') || input.fromEmail.includes('iusnatura')) {
    legislacaoScore += 4;
  }

  const scores = [
    { cat: 'legislacao' as const, score: legislacaoScore, defaultTipo: 'Monitoramento / Conformidade Legal' },
    { cat: 'financeiro' as const, score: financeiroScore, defaultTipo: 'Documento Fiscal / Operação Financeira' },
    { cat: 'fornecedores' as const, score: fornecedorScore, defaultTipo: 'Suprimentos / Pedido Fornecedor' },
    { cat: 'clientes' as const, score: clientesScore, defaultTipo: 'Comercial / Relacionamento com Cliente' },
  ];

  scores.sort((a, b) => b.score - a.score);
  if (scores[0].score > 0) {
    categoria = scores[0].cat;
    tipo = scores[0].defaultTipo;
  } else {
    // Domain fallback heuristics
    if (input.fromEmail.includes('jus') || input.fromEmail.includes('adv') || input.fromEmail.includes('leg') || input.fromName.toLowerCase().includes('jurídico')) {
      categoria = 'legislacao';
      tipo = 'Comunicação Jurídica';
    } else if (input.fromEmail.includes('bank') || input.fromEmail.includes('bb.com') || input.fromEmail.includes('itau') || input.fromEmail.includes('bradesco') || input.fromEmail.includes('fiscal')) {
      categoria = 'financeiro';
      tipo = 'Notificação Financeira';
    } else if (input.fromEmail.includes('forneced') || input.fromEmail.includes('vendas') || input.fromEmail.includes('pedidos')) {
      categoria = 'fornecedores';
      tipo = 'Atendimento a Fornecedor';
    } else {
      categoria = 'clientes';
      tipo = 'Comunicação Corporativa';
    }
  }

  // Refine specific tipo
  if (/nota fiscal|danfe|nf-e/i.test(fullText)) tipo = 'Documento Fiscal';
  else if (/leismunicipais|monitoramento/i.test(fullText)) tipo = 'Monitoramento automático';
  else if (/orçamento|proposta comercial/i.test(fullText)) tipo = 'Proposta Comercial / SLA';
  else if (/contrato|termo aditivo/i.test(fullText)) tipo = 'Contrato e Assinatura';
  else if (/comprovante/i.test(fullText)) tipo = 'Comprovante';

  // 2. Priority detection
  let prioridade: 'Urgente' | 'Alta' | 'Média' | 'Baixa' = 'Média';
  const urgentKeywords = ['urgente', 'urgência', 'imediato', 'hoje', 'atenção prioritária', 'prazo hoje', 'sla breach', 'crítico'];
  const highKeywords = ['prazo', 'pendente', 'importante', 'assinar', 'diretoria', 'deliberação', 'notificação'];
  const lowKeywords = ['informativo', 'newsletter', 'resumo mensal', 'comprovante', 'extrato'];

  if (urgentKeywords.some(kw => fullText.includes(kw))) {
    prioridade = 'Urgente';
  } else if (highKeywords.some(kw => fullText.includes(kw))) {
    prioridade = 'Alta';
  } else if (lowKeywords.some(kw => fullText.includes(kw))) {
    prioridade = 'Baixa';
  }

  // 3. Action detection
  const actionKeywords = [
    'precisamos confirmar',
    'aguardo retorno',
    'favor responder',
    'enviar',
    'solicitamos a assinatura',
    'assinar',
    'aprovar',
    'validar',
    'você consegue',
    'pendente de',
    'necessário retorno',
  ];
  const acaoNecessaria = actionKeywords.some(kw => fullText.includes(kw));
  let acaoDescricao: string | undefined = undefined;

  if (acaoNecessaria) {
    if (fullText.includes('assina')) {
      acaoDescricao = 'Formalizar e assinar documento indicado.';
    } else if (fullText.includes('orçamento') || fullText.includes('proposta')) {
      acaoDescricao = 'Enviar proposta ou posicionamento sobre prazos e condições.';
    } else if (fullText.includes('confirmar')) {
      acaoDescricao = 'Confirmar dados solicitados pelo remetente.';
    } else {
      acaoDescricao = 'Responder à solicitação pendente do remetente.';
    }
  }

  // 4. Deadline detection
  let prazo = 'Nenhum identificado';
  // Matches dd/mm, dd/mm/yyyy, até hh:mm, até o final do expediente, até sexta
  const dateRegex = /\b(\d{1,2}[\/\.-]\d{1,2}(?:[\/\.-]\d{2,4})?)\b/;
  const dateMatch = input.body.match(dateRegex);
  if (dateMatch) {
    prazo = dateMatch[1];
  } else if (fullText.includes('hoje') || fullText.includes('fim do expediente')) {
    prazo = 'Hoje até o fim do expediente';
  } else if (fullText.includes('amanhã')) {
    prazo = 'Amanhã';
  } else if (/pr[oó]xima semana/i.test(fullText)) {
    prazo = 'Próxima semana';
  }

  // 5. Entity extraction (strictly from content)
  const entitiesSet = new Set<string>();
  if (input.fromName && input.fromName.length > 2) entitiesSet.add(input.fromName);

  // Extract company names / domain references
  const domainParts = input.fromEmail.split('@')[1];
  if (domainParts && !domainParts.includes('gmail.com') && !domainParts.includes('hotmail.com')) {
    const orgName = domainParts.split('.')[0].toUpperCase();
    if (orgName.length > 2) entitiesSet.add(orgName);
  }

  // Extract explicit known entities from text
  const knownEntities = [
    'IUS Natura',
    'Leis Municipais',
    'Legislação',
    'Municípios',
    'Receita Federal',
    'DocuSign',
    'LGPD',
    'Banco do Brasil',
    'Gerenciador Financeiro',
    'Fornecedor ABC',
    'Cliente Horizonte',
    'Google Workspace',
  ];
  for (const ent of knownEntities) {
    const entLower = ent.toLowerCase().replace(/\s+/g, '');
    const emailLower = input.fromEmail.toLowerCase().replace(/\s+/g, '');
    if (
      input.subject.includes(ent) || 
      input.body.includes(ent) || 
      input.snippet.includes(ent) ||
      input.fromName.includes(ent) ||
      emailLower.includes(entLower)
    ) {
      entitiesSet.add(ent);
    }
  }

  // 6. Summary and Rationale (derived purely from content)
  let resumo = '';
  if (input.snippet && input.snippet.length > 10) {
    resumo = input.snippet.trim();
    if (!resumo.endsWith('.')) resumo += '.';
  } else {
    resumo = input.subject;
  }

  let porqueImporta = '';
  switch (categoria) {
    case 'legislacao':
      porqueImporta = 'Novas publicações ou alterações normativas foram identificadas. O sistema monitora impactos no compliance e diretrizes operacionais.';
      break;
    case 'financeiro':
      porqueImporta = 'Mensagem com dados financeiros, fiscais ou comprovante bancário que demanda conferência contábil.';
      break;
    case 'fornecedores':
      porqueImporta = 'Comunicação referente a cadeia de suprimentos, faturamento de pedidos ou remessa de mercadorias.';
      break;
    case 'clientes':
      porqueImporta = acaoNecessaria
        ? 'Cliente ou prospect com demanda aberta aguardando retorno para cumprimento de SLA.'
        : 'Registro de interação comercial e acompanhamento de relacionamento com o cliente.';
      break;
  }

  // 7. Avaliação Regulatória e Diretrizes IUS Natura
  const complianceAnalysis = complianceEngine.evaluate({
    subject: input.subject,
    body: input.body,
    snippet: input.snippet,
    fromName: input.fromName,
    fromEmail: input.fromEmail,
  });

  // Se identificado como Legislação Aplicável ou CAL de Exclusão, refina a categoria caso não fosse estritamente fiscal/fornecedor
  if (complianceAnalysis.aplicabilidade === 'APLICAVEL' || complianceAnalysis.aplicabilidade === 'CAL_EXCLUSAO') {
    if (categoria !== 'financeiro' && categoria !== 'fornecedores') {
      categoria = 'legislacao';
      if (tipo === 'Monitoramento / Conformidade Legal' || tipo === 'Comunicação Corporativa' || tipo === 'Comunicação Jurídica') {
        tipo = complianceAnalysis.statusLabel;
      }
    }
  }

  return {
    resumo,
    categoria,
    tipo,
    prioridade,
    acaoNecessaria,
    acaoDescricao,
    prazo,
    entidades: Array.from(entitiesSet).slice(0, 5),
    porqueImporta,
    isInferido: true,
    complianceAnalysis,
  };
}
