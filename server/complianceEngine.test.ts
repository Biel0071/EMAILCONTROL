import { describe, it, expect } from 'vitest';
import { complianceEngine } from './complianceEngine.ts';

describe('IUS Natura Compliance Engine — Diretrizes de Leitura & Legislação Aplicável', () => {
  it('should identify Environmental norms (MA) as APLICAVEL with ISO 14001 reference', () => {
    const result = complianceEngine.evaluate({
      subject: 'Publicação de nova resolução sobre licenciamento ambiental e recursos hídricos',
      body: 'O Conselho Estadual de Meio Ambiente publicou diretrizes para outorga de água e gestão de resíduos sólidos.',
      snippet: 'Diretrizes para outorga de água e gestão de resíduos...',
      fromName: 'Secretaria de Meio Ambiente',
      fromEmail: 'sema@estado.gov.br',
    });

    expect(result.escopos).toContain('MA');
    expect(result.aplicabilidade).toBe('APLICAVEL');
    expect(result.padraoReferencia).toContain('ISO 14001');
    expect(result.diretrizOperacional).toContain('Cadastrar na CAL de Meio Ambiente');
  });

  it('should identify Occupational Health & Safety (SSO) as APLICAVEL with ISO 45001 reference', () => {
    const result = complianceEngine.evaluate({
      subject: 'Atualização da Norma Regulamentadora NR-01 - Gerenciamento de Riscos Ocupacionais (PGR)',
      body: 'Ministério do Trabalho e Emprego publica portaria revisando requisitos de EPI, CIPA e ergonomia intramuros.',
      snippet: 'Portaria revisando requisitos de EPI, CIPA e ergonomia...',
      fromName: 'MTE / Inspeção do Trabalho',
      fromEmail: 'mte@gov.br',
    });

    expect(result.escopos).toContain('SSO');
    expect(result.aplicabilidade).toBe('APLICAVEL');
    expect(result.padraoReferencia).toContain('ISO 45001');
    expect(result.diretrizOperacional).toContain('Cadastrar na CAL de Saúde e Segurança Ocupacional');
  });

  it('should identify Information Security & LGPD (SI) as APLICAVEL with ISO 27001 / LGPD reference', () => {
    const result = complianceEngine.evaluate({
      subject: 'Resolução da ANPD sobre Notificação de Incidentes de Segurança e Dados Pessoais',
      body: 'A Autoridade Nacional de Proteção de Dados publica regras para operadores e controladores sobre comunicação de vazamento de dados sensíveis conforme a LGPD.',
      snippet: 'Regras para comunicação de vazamento de dados pessoais...',
      fromName: 'ANPD Oficial',
      fromEmail: 'comunicacao@anpd.gov.br',
    });

    expect(result.escopos).toContain('SI');
    expect(result.aplicabilidade).toBe('APLICAVEL');
    expect(result.padraoReferencia).toContain('LGPD');
    expect(result.diretrizOperacional).toContain('Cadastrar na CAL de Segurança da Informação');
  });

  it('should classify Processo Produtivo Básico (PPB) as CAL_EXCLUSAO based on official IUS guide', () => {
    const result = complianceEngine.evaluate({
      subject: 'Portaria Interministerial MDIC/MCTIC estabelece Processo Produtivo Básico para fabricação de bens',
      body: 'Fixa o conjunto mínimo de operações do Processo Produtivo Básico (PPB) para tablets no país.',
      snippet: 'Processo Produtivo Básico PPB para tablets...',
      fromName: 'DOU - Imprensa Nacional',
      fromEmail: 'dou@in.gov.br',
    });

    expect(result.aplicabilidade).toBe('CAL_EXCLUSAO');
    expect(result.justificativa).toContain('Processo Produtivo Básico (PPB)');
    expect(result.diretrizOperacional).toContain('CAL DE EXCLUSÃO');
  });

  it('should classify internal server organization as CAL_EXCLUSAO', () => {
    const result = complianceEngine.evaluate({
      subject: 'Portaria cria Grupo de Trabalho para organização interna de servidores',
      body: 'Dispõe sobre o regimento interno e a lotação de servidores públicos no funcionamento interno do órgão.',
      snippet: 'Lotação de servidores e funcionamento interno...',
      fromName: 'Gabinete Executivo',
      fromEmail: 'gabinete@orgao.gov.br',
    });

    expect(result.aplicabilidade).toBe('CAL_EXCLUSAO');
    expect(result.justificativa).toContain('servidores e funcionamento interno');
  });

  it('should classify Direct Actions of Unconstitutionality (ADI) as PARA_IUS_NATURA', () => {
    const result = complianceEngine.evaluate({
      subject: 'Acórdão do STF em Ação Direta de Inconstitucionalidade (ADI nº 5928)',
      body: 'O Supremo Tribunal Federal julgou procedente a ADI declarando inconstitucional lei municipal.',
      snippet: 'STF declara inconstitucionalidade de dispositivo...',
      fromName: 'Poder Judiciário',
      fromEmail: 'stf@jus.br',
    });

    expect(result.aplicabilidade).toBe('PARA_IUS_NATURA');
    expect(result.diretrizOperacional).toContain('Para Ius Natura');
  });

  it('should flag regulatory extracts that require requesting text from BD@iusnatura.com.br', () => {
    const result = complianceEngine.evaluate({
      subject: 'Resolução da ANEEL - Extrato da norma publicado no DOU',
      body: 'Aprova novos critérios tarifários de energia elétrica. O texto integral encontra-se disponível em seu site oficial.',
      snippet: 'Texto integral disponível no sítio eletrônico da ANEEL...',
      fromName: 'ANEEL',
      fromEmail: 'aneel@gov.br',
    });

    expect(result.requerAcaoBD).toBe(true);
    expect(result.diretrizOperacional).toContain('BD@iusnatura.com.br');
  });
});
