/**
 * IUS Natura — Motor de Conformidade e Diretrizes Regulatórias
 * Modelado a partir de: "Orientações de leitura & Identificação de legislação aplicável" (Maio de 2025)
 * Inteligência em Requisitos Legais (IRL) / Sistema CAL
 */

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
  requerAcaoBD: boolean; // Solicitar texto ao BD@iusnatura.com.br
}

interface EvaluationInput {
  subject: string;
  body: string;
  snippet?: string;
  fromName?: string;
  fromEmail?: string;
}

export class ComplianceEngine {
  /**
   * Avalia um e-mail / documento / norma confrontando com as diretrizes do Guia IUS Natura
   */
  public evaluate(input: EvaluationInput): ComplianceAnalysis {
    const text = `${input.subject || ''} ${input.body || ''} ${input.snippet || ''}`.toLowerCase();
    const from = `${input.fromName || ''} ${input.fromEmail || ''}`.toLowerCase();

    // Guard: Verificar se a mensagem possui contexto normativo, legal, regulatório ou de conformidade
    const isNormativeOrCompliance = 
      /\blei\b|\bdecreto\b|\bportaria\b|\bresolu[çc][aã]o\b|\binstru[çc][aã]o normativa\b|\bdelibera[çc][aã]o\b|\bdi[aá]rio oficial\b|\bleismunicipais\b|\bdi[aá]rio dos munic[ií]pios\b|\bnorma regulamentadora\b|\bnr-\d+|\bac[oó]rd[aã]o\b|\bs[uú]mula\b|\bmedida provis[oó]ria\b|\bconstitui[çc][aã]o\b|\bc[oó]digo\b|\bconven[çc][aã]o coletiva\b|\bacordo coletivo\b|\btermo de ajustamento\b|\btst\b|\btrt\b|\bstf\b|\bstj\b|\bmte\b|\banpd\b|\bibama\b|\bcetesb\b|\banvisa\b|\baneel\b|\banm\b|\bantt\b|\bconama\b|\besocial\b|\bpgr\b|\bpcmso\b|\bltcat\b|\bauditoria de conformidade\b|\brequisito legal\b|\bsistema cal\b|\bius natura\b|\blegisla[çc][aã]o\b|\bmonitoramento\b/i.test(text) ||
      /iusnatura|leismunicipais|jusbrasil|migalhas|conjur/i.test(from);

    if (!isNormativeOrCompliance) {
      return {
        escopos: [],
        aplicabilidade: 'INFORMATIVO',
        statusLabel: 'Comunicação Geral',
        justificativa: 'Mensagem sem conteúdo normativo ou mandatório direto identificado nos escopos da IUS.',
        diretrizOperacional: 'Manter em arquivo para histórico de relacionamento e operação rotineira.',
        padraoReferencia: 'Comunicação Operacional Corporativa',
        orgaoIdentificado: undefined,
        esfera: undefined,
        temasChave: ['Comunicação', 'Operação'],
        requerAcaoBD: false,
      };
    }

    // 1. Identificar Órgão e Esfera
    const { orgao, esfera } = this.detectOrgaoEEsfera(text, from);

    // 2. Verificar Regras Excludentes Oficiais (CAL de Exclusão)
    const excludente = this.checkExcludentes(text, orgao);
    if (excludente) {
      return {
        escopos: excludente.escopos,
        aplicabilidade: 'CAL_EXCLUSAO',
        statusLabel: 'CAL de Exclusão',
        justificativa: excludente.justificativa,
        diretrizOperacional: excludente.diretriz,
        padraoReferencia: excludente.padrao,
        orgaoIdentificado: orgao,
        esfera,
        temasChave: excludente.temas,
        requerAcaoBD: false,
      };
    }

    // 3. Verificar Casos Especiais "Para Ius Natura"
    const paraIus = this.checkParaIusNatura(text);
    if (paraIus) {
      return {
        escopos: paraIus.escopos,
        aplicabilidade: 'PARA_IUS_NATURA',
        statusLabel: 'Para Ius Natura',
        justificativa: paraIus.justificativa,
        diretrizOperacional: paraIus.diretriz,
        padraoReferencia: paraIus.padrao,
        orgaoIdentificado: orgao,
        esfera,
        temasChave: paraIus.temas,
        requerAcaoBD: false,
      };
    }

    // 4. Mapear Escopos Regulatórios IUS
    const escoposDetectados = this.detectEscopos(text);

    // 5. Detectar Publicações em Extrato que Exigem Ação do Banco de Dados
    const requerAcaoBD = this.checkRequerTextoBD(text, orgao);

    // 6. Determinar Aplicabilidade e Diretriz Operacional
    if (escoposDetectados.length > 0) {
      const primaryEscopo = escoposDetectados[0];
      const diretrizInfo = this.getDiretrizForEscopo(primaryEscopo, text);

      return {
        escopos: escoposDetectados,
        aplicabilidade: diretrizInfo.aplicabilidade,
        statusLabel: diretrizInfo.statusLabel,
        justificativa: diretrizInfo.justificativa,
        diretrizOperacional: requerAcaoBD 
          ? `${diretrizInfo.diretriz} Solicitar texto integral ao BD (BD@iusnatura.com.br).`
          : diretrizInfo.diretriz,
        padraoReferencia: diretrizInfo.padrao,
        orgaoIdentificado: orgao,
        esfera,
        temasChave: diretrizInfo.temas,
        requerAcaoBD,
      };
    }

    // 7. Comunicação Corporativa Geral (quando não enquadrado em requisito legal direto)
    return {
      escopos: [],
      aplicabilidade: 'INFORMATIVO',
      statusLabel: 'Comunicação Geral',
      justificativa: 'Mensagem sem conteúdo normativo ou mandatório direto identificado nos escopos da IUS.',
      diretrizOperacional: 'Manter em arquivo para histórico de relacionamento e operação rotineira.',
      padraoReferencia: 'Comunicação Operacional Corporativa',
      orgaoIdentificado: orgao,
      esfera,
      temasChave: ['Comunicação', 'Operação'],
      requerAcaoBD: false,
    };
  }

