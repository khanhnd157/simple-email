import { create } from 'zustand';
import {
  CALENDAR_EVENTS, TASKS, CONTACTS, PGP_KEYS, FILTER_RULES,
  type CalendarEvent, type Task, type ContactEntry, type PgpKey, type FilterRule,
} from '@/lib/mock-data-phase3';

export type AppView = 'mail' | 'calendar' | 'tasks' | 'contacts';
export type ThemeMode = 'light' | 'dark' | 'system';

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('simple-email-theme', mode);
}

interface AppState {
  currentView: AppView;
  setView: (view: AppView) => void;

  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;

  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;

  pgpKeys: PgpKey[];
  keyManagerOpen: boolean;
  openKeyManager: () => void;
  closeKeyManager: () => void;

  calendarEvents: CalendarEvent[];
  selectedDate: Date;
  calendarView: 'month' | 'week';
  eventDialogOpen: boolean;
  editingEvent: CalendarEvent | null;
  setSelectedDate: (date: Date) => void;
  setCalendarView: (view: 'month' | 'week') => void;
  openEventDialog: (event?: CalendarEvent) => void;
  closeEventDialog: () => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  tasks: Task[];
  taskFilter: 'all' | 'active' | 'completed';
  setTaskFilter: (f: 'all' | 'active' | 'completed') => void;
  toggleTask: (id: string) => void;
  addTask: (task: Task) => void;
  deleteTask: (id: string) => void;

  contacts: ContactEntry[];
  contactSearch: string;
  selectedContactId: string | null;
  contactDialogOpen: boolean;
  editingContact: ContactEntry | null;
  setContactSearch: (q: string) => void;
  selectContact: (id: string | null) => void;
  openContactDialog: (contact?: ContactEntry) => void;
  closeContactDialog: () => void;
  addContact: (contact: ContactEntry) => void;
  updateContact: (id: string, data: Partial<ContactEntry>) => void;
  deleteContact: (id: string) => void;

  filterRules: FilterRule[];
  filterDialogOpen: boolean;
  editingFilter: FilterRule | null;
  openFilterDialog: (rule?: FilterRule) => void;
  closeFilterDialog: () => void;
  toggleFilter: (id: string) => void;
  addFilter: (rule: FilterRule) => void;
  deleteFilter: (id: string) => void;
}

const savedTheme = (localStorage.getItem('simple-email-theme') as ThemeMode) || 'light';
applyTheme(savedTheme);

if (savedTheme === 'system') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = useAppStore.getState().theme;
    if (current === 'system') applyTheme('system');
  });
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'mail',
  setView: (view) => set({ currentView: view }),

  theme: savedTheme,
  setTheme: (mode) => { applyTheme(mode); set({ theme: mode }); },

  settingsOpen: false,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),

  pgpKeys: PGP_KEYS,
  keyManagerOpen: false,
  openKeyManager: () => set({ keyManagerOpen: true }),
  closeKeyManager: () => set({ keyManagerOpen: false }),

  calendarEvents: CALENDAR_EVENTS,
  selectedDate: new Date(),
  calendarView: 'month',
  eventDialogOpen: false,
  editingEvent: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  setCalendarView: (view) => set({ calendarView: view }),
  openEventDialog: (event) => set({ eventDialogOpen: true, editingEvent: event ?? null }),
  closeEventDialog: () => set({ eventDialogOpen: false, editingEvent: null }),
  addEvent: (event) => set((s) => ({ calendarEvents: [...s.calendarEvents, event] })),
  updateEvent: (id, data) => set((s) => ({
    calendarEvents: s.calendarEvents.map((e) => (e.id === id ? { ...e, ...data } : e)),
  })),
  deleteEvent: (id) => set((s) => ({
    calendarEvents: s.calendarEvents.filter((e) => e.id !== id),
  })),

  tasks: TASKS,
  taskFilter: 'all',
  setTaskFilter: (f) => set({ taskFilter: f }),
  toggleTask: (id) => set((s) => ({
    tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
  })),
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  contacts: CONTACTS,
  contactSearch: '',
  selectedContactId: null,
  contactDialogOpen: false,
  editingContact: null,
  setContactSearch: (q) => set({ contactSearch: q }),
  selectContact: (id) => set({ selectedContactId: id }),
  openContactDialog: (contact) => set({ contactDialogOpen: true, editingContact: contact ?? null }),
  closeContactDialog: () => set({ contactDialogOpen: false, editingContact: null }),
  addContact: (contact) => set((s) => ({ contacts: [...s.contacts, contact] })),
  updateContact: (id, data) => set((s) => ({
    contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...data } : c)),
  })),
  deleteContact: (id) => set((s) => ({
    contacts: s.contacts.filter((c) => c.id !== id),
    selectedContactId: s.selectedContactId === id ? null : s.selectedContactId,
  })),

  filterRules: FILTER_RULES,
  filterDialogOpen: false,
  editingFilter: null,
  openFilterDialog: (rule) => set({ filterDialogOpen: true, editingFilter: rule ?? null }),
  closeFilterDialog: () => set({ filterDialogOpen: false, editingFilter: null }),
  toggleFilter: (id) => set((s) => ({
    filterRules: s.filterRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
  })),
  addFilter: (rule) => set((s) => ({ filterRules: [...s.filterRules, rule] })),
  deleteFilter: (id) => set((s) => ({ filterRules: s.filterRules.filter((r) => r.id !== id) })),
}));
