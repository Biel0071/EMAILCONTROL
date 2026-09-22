import { describe, it, expect } from 'vitest';
import { authService } from './auth';
import { syncEngine } from './syncEngine';

describe('Auth Service & Mode Management', () => {
  it('should initialize with status and indicate Google credentials state', () => {
    const status = authService.getStatus();
    expect(status).toHaveProperty('authenticated');
    expect(status).toHaveProperty('hasGoogleCredentials');
    expect(status).toHaveProperty('mode');
    expect(['live', 'mock']).toContain(status.mode);
  });

  it('should allow setting mode to mock', () => {
    authService.setMode('mock');
    expect(authService.getMode()).toBe('mock');
  });

  it('should support switching between personal and enterprise mock profiles', () => {
    authService.setMockProfile('personal');
    let status = authService.getStatus();
    expect(status.accountType).toBe('personal');
    expect(status.user?.email).toContain('@gmail.com');

    authService.setMockProfile('enterprise');
    status = authService.getStatus();
    expect(status.accountType).toBe('enterprise');
    expect(status.user?.email).toContain('iusnatura.com.br');
  });

  it('should reject setting mode to live if unauthenticated', () => {
    const status = authService.getStatus();
    if (!status.authenticated) {
      expect(() => authService.setMode('live')).toThrowError();
    }
  });
});

describe('Sync Engine', () => {
  it('should return initial synchronization progress structure', () => {
    const status = syncEngine.getStatus();
    expect(status).toHaveProperty('step');
    expect(status).toHaveProperty('percent');
    expect(status).toHaveProperty('totalEmails');
    expect(status).toHaveProperty('categoriesCount');
    expect(status).toHaveProperty('prioritiesCount');

    // Official 4 categories must be present
    expect(status.categoriesCount).toHaveProperty('clientes');
    expect(status.categoriesCount).toHaveProperty('financeiro');
    expect(status.categoriesCount).toHaveProperty('fornecedores');
    expect(status.categoriesCount).toHaveProperty('legislacao');

    // Official 4 priorities must be present
    expect(status.prioritiesCount).toHaveProperty('urgentes');
    expect(status.prioritiesCount).toHaveProperty('alta');
    expect(status.prioritiesCount).toHaveProperty('pendentes');
    expect(status.prioritiesCount).toHaveProperty('aguardando');
  });

  it('should provide cached emails with all required fields', () => {
    const emails = syncEngine.getEmails();
    expect(emails.length).toBeGreaterThan(0);

    const first = emails[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('fromName');
    expect(first).toHaveProperty('fromEmail');
    expect(first).toHaveProperty('subject');
    expect(first).toHaveProperty('snippet');
    expect(first).toHaveProperty('priority');
    expect(first).toHaveProperty('category');
    expect(first).toHaveProperty('insight');
  });

  it('should support updating email state', () => {
    const emails = syncEngine.getEmails();
    const target = emails[0];
    const initialRead = target.isRead;

    const updated = syncEngine.updateEmail(target.id, { isRead: !initialRead });
    expect(updated?.isRead).toBe(!initialRead);

    // restore
    syncEngine.updateEmail(target.id, { isRead: initialRead });
  });
});