  private detectOrgaoEEsfera(text: string, from: string): { orgao?: string; esfera?: 'Federal (DOU)' | 'Estadual (DOE)' | 'Municipal (DOM)' | 'Regulatória' } {
    if (from.includes('leismunicipais') || text.includes('leismunicipais') || /\blei municipal\b|\bdecreto municipal\b|\bprefeitura\b|\bdi[aá]rio oficial do munic[ií]pio|\bdom\b/i.test(text)) {
      return { orgao: 'Poder Executivo / Legislativo Municipal', esfera: 'Municipal (DOM)' };
    }
    if (/\bdou\b|\bdi[aá]rio oficial da uni[aã]o\b|\bibama\b|\banvisa\b|\banpd\b|\bantt\b|\banm\b|\baneel\b|\bconama\b/i.test(text)) {
      let orgao = 'Imprensa Nacional / DOU';
      if (/\bibama\b/i.test(text)) orgao = 'IBAMA';
      else if (/\banvisa\b/i.test(text)) orgao = 'ANVISA';
      else if (/\banpd\b/i.test(text)) orgao = 'ANPD (Proteção de Dados)';
      else if (/\bantt\b/i.test(text)) orgao = 'ANTT';
      else if (/\banm\b/i.test(text)) orgao = 'ANM (Mineração)';
      else if (/\baneel\b/i.test(text)) orgao = 'ANEEL';
      else if (/\bconama\b/i.test(text)) orgao = 'CONAMA';
      else if (/\bmapa\b|minist[eé]rio da agricultura/i.test(text)) orgao = 'MAPA';
      return { orgao, esfera: 'Federal (DOU)' };
    }
    if (/\bdoe\b|\bdi[aá]rio oficial do estado\b|\bsecretaria de estado\b|\bsema\b|\bfepam\b|\bcetesb\b|\binea\b/i.test(text)) {
      return { orgao: 'Secretaria / Órgão Estadual', esfera: 'Estadual (DOE)' };
    }
    return { orgao: undefined, esfera: undefined };
  }

