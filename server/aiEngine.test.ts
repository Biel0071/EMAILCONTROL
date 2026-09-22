import { describe, it, expect } from 'vitest';
import { analyzeEmail } from './aiEngine';

describe('AI Engine - Factual Intelligence Extraction', () => {
  it('should correctly categorize legal and regulatory emails as legislacao', () => {
    const result = analyzeEmail({
      subject: 'Leis Municipais disponibilizadas no portal LeisMunicipais',
      snippet: 'Informamos novas publicações legislativas no portal...',
      body: 'Olá, Informamos que foram disponibilizadas novas publicações legislativas referentes aos municípios monitorados.',
      fromName: 'Débora Xavier',
      fromEmail: 'deboraxavier@iusnatura.com.br',
    });

    expect(result.categoria).toBe('legislacao');
    expect(result.tipo).toBe('Monitoramento automático');
    expect(result.entidades).toContain('Leis Municipais');
    expect(result.entidades).toContain('IUS Natura');
  });

  it('should categorize supplier invoices under fornecedores when from supplier', () => {
    const result = analyzeEmail({
      subject: 'Nota fiscal disponível — Pedido #28491',
      snippet: 'Documento fiscal referente ao pedido #28491...',
      body: 'Encaminhamos a Nota Fiscal Eletrônica referente ao fornecimento do pedido. Vencimento em 25/09/2026.',
      fromName: 'Fornecedor ABC',
      fromEmail: 'fiscal@fornecedorabc.ind.br',
    });

    expect(result.categoria).toBe('fornecedores');
    expect(result.tipo).toBe('Documento Fiscal');
    expect(result.prazo).toContain('25/09/2026');
  });

  it('should categorize banking statements and fiscal regularities under financeiro', () => {
    const result = analyzeEmail({
      subject: 'Notificação de regularidade fiscal e certidão negativa',
      snippet: 'Processamento com êxito da declaração de regularidade...',
      body: 'Consta nova mensagem sobre certidão negativa de débitos e quitação de tributos.',
      fromName: 'Receita Federal',
      fromEmail: 'notificacoes@rfb.gov.br',
    });

    expect(result.categoria).toBe('financeiro');
  });

  it('should detect urgency and required action for urgent client budget requests', () => {
    const result = analyzeEmail({
      subject: 'Re: Pedido de orçamento urgente',
      snippet: 'Precisamos confirmar o prazo de entrega hoje...',
      body: 'Precisamos confirmar com urgência o prazo final de entrega hoje até o fim do expediente.',
      fromName: 'Cliente Horizonte',
      fromEmail: 'contato@clientehorizonte.com.br',
    });

    expect(result.categoria).toBe('clientes');
    expect(result.prioridade).toBe('Urgente');
    expect(result.acaoNecessaria).toBe(true);
    expect(result.prazo).toBe('Hoje até o fim do expediente');
  });

  it('should return "Nenhum identificado" when no deadline is present, avoiding fabrication', () => {
    const result = analyzeEmail({
      subject: 'Notificação de leitura',
      snippet: 'Mensagem informativa de rotina',
      body: 'Informamos que o sistema está em conformidade. Nenhuma pendência identificada.',
      fromName: 'Sistema',
      fromEmail: 'sistema@empresa.com.br',
    });

    expect(result.prazo).toBe('Nenhum identificado');
  });

  it('should NEVER categorize into prohibited categories (Marketing, Automáticos)', () => {
    const allowedCategories = ['clientes', 'financeiro', 'fornecedores', 'legislacao'];

    const testCases = [
      { subject: 'Newsletter mensal', body: 'Confira as promoções e novidades de marketing' },
      { subject: 'Alerta automático do servidor', body: 'Log gerado automaticamente pelo bot' },
      { subject: 'Aviso de compra', body: 'Pedido confirmado pelo fornecedor de insumos' },
    ];

    for (const tc of testCases) {
      const result = analyzeEmail({
        subject: tc.subject,
        body: tc.body,
        snippet: tc.body,
        fromName: 'Remetente',
        fromEmail: 'test@example.com',
      });
      expect(allowedCategories).toContain(result.categoria);
      expect(result.categoria).not.toBe('marketing');
      expect(result.categoria).not.toBe('automaticos');
    }
  });
});
