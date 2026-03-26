import nodemailer, { type Transporter } from 'nodemailer';
import type { AccountConfig, SendMailOptions } from '../types/index.js';

export class SmtpClient {
  private transporter: Transporter | null = null;
  private config: AccountConfig;

  constructor(config: AccountConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    const options: nodemailer.TransportOptions & Record<string, unknown> = {
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: this.config.smtpSecure,
      auth: {
        user: this.config.username,
        pass: this.config.password,
      },
    };

    if (this.config.authType === 'oauth2' && this.config.accessToken) {
      options.auth = {
        type: 'OAuth2',
        user: this.config.username,
        accessToken: this.config.accessToken,
      };
    }

    this.transporter = nodemailer.createTransport(options);
  }

  async verify(): Promise<boolean> {
    if (!this.transporter) throw new Error('SMTP client not connected');
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }

  async send(options: SendMailOptions): Promise<{ messageId: string; accepted: string[] }> {
    if (!this.transporter) throw new Error('SMTP client not connected');

    const mailOptions: nodemailer.SendMailOptions = {
      from: formatAddress(options.from),
      to: options.to.map(formatAddress),
      cc: options.cc?.map(formatAddress),
      bcc: options.bcc?.map(formatAddress),
      replyTo: options.replyTo ? formatAddress(options.replyTo) : undefined,
      subject: options.subject,
      html: options.bodyHtml,
      text: options.bodyText,
      inReplyTo: options.inReplyTo,
      references: options.references?.join(' '),
      priority: options.priority === 'high' ? 'high' : options.priority === 'low' ? 'low' : 'normal',
      headers: options.headers,
      attachments: options.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
        cid: a.contentId,
      })),
    };

    const info = await this.transporter.sendMail(mailOptions);
    return {
      messageId: info.messageId,
      accepted: (info.accepted || []) as string[],
    };
  }

  async disconnect(): Promise<void> {
    if (this.transporter) {
      this.transporter.close();
      this.transporter = null;
    }
  }
}

function formatAddress(addr: { name: string; address: string }): string {
  if (addr.name) {
    return `"${addr.name}" <${addr.address}>`;
  }
  return addr.address;
}