  private checkExcludentes(text: string, orgao?: string): { escopos: IUSEscopo[]; justificativa: string; diretriz: string; padrao: string; temas: string[] } | null {
    // 1. Processo Produtivo Básico (PPB)
    if (text.includes('processo produtivo básico') || text.includes(' ppb ') || text.includes('portaria interministerial mdic/mct')) {
      return {
        escopos: ['Q'],
        justificativa: 'Conforme o Guia IUS, portarias sobre Processo Produtivo Básico (PPB) do MDIC/MCTIC não garantem qualidade de produto; apenas fixam etapas fabris para incentivos fiscais e licitatórios (Lei 8.248/91).',
        diretriz: 'Encaminhar para CAL DE EXCLUSÃO. Não cadastrar no banco de dados de Qualidade.',
        padrao: 'Guia IUS Seção "Sobre Processo Produtivo Básico (PPB)" / Lei 8.248/91',
        temas: ['PPB', 'Incentivo Fiscal', 'Excludente de Qualidade'],
      };
    }

    // 2. Organização estritamente interna de órgãos públicos
    if ((text.includes('regimento interno') || text.includes('grupo de trabalho') || text.includes('estrutura organizacional') || text.includes('comissão interna')) &&
        (text.includes('servidores') || text.includes('funcionamento interno') || text.includes('atribuições de servidores') || text.includes('lotação'))) {
      return {
        escopos: ['Q'],
        justificativa: 'Normas que se limitam à organização de servidores e funcionamento interno de órgãos da administração pública não impõem requisitos aplicáveis a entidades privadas.',
        diretriz: 'Encaminhar para CAL DE EXCLUSÃO.',
        padrao: 'Guia IUS Seção "Diretrizes gerais de leitura de diários — Não são aplicáveis"',
        temas: ['Organização Interna', 'Servidores Públicos', 'Excludente'],
      };
    }

    // 3. Atos nominais para empresas específicas ou sanções individuais
    if (text.includes('sanção aplicada') || text.includes('multa aplicada à empresa') || (text.includes('autorização de funcionamento') && text.includes('em favor de')) || text.includes('desapropriação por utilidade pública') || text.includes('tombamento de imóvel')) {
      return {
        escopos: ['MA', 'Q'],
        justificativa: 'Atos normativos de efeitos concretos aplicáveis nominalmente para empresas específicas, desapropriações e tombamentos nominais não são de aplicação geral.',
        diretriz: 'Encaminhar para CAL DE EXCLUSÃO.',
        padrao: 'Guia IUS Seção "Normas Específicas / Sanções Aplicadas"',
        temas: ['Efeito Concreto', 'Sanção Nominal', 'Excludente'],
      };
    }

    // 4. Outorgas individuais e autorizações específicas para terceiros
    if ((text.includes('outorga de autorização') || text.includes('faixa de domínio de rodovia') || text.includes('implantação de linha de transmissão')) &&
        (text.includes('em favor de') || text.includes('conceder outorga à') || text.includes('autorizar a empresa'))) {
      return {
        escopos: ['SV', 'ENERGIA'],
        justificativa: 'Autorizações e outorgas individuais para ocupação de faixa de domínio ou exploração de serviço não configuram requisitos regulamentares gerais.',
        diretriz: 'Encaminhar para CAL DE EXCLUSÃO conforme regra de órgãos reguladores (ANTT / ANEEL).',
        padrao: 'Guia IUS Seção "Diretrizes específicas de órgãos DOU (ANTT/ANEEL)"',
        temas: ['Outorga Individual', 'Faixa de Domínio', 'Excludente'],
      };
    }

    // 5. Previdenciário puro ou rito processual judicial
    if (text.includes('aposentadoria por tempo') || text.includes('pensão por morte') || text.includes('concessão de auxílio-doença') || text.includes('rito processual') || text.includes('prazos recursais do trt')) {
      return {
        escopos: ['TRAB'],
        justificativa: 'Benefícios previdenciários concedidos pelo INSS e normas estritamente processuais judiciais não integram o escopo Trabalhista do Sistema CAL.',
        diretriz: 'Não aplicável ao Sistema CAL.',
        padrao: 'Guia IUS Seção "Trabalhista — Não aplicável (Previdenciário e Processual)"',
        temas: ['Previdenciário', 'Processual Judicial', 'Excludente'],
      };
    }

    return null;
  }

