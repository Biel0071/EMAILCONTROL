import { google } from 'googleapis';
import { authService } from './auth.ts';
import { analyzeEmail } from './aiEngine.ts';
import type { EmailItem, EmailAttachment } from '../src/types/index.ts';

/**
 * Decodes RFC 2047 MIME encoded-word syntax (e.g. =?utf-8?B?...?= or =?iso-8859-1?Q?...?=)
 */
export function decodeMimeHeader(text: string): string {
  if (!text) return '';
  // Pattern matches RFC 2047 encoded words: =?charset?encoding?encoded_text?=
  return text.replace(/=\?([^?]+)\?([bBqQ])\?([^?]+)\?=/g, (_, charset, encoding, encodedText) => {
    try {
      const enc = encoding.toUpperCase();
      if (enc === 'B') {
        return Buffer.from(encodedText, 'base64').toString((charset.toLowerCase() as BufferEncoding) || 'utf-8');
      } else if (enc === 'Q') {
        // Quoted-printable: _ represents space, =XX represents hex code
        const hexDecoded = encodedText
          .replace(/_/g, ' ')
          .replace(/=([0-9A-Fa-f]{2})/g, (_m: string, hex: string) => String.fromCharCode(parseInt(hex, 16)));
        return Buffer.from(hexDecoded, 'latin1').toString((charset.toLowerCase() as BufferEncoding) || 'utf-8');
      }
    } catch {
      return encodedText;
    }
    return encodedText;
  });
}

/**
 * Strips styles, scripts, comments and HTML tags into clean, human-readable text
 */
export function cleanHtmlToText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[\u200B-\u200D\uFEFF\u034F\u200E\u200F]/g, '')
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join('\n')
    .trim();
}

export class GmailClient {
  private getGmail() {
    const auth = authService.getOAuthClient();
    if (!auth) {
      throw new Error('Google OAuth client not authenticated.');
    }
    return google.gmail({ version: 'v1', auth });
  }

  public async getProfile() {
    const gmail = this.getGmail();
    const res = await gmail.users.getProfile({ userId: 'me' });
    return res.data;
  }

