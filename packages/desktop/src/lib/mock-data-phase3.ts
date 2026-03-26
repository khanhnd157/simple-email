export interface PgpKey {
  id: string;
  fingerprint: string;
  userId: string;
  email: string;
  hasPrivate: boolean;
  createdAt: Date;
  expiresAt?: Date;
  trustLevel: 'unknown' | 'marginal' | 'full' | 'ultimate';
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color: string;
  location?: string;
  attendees: string[];
  recurring?: 'daily' | 'weekly' | 'monthly';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  list: string;
  createdAt: Date;
}

export interface ContactEntry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string;
  notes?: string;
  tags: string[];
  lastContacted?: Date;
}

export interface FilterRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: Array<{
    field: 'from' | 'to' | 'subject' | 'body';
    operator: 'contains' | 'equals' | 'startsWith' | 'endsWith';
    value: string;
  }>;
  actions: Array<{
    type: 'moveTo' | 'markRead' | 'star' | 'delete' | 'label';
    value?: string;
  }>;
}

const today = new Date();
const d = (daysOffset: number, hours = 9, mins = 0) => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, mins, 0, 0);
  return date;
};

export const PGP_KEYS: PgpKey[] = [
  {
    id: 'key-1', fingerprint: 'A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2',
    userId: 'John Doe', email: 'john.doe@company.com',
    hasPrivate: true, createdAt: d(-180), trustLevel: 'ultimate',
  },
  {
    id: 'key-2', fingerprint: 'F6E5D4C3B2A1F6E5D4C3B2A1F6E5D4C3B2A1F6E5',
    userId: 'Sarah Chen', email: 'sarah.chen@company.com',
    hasPrivate: false, createdAt: d(-90), trustLevel: 'full',
  },
  {
    id: 'key-3', fingerprint: '1234567890ABCDEF1234567890ABCDEF12345678',
    userId: 'Alex Rivera', email: 'alex.r@company.com',
    hasPrivate: false, createdAt: d(-60), expiresAt: d(300), trustLevel: 'marginal',
  },
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'ev-1', title: 'Sprint Planning', description: 'Q1 sprint planning session', start: d(0, 10, 0), end: d(0, 11, 30), allDay: false, color: '#3b82f6', location: 'Meeting Room A', attendees: ['sarah.chen@company.com', 'david.kim@company.com'] },
  { id: 'ev-2', title: 'Coffee with Lisa', description: '', start: d(1, 14, 0), end: d(1, 14, 30), allDay: false, color: '#10b981', attendees: ['lisa.wang@company.com'] },
  { id: 'ev-3', title: 'Architecture Review', description: 'Review notification service design', start: d(1, 10, 0), end: d(1, 11, 0), allDay: false, color: '#8b5cf6', location: 'Zoom', attendees: ['alex.r@company.com', 'sarah.chen@company.com'] },
  { id: 'ev-4', title: 'Company Holiday', description: 'National holiday', start: d(3, 0, 0), end: d(3, 23, 59), allDay: true, color: '#f59e0b', attendees: [] },
  { id: 'ev-5', title: 'Team Standup', description: 'Daily standup', start: d(0, 9, 0), end: d(0, 9, 15), allDay: false, color: '#6366f1', attendees: [], recurring: 'daily' },
  { id: 'ev-6', title: '1:1 with Manager', description: 'Weekly sync', start: d(2, 15, 0), end: d(2, 15, 30), allDay: false, color: '#ec4899', attendees: ['manager@company.com'], recurring: 'weekly' },
  { id: 'ev-7', title: 'Dentist Appointment', description: '', start: d(4, 11, 0), end: d(4, 12, 0), allDay: false, color: '#ef4444', attendees: [] },
  { id: 'ev-8', title: 'Product Demo', description: 'Demo new features to stakeholders', start: d(5, 14, 0), end: d(5, 15, 0), allDay: false, color: '#3b82f6', location: 'Main Conference Room', attendees: ['emily.park@company.com'] },
];