  private checkParaIusNatura(text: string): { escopos: IUSEscopo[]; justificativa: string; diretriz: string; padrao: string; temas: string[] } | null {
    // Ação Direta de Inconstitucionalidade (ADI) ou ADC
    if (text.includes('ação direta de inconstitucionalidade') || text.includes('adi nº') || text.includes('adc nº') || text.includes('declarada inconstitucional')) {
      return {
        escopos: ['MA', 'TRAB', 'Q'],
        justificativa: 'Decisões do STF em sede liminar ou final sobre declarações de inconstitucionalidade afetam a validade das normas cadastradas.',
        diretriz: 'Não cadastrar novo ato. Apenas informar a publicação no campo "Para Ius Natura" da norma pertinente no Sistema CAL.',
        padrao: 'Guia IUS Seção "Atos do Poder Judiciário (DOU)"',
        temas: ['ADI', 'Inconstitucionalidade', 'Para Ius Natura'],
      };
    }

    // Atos de prorrogação ou rejeição de Medidas Provisórias
    if (text.includes('prorrogação de vigência da medida provisória') || text.includes('presidente da mesa do congresso nacional') && text.includes('medida provisória')) {
      return {
        escopos: ['Q', 'TRAB', 'MA'],
        justificativa: 'Atos do presidente da mesa do Congresso Nacional quanto à prorrogação ou encerramento de MP afetam a vigência legal.',
        diretriz: 'Não cadastrar novo ato. Informar nos campos "Assunto" e "Para Ius Natura" da MP correspondente.',
        padrao: 'Guia IUS Seção "Atos do Congresso Nacional (DOU)"',
        temas: ['Medida Provisória', 'Vigência', 'Para Ius Natura'],
      };
    }

    return null;
  }

  private detectEscopos(text: string): IUSEscopo[] {
    const escopos: IUSEscopo[] = [];

    // MA: Meio Ambiente
    if (/meio ambiente|ambiental|res[ií]duo|efluente|licenciamento ambiental|polui[çc]|recursos h[ií]dricos|outorga de [áa]gua|flora|fauna|\bibama\b|\bcetesb\b|\binea\b|\bconama\b|emiss[oõ]es atmosf|unidade de conserva[çc]|\bpnrs\b|\besg\b/i.test(text)) {
      escopos.push('MA');
    }

    // SSO: Saúde e Segurança Ocupacional
    if (/sa[úu]de e seguran[çc]a|seguran[çc]a do trabalho|ocupacional|\bnr-\d+|\bnorma regulamentadora|\bcipa\b|\bepi\b|\bepc\b|\bpgr\b|\bpcmso\b|\bltcat\b|insalubridade|periculosidade|ergonomia|acidente de trabalho|laudo t[eé]cnico/i.test(text)) {
      escopos.push('SSO');
    }

    // SI: Segurança da Informação & LGPD
    if (/\blgpd\b|prote[çc][aã]o de dados|dados pessoais|dado sens[ií]vel|\banpd\b|seguran[çc]a da informa[çc]|iso 27001|vazamento de dados|incidente de seguran[çc]a|\bcontrolador\b|\boperador\b|\bdpo\b|\bencarregado\b/i.test(text)) {
      escopos.push('SI');
    }

    // TRAB: Trabalhista
    if (/trabalhista|\bclt\b|jornada de trabalho|v[ií]nculo empregat[ií]cio|sal[aá]rio m[ií]nimo|piso salarial|f[eé]rias|rescis[aã]o|acordo coletivo|conven[çc][aã]o coletiva|\bfgts\b|\besocial\b|\bmte\b|inspe[çc][aã]o do trabalho/i.test(text)) {
      escopos.push('TRAB');
    }

    // RS: Responsabilidade Social
    if (/responsabilidade social|sa8000|nbr 16001|iso 26000|trabalho infantil|trabalho escravo|igualdade racial|diversidade|discrimina[çc][aã]o|ass[eé]dio|cota de pcd|jovem aprendiz/i.test(text)) {
      escopos.push('RS');
    }

    // ENERGIA: Gestão Energética
    if (/efici[eê]ncia energ[eé]tica|iso 50001|\baneel\b|tarifa de energia|mercado livre de energia|consumo de energia|desempenho energ[eé]tico|bandeira tarif[aá]ria|gerador de energia/i.test(text)) {
      escopos.push('ENERGIA');
    }

    // SA: Segurança de Alimentos
    if (/seguran[çc]a de alimentos|iso 22000|\banvisa\b|boas pr[aá]ticas de fabrica[çc]|aditivo alimentar|embalagem de alimento|rastreabilidade de alimentos|contamina[çc][aã]o alimentar/i.test(text)) {
      escopos.push('SA');
    }

    // SV: Segurança Viária
    if (/seguran[çc]a vi[aá]ria|iso 39001|tr[aâ]nsito|rodovia|\bantt\b|faixa de dom[ií]nio|pesagem de ve[ií]culos|transporte rodovi[aá]rio|cargas perigosas/i.test(text)) {
      escopos.push('SV');
    }

    // MIN: Direito Minerário
    if (/direito miner[aá]rio|c[oó]digo de minera[çc]|\banm\b|\bdnpm\b|t[ií]tulo miner[aá]rio|lavra|pesquisa mineral|barragem de rejeitos|\bpnsb\b|servid[aã]o miner[aá]ria/i.test(text)) {
      escopos.push('MIN');
    }

    // TRIB: Tributos e Taxas Específicas
    if (/\btcfa\b|\btfa\b|taxa de fiscaliza[çc][aã]o ambiental|taxa de inc[eê]ndio|taxa de res[ií]duos|taxa de poder de pol[ií]cia/i.test(text)) {
      escopos.push('TRIB');
    }

    // Q: Qualidade (Atividade-fim / Regulamentações de Agências)
    if (escopos.length === 0 && (/qualidade|iso 9001|\binmetro\b|certifica[çc]|avalia[çc][aã]o da conformidade|direitos do consumidor|\bprocon\b|c[oó]digo de defesa do consumidor/i.test(text))) {
      escopos.push('Q');
    }

    return escopos;
  }

