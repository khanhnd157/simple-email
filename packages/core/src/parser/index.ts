import { simpleParser, type ParsedMail, type AddressObject } from 'mailparser';
import { v4 as uuid } from 'uuid';
import type { Message, Address, Attachment, MessagePriority } from '../types/index.js';

function extractAddresses(field: AddressObject | AddressObject[] | undefined): Address[] {
  if (!field) return [];
  const list = Array.isArray(field) ? field : [field];
  const result: Address[] = [];
  for (const group of list) {
    if (group.value) {
      for (const addr of group.value) {
        result.push({
          name: addr.name || '',
          address: addr.address || '',
        });
      }
    }
  }
  return result;
}

function extractPriority(headers: ParsedMail['headers']): MessagePriority {
  const priority = headers.get('x-priority');
  if (typeof priority === 'string') {
    const num = parseInt(priority, 10);
    if (num <= 2) return 'high';
    if (num >= 4) return 'low';
  }
  return 'normal';
}

function createSnippet(text: string | undefined, maxLen = 200): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

export async function parseEmail(
  source: Buffer | string,
  meta?: { accountId?: string; folderId?: string; uid?: number },
): Promise<{ message: Omit<Message, 'id'>; attachments: Omit<Attachment, 'id' | 'messageId'>[] }> {
  const parsed = await simpleParser(source);

  const from = extractAddresses(parsed.from);
  const to = extractAddresses(parsed.to);
  const cc = extractAddresses(parsed.cc);
  const bcc = extractAddresses(parsed.bcc);
  const replyTo = extractAddresses(parsed.replyTo);

  const attachmentList: Omit<Attachment, 'id' | 'messageId'>[] = (parsed.attachments || []).map(
    (att) => ({
      filename: att.filename || 'unnamed',
      contentType: att.contentType,
      size: att.size,
      contentId: att.contentId || undefined,
      content: Buffer.from(att.content),
    }),
  );

  const headers: Record<string, string> = {};
  for (const [key, value] of parsed.headers) {
    if (typeof value === 'string') {
      headers[key] = value;
    }
  }

  const message: Omit<Message, 'id'> = {
    accountId: meta?.accountId ?? '',
    folderId: meta?.folderId ?? '',
    uid: meta?.uid ?? 0,
    messageId: parsed.messageId || '',
    subject: parsed.subject || '',
    from,
    to,
    cc,
    bcc,
    replyTo,
    date: parsed.date || new Date(),
    snippet: createSnippet(parsed.text),
    bodyHtml: parsed.html || '',
    bodyText: parsed.text || '',
    isRead: false,
    isStarred: false,
    isAnswered: false,
    isDraft: false,
    hasAttachments: attachmentList.length > 0,
    attachments: [],
    headers,
    priority: extractPriority(parsed.headers),
    inReplyTo: typeof parsed.inReplyTo === 'string' ? parsed.inReplyTo : undefined,
    references: Array.isArray(parsed.references)
      ? parsed.references
      : parsed.references
        ? [parsed.references]
        : [],
    size: typeof source === 'string' ? Buffer.byteLength(source) : source.length,
  };

  return { message, attachments: attachmentList };
}

export function generateMessageId(domain: string): string {
  return `<${uuid()}@${domain}>`;
}
