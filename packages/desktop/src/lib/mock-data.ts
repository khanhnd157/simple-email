export interface Account {
  id: string;
  name: string;
  email: string;
}

export interface Folder {
  id: string;
  accountId: string;
  name: string;
  path: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'junk' | 'archive' | 'custom';
  unreadCount: number;
  totalCount: number;
}

export interface Address {
  name: string;
  address: string;
}

export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface Message {
  id: string;
  accountId: string;
  folderId: string;
  subject: string;
  from: Address[];
  to: Address[];
  cc: Address[];
  date: Date;
  snippet: string;
  bodyHtml: string;
  bodyText: string;
  isRead: boolean;
  isStarred: boolean;
  isAnswered: boolean;
  hasAttachments: boolean;
  attachments: Attachment[];
}

export const ACCOUNTS: Account[] = [
  { id: 'acc-1', name: 'Work', email: 'john.doe@company.com' },
  { id: 'acc-2', name: 'Personal', email: 'john.doe@gmail.com' },
];

export const FOLDERS: Folder[] = [
  { id: 'f-1', accountId: 'acc-1', name: 'Inbox', path: 'INBOX', type: 'inbox', unreadCount: 3, totalCount: 24 },
  { id: 'f-2', accountId: 'acc-1', name: 'Sent', path: 'Sent', type: 'sent', unreadCount: 0, totalCount: 156 },
  { id: 'f-3', accountId: 'acc-1', name: 'Drafts', path: 'Drafts', type: 'drafts', unreadCount: 0, totalCount: 2 },
  { id: 'f-4', accountId: 'acc-1', name: 'Trash', path: 'Trash', type: 'trash', unreadCount: 0, totalCount: 8 },
  { id: 'f-5', accountId: 'acc-1', name: 'Archive', path: 'Archive', type: 'archive', unreadCount: 0, totalCount: 430 },
  { id: 'f-6', accountId: 'acc-1', name: 'Junk', path: 'Junk', type: 'junk', unreadCount: 0, totalCount: 12 },
  { id: 'f-7', accountId: 'acc-2', name: 'Inbox', path: 'INBOX', type: 'inbox', unreadCount: 5, totalCount: 89 },
  { id: 'f-8', accountId: 'acc-2', name: 'Sent', path: 'Sent', type: 'sent', unreadCount: 0, totalCount: 45 },
  { id: 'f-9', accountId: 'acc-2', name: 'Drafts', path: 'Drafts', type: 'drafts', unreadCount: 0, totalCount: 1 },
  { id: 'f-10', accountId: 'acc-2', name: 'Trash', path: 'Trash', type: 'trash', unreadCount: 0, totalCount: 3 },
];

const today = new Date();
const d = (daysAgo: number, hours = 9, mins = 0) => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, mins, 0, 0);
  return date;
};