  private checkRequerTextoBD(text: string, orgao?: string): boolean {
    // Órgãos que publicam apenas extrato/ementa no DOU e exigem requisição ao BD@iusnatura.com.br
    const orgaosExtrato = ['ANM', 'ANP', 'ANTAQ', 'ANEEL'];
    const publicaExtrato = text.includes('extrato da norma') || text.includes('texto integral disponível em seu site') || text.includes('disponível na íntegra no sítio eletrônico');
    return (orgao && orgaosExtrato.includes(orgao)) || publicaExtrato;
  }

  private getDiretrizForEscopo(escopo: IUSEscopo, text: string): {
    aplicabilidade: AplicabilidadeStatus;
    statusLabel: string;
    justificativa: string;
    diretriz: string;
    padrao: string;
    temas: string[];
  } {
    switch (escopo) {
      case 'MA':
        return {
          aplicabilidade: 'APLICAVEL',
          statusLabel: 'Legislação Aplicável (Meio Ambiente)',
          justificativa: 'Identificada norma relacionada à proteção ambiental, recursos hídricos, resíduos ou licenciamento. Conforme o Guia IUS, o escopo de MA deve ser identificado sempre que houver ao menos 1 cliente ativo na unidade territorial.',
          diretriz: 'Cadastrar na CAL de Meio Ambiente e verificar alterações em licenças e monitoramentos.',
          padrao: 'ISO 14001:2015 / Guia IUS Requisitos de Meio Ambiente',
          temas: ['Gestão Ambiental', 'Controle Operacional', 'Licenciamento'],
        };
      case 'SSO':
        return {
          aplicabilidade: 'APLICAVEL',
          statusLabel: 'Legislação Aplicável (SSO)',
          justificativa: 'Norma que estabelece medidas de proteção, higiene e saúde dos trabalhadores intramuros. Mapeada independentemente da atividade contratada, desde que haja cliente ativo.',
          diretriz: 'Cadastrar na CAL de Saúde e Segurança Ocupacional (SSO) e atualizar matriz de riscos/PGR.',
          padrao: 'ISO 45001:2018 / NRs do MTE / eSocial SST',
          temas: ['Saúde e Segurança', 'NRs', 'Condições de Trabalho'],
        };
      case 'SI':
        return {
          aplicabilidade: 'APLICAVEL',
          statusLabel: 'Legislação Aplicável (Segurança da Informação)',
          justificativa: 'Norma relacionada à proteção de dados pessoais de pessoas naturais, incidentes de segurança, sigilo ou exigências da ANPD.',
          diretriz: 'Cadastrar na CAL de Segurança da Informação e notificar o DPO / Encarregado da organização.',
          padrao: 'Lei 13.709/18 (LGPD) / ABNT NBR ISO/IEC 27001',
          temas: ['Proteção de Dados', 'LGPD', 'ANPD', 'Segurança da Informação'],
        };
      case 'TRAB':
        return {
          aplicabilidade: 'APLICAVEL',
          statusLabel: 'Legislação Aplicável (Trabalhista)',
          justificativa: 'Norma reguladora da relação de emprego (contrato, jornada, remuneração, férias, igualdade salarial ou obrigações acessórias eSocial).',
          diretriz: 'Cadastrar na CAL Trabalhista e alinhar rotinas de departamento pessoal e compliance.',
          padrao: 'CLT / eSocial / Guia IUS Seção Trabalhista',
          temas: ['Direito do Trabalho', 'eSocial', 'Jornada e Benefícios'],
        };
      case 'RS':
        return {
          aplicabilidade: 'APLICAVEL',
          statusLabel: 'Legislação Aplicável (Responsabilidade Social)',
          justificativa: 'Norma voltada para direitos humanos, não discriminação, igualdade racial e inclusão no ambiente corporativo.',
          diretriz: 'Cadastrar na CAL de Responsabilidade Social e revisar indicadores de sustentabilidade/ESG.',
          padrao: 'SA8000 / PR 2030 / NBR 16001 / ISO 26000',
          temas: ['Direitos Humanos', 'Inclusão', 'Diversidade'],
        };
      case 'ENERGIA':
        return {
          aplicabilidade: 'APLICAVEL',
          statusLabel: 'Legislação Aplicável (Energia)',
          justificativa: 'Norma relacionada a eficiência energética, consumo, tarifas ANEEL ou mercado livre de energia impactando custos operacionais.',
          diretriz: 'Cadastrar na CAL de Energia e integrar ao planejamento energético.',
          padrao: 'ABNT NBR ISO 50001 (Item 4.4.2) / Resoluções ANEEL',
          temas: ['Eficiência Energética', 'Tarifas', 'Uso e Consumo'],
        };
      case 'SA':
        return {
          aplicabilidade: 'AVALIAR_CLIENTE_ATIVO',
          statusLabel: 'Avaliar Cliente Ativo (Alimentos)',
          justificativa: 'Norma de segurança alimentar e boas práticas de fabricação (ANVISA/MAPA). Aplicável para organizações na cadeia produtiva de alimentos.',
          diretriz: 'Verificar se há clientes ativos do segmento de alimentação/bebidas na localidade para inclusão na CAL.',
          padrao: 'ISO 22000 / RDCs da ANVISA / MAPA',
          temas: ['Segurança Alimentar', 'ANVISA', 'Boas Práticas'],
        };
      case 'SV':
        return {
          aplicabilidade: 'APLICAVEL',
          statusLabel: 'Legislação Aplicável (Segurança Viária)',
          justificativa: 'Norma voltada para segurança de tráfego, faixas de domínio, infraestrutura rodoviária ou restrição de transporte de cargas.',
          diretriz: 'Cadastrar na CAL de Segurança Viária e atualizar plano de gestão de frotas e trânsito.',
          padrao: 'ABNT NBR ISO 39001 / Resoluções ANTT / CONTRAN',
          temas: ['Segurança Viária', 'Trânsito', 'Frota'],
        };
      case 'MIN':
        return {
          aplicabilidade: 'AVALIAR_CLIENTE_ATIVO',
          statusLabel: 'Legislação Aplicável (Direito Minerário)',
          justificativa: 'Legislação aplicável ao setor de mineração, títulos minerários, servidões ou segurança de barragens.',
          diretriz: 'Cadastrar na CAL de Mineração para organizações com atividade-fim minerária.',
          padrao: 'Decreto-Lei 227/67 (Código de Mineração) / Lei 12.334/10 (PNSB) / ANM',
          temas: ['Mineração', 'Títulos Minerários', 'Barragens'],
        };
      case 'TRIB':
        return {
          aplicabilidade: 'APLICAVEL',
          statusLabel: 'Legislação Aplicável (Taxas Ambientais/Poder de Polícia)',
          justificativa: 'Taxa decorrente do poder de polícia ambiental ou de serviços específicos (TCFA, TFA, taxa de resíduos, taxa de incêndio).',
          diretriz: 'Cadastrar na CAL como requisito tributário vinculado à gestão ambiental.',
          padrao: 'Art. 145, II da CR/88 / Art. 78 do CTN / Guia IUS de Tributos',
          temas: ['TCFA', 'TFA', 'Poder de Polícia'],
        };
      case 'Q':
      default:
        return {
          aplicabilidade: 'AVALIAR_CLIENTE_ATIVO',
          statusLabel: 'Avaliar Atividade-Fim (Qualidade)',
          justificativa: 'Norma de agência reguladora, INMETRO ou defesa do consumidor. O escopo de Qualidade abrange a atividade-fim da organização e atividades que afetam diretamente o produto/serviço.',
          diretriz: 'Consultar matriz de atividades dos clientes ativos para validar aplicabilidade à atividade-fim.',
          padrao: 'ABNT NBR ISO 9001:2015 (Seção 0.3.3 Mentalidade de Risco)',
          temas: ['Qualidade', 'Atividade-fim', 'Avaliação de Conformidade'],
        };
    }
  }
}

export const complianceEngine = new ComplianceEngine();