export const TASKS: Task[] = [
  { id: 't-1', title: 'Review API rate limiting PR', description: 'Check edge cases and load test results', dueDate: d(0), completed: false, priority: 'high', list: 'Work', createdAt: d(-2) },
  { id: 't-2', title: 'Update deployment docs', description: 'Document the new CI/CD pipeline', dueDate: d(2), completed: false, priority: 'medium', list: 'Work', createdAt: d(-5) },
  { id: 't-3', title: 'Fix login redirect bug on Safari', description: '', dueDate: d(-1), completed: true, priority: 'high', list: 'Work', createdAt: d(-7) },
  { id: 't-4', title: 'Prepare Q1 presentation slides', description: 'Include metrics and roadmap', dueDate: d(5), completed: false, priority: 'medium', list: 'Work', createdAt: d(-3) },
  { id: 't-5', title: 'Grocery shopping', description: 'Milk, eggs, bread, fruits', dueDate: d(1), completed: false, priority: 'low', list: 'Personal', createdAt: d(-1) },
  { id: 't-6', title: 'Book flight for vacation', description: 'Check prices for April trip', dueDate: d(7), completed: false, priority: 'medium', list: 'Personal', createdAt: d(-4) },
  { id: 't-7', title: 'Renew gym membership', description: '', dueDate: d(-3), completed: true, priority: 'low', list: 'Personal', createdAt: d(-10) },
  { id: 't-8', title: 'Code review: payment module', description: 'Review Sarah\'s PR #342', completed: true, priority: 'high', list: 'Work', createdAt: d(-6) },
];

export const CONTACTS: ContactEntry[] = [
  { id: 'c-1', name: 'Sarah Chen', email: 'sarah.chen@company.com', phone: '+1 555-0101', company: 'Acme Corp', tags: ['work', 'engineering'], lastContacted: d(-1) },
  { id: 'c-2', name: 'Emily Park', email: 'emily.park@company.com', phone: '+1 555-0102', company: 'Acme Corp', tags: ['work', 'design'], lastContacted: d(0) },
  { id: 'c-3', name: 'David Kim', email: 'david.kim@company.com', company: 'Acme Corp', tags: ['work', 'engineering'], lastContacted: d(-1) },
  { id: 'c-4', name: 'Alex Rivera', email: 'alex.r@company.com', phone: '+1 555-0104', company: 'Acme Corp', tags: ['work', 'backend'], lastContacted: d(-3) },
  { id: 'c-5', name: 'Lisa Wang', email: 'lisa.wang@company.com', company: 'Acme Corp', tags: ['work', 'product'], lastContacted: d(-2) },
  { id: 'c-6', name: 'Mike Johnson', email: 'mike.j@company.com', phone: '+1 555-0106', company: 'Acme Corp', tags: ['work', 'management'], lastContacted: d(-5) },
  { id: 'c-7', name: 'Mom', email: 'mom@gmail.com', phone: '+1 555-9999', tags: ['family'], lastContacted: d(-2) },
  { id: 'c-8', name: 'Tom Baker', email: 'tom.baker@external.io', company: 'Partner Inc', tags: ['client'], notes: 'Main contact for the Partnership project', lastContacted: d(-14) },
];

export const FILTER_RULES: FilterRule[] = [
  {
    id: 'fr-1', name: 'GitHub Notifications', enabled: true,
    conditions: [{ field: 'from', operator: 'contains', value: 'github.com' }],
    actions: [{ type: 'moveTo', value: 'Notifications' }, { type: 'markRead' }],
  },
  {
    id: 'fr-2', name: 'Invoices', enabled: true,
    conditions: [{ field: 'subject', operator: 'contains', value: 'invoice' }],
    actions: [{ type: 'label', value: 'Finance' }, { type: 'star' }],
  },
  {
    id: 'fr-3', name: 'Newsletter Cleanup', enabled: false,
    conditions: [{ field: 'subject', operator: 'contains', value: 'unsubscribe' }],
    actions: [{ type: 'delete' }],
  },
];