  public async listMessages(options: {
    q?: string;
    maxResults?: number;
    pageToken?: string;
    labelIds?: string[];
  } = {}) {
    const gmail = this.getGmail();
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: options.q,
      maxResults: options.maxResults || 50,
      pageToken: options.pageToken,
      labelIds: options.labelIds,
    });
    return res.data;
  }

  public async getMessage(messageId: string): Promise<EmailItem> {
    const gmail = this.getGmail();
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const msg = res.data;
    const headers = msg.payload?.headers || [];

    const getHeader = (name: string) => {
      const h = headers.find(item => item.name?.toLowerCase() === name.toLowerCase());
      return h ? h.value || '' : '';
    };

    const fromRaw = decodeMimeHeader(getHeader('From'));
    let fromName = fromRaw;
    let fromEmail = fromRaw;
    const emailMatch = fromRaw.match(/(.*)<(.+@.+)>/);
    if (emailMatch) {
      fromName = emailMatch[1].trim().replace(/^["']|["']$/g, '');
      fromEmail = emailMatch[2].trim();
    } else if (fromRaw.includes('@')) {
      fromEmail = fromRaw.trim();
      fromName = fromEmail.split('@')[0];
    }

    const to = decodeMimeHeader(getHeader('To'));
    const subject = decodeMimeHeader(getHeader('Subject')) || '(Sem assunto)';
    const dateRaw = getHeader('Date');
    const timestamp = msg.internalDate ? parseInt(msg.internalDate, 10) : (dateRaw ? new Date(dateRaw).getTime() : Date.now());

    // Extract body and attachments
    const { bodyText, bodyHtml, attachments } = this.extractBodyAndAttachments(msg.payload);

    const isRead = !(msg.labelIds?.includes('UNREAD') ?? false);
    const isStarred = msg.labelIds?.includes('STARRED') ?? false;

    // Run AI analysis
    const insight = analyzeEmail({
      subject,
      body: bodyText,
      snippet: msg.snippet || '',
      fromName,
      fromEmail,
    });

    let priority = 'p3' as const;
    if (insight.prioridade === 'Urgente') priority = 'p1';
    else if (insight.prioridade === 'Alta') priority = 'p2';
    else if (insight.prioridade === 'Baixa') priority = 'p4';

    // Format readable date
    const d = new Date(timestamp);
    const today = new Date();
    let displayDate = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    if (d.toDateString() !== today.toDateString()) {
      displayDate = `${d.getDate()} ${d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}`;
    }

    return {
      id: msg.id || messageId,
      threadId: msg.threadId || messageId,
      fromName,
      fromEmail,
      to,
      subject,
      snippet: msg.snippet || bodyText.slice(0, 140),
      body: bodyText,
      bodyHtml: bodyHtml || undefined,
      date: displayDate,
      timestamp,
      isRead,
      isStarred,
      priority,
      category: insight.categoria,
      actionRequired: insight.acaoNecessaria,
      actionLabel: insight.acaoNecessaria ? (insight.acaoDescricao || 'Ação necessária') : undefined,
      statusLabel: undefined,
      hasAttachments: attachments.length > 0,
      attachments,
      insight,
      gmailLink: `https://mail.google.com/mail/u/0/#inbox/${msg.id || messageId}`,
    };
  }

  private extractBodyAndAttachments(payload: any): {
    bodyText: string;
    bodyHtml: string;
    attachments: EmailAttachment[];
  } {
    let bodyText = '';
    let bodyHtml = '';
    const attachments: EmailAttachment[] = [];

    const decodeBase64 = (encoded: string) => {
      try {
        const buff = Buffer.from(encoded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
        return buff.toString('utf-8');
      } catch {
        return '';
      }
    };

    const traversePart = (part: any) => {
      if (!part) return;

      const mime = part.mimeType || '';
      const filename = part.filename;
      const body = part.body;

      if (filename && body && body.attachmentId) {
        const sizeKb = body.size ? Math.round(body.size / 1024) : 0;
        const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
        attachments.push({
          id: body.attachmentId,
          name: filename,
          size: sizeStr,
          mimeType: mime,
        });
      }

      if (mime === 'text/plain' && body && body.data && !bodyText) {
        bodyText = decodeBase64(body.data);
      } else if (mime === 'text/html' && body && body.data && !bodyHtml) {
        bodyHtml = decodeBase64(body.data);
      }

      if (part.parts && Array.isArray(part.parts)) {
        for (const subPart of part.parts) {
          traversePart(subPart);
        }
      }
    };

    traversePart(payload);

    if (!bodyText && bodyHtml) {
      bodyText = cleanHtmlToText(bodyHtml);
    }

    return { bodyText, bodyHtml, attachments };
  }

  public async getAttachment(messageId: string, attachmentId: string): Promise<{ data: Buffer }> {
    const gmail = this.getGmail();
    const res = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId,
    });
    const base64Data = res.data.data ? res.data.data.replace(/-/g, '+').replace(/_/g, '/') : '';
    const buffer = Buffer.from(base64Data, 'base64');
    return { data: buffer };
  }

  public async archiveMessage(messageId: string): Promise<void> {
    const gmail = this.getGmail();
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['INBOX'],
      },
    });
  }

  public async trashMessage(messageId: string): Promise<void> {
    const gmail = this.getGmail();
    await gmail.users.messages.trash({
      userId: 'me',
      id: messageId,
    });
  }

  public async markAsRead(messageId: string): Promise<void> {
    const gmail = this.getGmail();
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
  }

  public async markAsUnread(messageId: string): Promise<void> {
    const gmail = this.getGmail();
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: ['UNREAD'],
      },
    });
  }

  public async toggleStar(messageId: string, star: boolean): Promise<void> {
    const gmail = this.getGmail();
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        [star ? 'addLabelIds' : 'removeLabelIds']: ['STARRED'],
      },
    });
  }

  public async sendMessage(options: {
    to: string;
    subject: string;
    body: string;
    threadId?: string;
  }) {
    const gmail = this.getGmail();
    const utf8Subject = `=?utf-8?B?${Buffer.from(options.subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${options.to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      options.body,
    ];
    const message = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: options.threadId,
      },
    });

    return res.data;
  }
}

export const gmailClient = new GmailClient();
