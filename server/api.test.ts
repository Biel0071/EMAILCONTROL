import { describe, it, expect } from 'vitest';
import { syncEngine } from './syncEngine';
import { matchEmailSearch } from './index';
import { decodeMimeHeader } from './gmailClient';

describe('Email Control REST APIs & Search Matching', () => {
  it('should list emails with default mock dataset', () => {
    const emails = syncEngine.getEmails();
    expect(emails.length).toBeGreaterThan(0);
  });

  it('should find email by id', () => {
    const email = syncEngine.getEmailById('msg-1');
    expect(email).toBeDefined();
    expect(email?.fromName).toBe('Débora Xavier');
    expect(email?.category).toBe('legislacao');
  });

  it('should accurately handle search queries with accent-insensitivity', () => {
    const emails = syncEngine.getEmails();
    // Accent-insensitive search: 'debora' should match 'Débora Xavier'
    const matches = emails.filter(e => matchEmailSearch(e, 'debora'));
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some(m => m.id === 'msg-1')).toBe(true);
  });

  it('should handle natural query expansion for urgent emails without response', () => {
    const emails = syncEngine.getEmails();
    const matches1 = emails.filter(e => matchEmailSearch(e, 'emails urgentes sem resposta'));
    expect(matches1.length).toBeGreaterThan(0);
    expect(matches1.some(m => m.id === 'msg-2')).toBe(true);

    // Variation with hyphen
    const matches2 = emails.filter(e => matchEmailSearch(e, 'e-mails urgentes'));
    expect(matches2.length).toBeGreaterThan(0);
  });

  it('should handle natural query for invoices and suppliers', () => {
    const emails = syncEngine.getEmails();
    const invoices = emails.filter(e => matchEmailSearch(e, 'notas fiscais desta semana'));
    expect(invoices.length).toBeGreaterThan(0);
    expect(invoices.some(m => m.subject.toLowerCase().includes('nota fiscal'))).toBe(true);

    const suppliers = emails.filter(e => matchEmailSearch(e, 'mensagens de fornecedores'));
    expect(suppliers.length).toBeGreaterThan(0);
    for (const sup of suppliers) {
      expect(sup.category).toBe('fornecedores');
    }
  });

  it('should filter by category strictly', () => {
    const emails = syncEngine.getEmails();
    const legislacao = emails.filter(e => e.category === 'legislacao');
    expect(legislacao.length).toBeGreaterThan(0);
    for (const em of legislacao) {
      expect(em.category).toBe('legislacao');
    }
  });

  it('should filter by urgent priority correctly', () => {
    const emails = syncEngine.getEmails();
    const urgent = emails.filter(e => e.priority === 'p1');
    expect(urgent.length).toBeGreaterThan(0);
    expect(urgent[0].priority).toBe('p1');
  });

  it('should correctly toggle star on an email', () => {
    const email = syncEngine.getEmailById('msg-2');
    expect(email).toBeDefined();
    const initialStar = email!.isStarred;

    syncEngine.updateEmail('msg-2', { isStarred: !initialStar });
    const updated = syncEngine.getEmailById('msg-2');
    expect(updated?.isStarred).toBe(!initialStar);

    // revert
    syncEngine.updateEmail('msg-2', { isStarred: initialStar });
  });

  it('should mark email action as completed when replied', () => {
    const email = syncEngine.getEmailById('msg-2');
    expect(email?.actionRequired).toBe(true);

    syncEngine.updateEmail('msg-2', {
      actionRequired: false,
      actionLabel: undefined,
      statusLabel: 'Respondido',
    });

    const replied = syncEngine.getEmailById('msg-2');
    expect(replied?.actionRequired).toBe(false);
    expect(replied?.statusLabel).toBe('Respondido');

    // restore
    syncEngine.updateEmail('msg-2', {
      actionRequired: true,
      actionLabel: 'Ação necessária',
      statusLabel: 'Pendente resposta',
    });
  });

  it('should reset cache to default mock emails on demand', () => {
    syncEngine.resetCache();
    const emails = syncEngine.getEmails();
    expect(emails.length).toBeGreaterThan(0);
    expect(emails.some(e => e.id === 'msg-1')).toBe(true);
  });
});

describe('MIME Header Decoder (RFC 2047)', () => {
  it('should decode Base64 encoded UTF-8 strings correctly', () => {
    // "Débora Xavier" in RFC 2047 base64
    const encoded = '=?UTF-8?B?RMOpYm9yYSBYYXZpZXI=?=';
    const decoded = decodeMimeHeader(encoded);
    expect(decoded).toBe('Débora Xavier');
  });

  it('should decode Quoted-Printable strings correctly', () => {
    // "Leis Municipais" in RFC 2047 QP
    const encoded = '=?UTF-8?Q?Leis_Municipais?=';
    const decoded = decodeMimeHeader(encoded);
    expect(decoded).toBe('Leis Municipais');
  });

  it('should preserve regular ASCII headers without modification', () => {
    const plain = 'Re: Pedido de orcamento #4928';
    expect(decodeMimeHeader(plain)).toBe(plain);
  });

  it('should handle empty or invalid inputs gracefully', () => {
    expect(decodeMimeHeader('')).toBe('');
    expect(decodeMimeHeader('=?UTF-8?B?INVALID_B64!@#?=').length).toBeGreaterThan(0);
  });
});