export const MESSAGES: Message[] = [
  {
    id: 'm-1', accountId: 'acc-1', folderId: 'f-1',
    subject: 'Q1 2026 Product Roadmap Review',
    from: [{ name: 'Sarah Chen', address: 'sarah.chen@company.com' }],
    to: [{ name: 'John Doe', address: 'john.doe@company.com' }],
    cc: [{ name: 'Mike Johnson', address: 'mike.j@company.com' }],
    date: d(0, 14, 30), snippet: 'Hi team, I\'ve attached the updated Q1 roadmap for review. Please take a look and share your feedback...',
    bodyHtml: `<div style="font-family: -apple-system, sans-serif; line-height: 1.6;">
      <p>Hi team,</p>
      <p>I've attached the updated Q1 roadmap for review. Please take a look and share your feedback before our meeting on Friday.</p>
      <p>Key highlights:</p>
      <ul>
        <li>Mobile app v2.0 launch scheduled for March 15</li>
        <li>New analytics dashboard - design phase complete</li>
        <li>API v3 migration - 70% complete</li>
        <li>Performance improvements target: 40% faster load times</li>
      </ul>
      <p>Let me know if you have any questions.</p>
      <p>Best,<br>Sarah</p>
    </div>`,
    bodyText: 'Hi team, I\'ve attached the updated Q1 roadmap...',
    isRead: false, isStarred: true, isAnswered: false,
    hasAttachments: true,
    attachments: [
      { id: 'a-1', filename: 'Q1-Roadmap-2026.pdf', contentType: 'application/pdf', size: 2457600 },
      { id: 'a-2', filename: 'timeline.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 184320 },
    ],
  },
  {
    id: 'm-2', accountId: 'acc-1', folderId: 'f-1',
    subject: 'Re: Design System Update - Component Library v3',
    from: [{ name: 'Emily Park', address: 'emily.park@company.com' }],
    to: [{ name: 'John Doe', address: 'john.doe@company.com' }],
    cc: [],
    date: d(0, 11, 15), snippet: 'Great news! The new component library is ready for testing. I\'ve deployed it to the staging environment...',
    bodyHtml: `<div style="font-family: -apple-system, sans-serif; line-height: 1.6;">
      <p>Great news! The new component library is ready for testing.</p>
      <p>I've deployed it to the staging environment. You can check it out at <a href="#">staging.components.internal</a>.</p>
      <p>Changes include:</p>
      <ol>
        <li>Updated color tokens for better accessibility (WCAG AAA)</li>
        <li>New DatePicker and TimePicker components</li>
        <li>Improved Table component with virtual scrolling</li>
        <li>Dark mode support across all components</li>
      </ol>
      <p>Would love your feedback!</p>
      <p>Thanks,<br>Emily</p>
    </div>`,
    bodyText: 'Great news! The new component library is ready for testing...',
    isRead: false, isStarred: false, isAnswered: false,
    hasAttachments: false, attachments: [],
  },
  {
    id: 'm-3', accountId: 'acc-1', folderId: 'f-1',
    subject: 'Weekly Standup Notes - March 24',
    from: [{ name: 'David Kim', address: 'david.kim@company.com' }],
    to: [{ name: 'Engineering Team', address: 'eng-team@company.com' }],
    cc: [],
    date: d(1, 16, 0), snippet: 'Here are the notes from today\'s standup. Action items highlighted in bold...',
    bodyHtml: `<div style="font-family: -apple-system, sans-serif; line-height: 1.6;">
      <p>Here are the notes from today's standup:</p>
      <h3>Completed</h3>
      <ul>
        <li>Authentication service migration (David)</li>
        <li>Bug fix: Login redirect loop on Safari (Alex)</li>
        <li>Code review for payment module (Sarah)</li>
      </ul>
      <h3>In Progress</h3>
      <ul>
        <li><strong>API rate limiting implementation - needs review by EOD Wednesday</strong></li>
        <li>Database index optimization for search queries</li>
        <li>E2E test coverage for checkout flow</li>
      </ul>
      <h3>Blockers</h3>
      <ul>
        <li>Waiting for DevOps to provision staging DB replica</li>
      </ul>
      <p>Next standup: Thursday 10 AM</p>
    </div>`,
    bodyText: 'Here are the notes from today\'s standup...',
    isRead: true, isStarred: false, isAnswered: false,
    hasAttachments: false, attachments: [],
  },
  {
    id: 'm-4', accountId: 'acc-1', folderId: 'f-1',
    subject: 'Invoice #INV-2026-0342',
    from: [{ name: 'AWS Billing', address: 'billing@aws.amazon.com' }],
    to: [{ name: 'John Doe', address: 'john.doe@company.com' }],
    cc: [],
    date: d(1, 8, 0), snippet: 'Your AWS invoice for the period ending March 23, 2026 is now available. Total: $4,287.50...',
    bodyHtml: `<div style="font-family: -apple-system, sans-serif; line-height: 1.6;">
      <h2>AWS Invoice</h2>
      <p>Your invoice for the billing period <strong>Feb 24 - Mar 23, 2026</strong> is now available.</p>
      <table style="border-collapse: collapse; width: 100%; margin: 1em 0;">
        <tr style="border-bottom: 2px solid #e5e7eb;">
          <th style="text-align: left; padding: 8px;">Service</th>
          <th style="text-align: right; padding: 8px;">Amount</th>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px;">EC2 Instances</td>
          <td style="text-align: right; padding: 8px;">$2,145.00</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px;">RDS</td>
          <td style="text-align: right; padding: 8px;">$1,230.50</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px;">S3 Storage</td>
          <td style="text-align: right; padding: 8px;">$412.00</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px;">Other</td>
          <td style="text-align: right; padding: 8px;">$500.00</td>
        </tr>
        <tr style="font-weight: bold;">
          <td style="padding: 8px;">Total</td>
          <td style="text-align: right; padding: 8px;">$4,287.50</td>
        </tr>
      </table>
    </div>`,
    bodyText: 'Your AWS invoice for the period ending March 23, 2026 is now available.',
    isRead: true, isStarred: false, isAnswered: false,
    hasAttachments: true,
    attachments: [{ id: 'a-3', filename: 'INV-2026-0342.pdf', contentType: 'application/pdf', size: 524288 }],
  },
  {
    id: 'm-5', accountId: 'acc-1', folderId: 'f-1',
    subject: 'Coffee chat next week?',
    from: [{ name: 'Lisa Wang', address: 'lisa.wang@company.com' }],
    to: [{ name: 'John Doe', address: 'john.doe@company.com' }],
    cc: [],
    date: d(2, 15, 45), snippet: 'Hey John! It\'s been a while since we caught up. Want to grab coffee next Tuesday?',
    bodyHtml: `<div style="font-family: -apple-system, sans-serif; line-height: 1.6;">
      <p>Hey John!</p>
      <p>It's been a while since we caught up. Want to grab coffee next Tuesday? I'd love to hear about the new email project you've been working on.</p>
      <p>How about 2 PM at the usual spot?</p>
      <p>Cheers,<br>Lisa</p>
    </div>`,
    bodyText: 'Hey John! It\'s been a while since we caught up...',
    isRead: false, isStarred: false, isAnswered: false,
    hasAttachments: false, attachments: [],
  },
  {
    id: 'm-6', accountId: 'acc-1', folderId: 'f-1',
    subject: 'Security Alert: New login from Windows',
    from: [{ name: 'GitHub', address: 'noreply@github.com' }],
    to: [{ name: 'John Doe', address: 'john.doe@company.com' }],
    cc: [],
    date: d(3, 7, 22), snippet: 'A new login to your GitHub account was detected from a Windows device...',
    bodyHtml: `<div style="font-family: -apple-system, sans-serif; line-height: 1.6;">
      <p>Hi @johndoe,</p>
      <p>We detected a new sign-in to your account.</p>
      <ul>
        <li><strong>Device:</strong> Windows 11</li>
        <li><strong>Browser:</strong> Chrome 124</li>
        <li><strong>Location:</strong> Ho Chi Minh City, Vietnam</li>
        <li><strong>Time:</strong> Mar 23, 2026 at 7:22 AM</li>
      </ul>
      <p>If this was you, you can ignore this message. If not, please secure your account immediately.</p>
    </div>`,
    bodyText: 'A new login to your GitHub account was detected...',
    isRead: true, isStarred: false, isAnswered: false,
    hasAttachments: false, attachments: [],
  },
  {
    id: 'm-7', accountId: 'acc-1', folderId: 'f-1',
    subject: 'Re: Backend Architecture Discussion',
    from: [{ name: 'Alex Rivera', address: 'alex.r@company.com' }],
    to: [{ name: 'John Doe', address: 'john.doe@company.com' }],
    cc: [{ name: 'Sarah Chen', address: 'sarah.chen@company.com' }],
    date: d(3, 13, 10), snippet: 'I agree with your proposal to use event-driven architecture for the notification service...',
    bodyHtml: `<div style="font-family: -apple-system, sans-serif; line-height: 1.6;">
      <p>I agree with your proposal to use event-driven architecture for the notification service. Here are my thoughts:</p>
      <ol>
        <li>RabbitMQ would be a solid choice for the message broker</li>
        <li>We should implement dead letter queues from the start</li>
        <li>Circuit breaker pattern for external service calls</li>
      </ol>
      <p>Let's set up a meeting to finalize the design doc.</p>
      <p>—Alex</p>
      <blockquote style="border-left: 3px solid #ccc; padding-left: 12px; color: #666; margin: 1em 0;">
        <p>On Mar 22, John Doe wrote:<br>I think we should consider moving to an event-driven architecture...</p>
      </blockquote>
    </div>`,
    bodyText: 'I agree with your proposal...',
    isRead: true, isStarred: true, isAnswered: true,
    hasAttachments: false, attachments: [],
  },
  {
    id: 'm-8', accountId: 'acc-1', folderId: 'f-1',
    subject: 'Team Outing - Vote for Activity',
    from: [{ name: 'HR Team', address: 'hr@company.com' }],
    to: [{ name: 'All Staff', address: 'all@company.com' }],
    cc: [],
    date: d(4, 10, 0), snippet: 'Please vote for your preferred team outing activity for April. Options: bowling, escape room, karaoke...',
    bodyHtml: `<div style="font-family: -apple-system, sans-serif; line-height: 1.6;">
      <p>Hi everyone!</p>
      <p>It's time to vote for our April team outing! Please select your preferred activity:</p>
      <ol>
        <li>🎳 Bowling Night</li>
        <li>🔐 Escape Room Challenge</li>
        <li>🎤 Karaoke Party</li>
        <li>🎨 Painting Workshop</li>
      </ol>
      <p>Reply with your choice by March 28. The winning activity will be announced on April 1.</p>
      <p>— HR Team</p>
    </div>`,
    bodyText: 'Please vote for your preferred team outing activity...',
    isRead: true, isStarred: false, isAnswered: true,
    hasAttachments: false, attachments: [],
  },
];
