import { useMemo } from 'react';
import {
  Search, Plus, Mail, Phone, Building2, Tag, Trash2, Edit, User,
} from 'lucide-react';
import { cn, getInitials, getAvatarColor } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import type { ContactEntry } from '@/lib/mock-data-phase3';

function ContactRow({ contact, selected }: { contact: ContactEntry; selected: boolean }) {
  const { selectContact, deleteContact } = useAppStore();

  return (
    <div
      onClick={() => selectContact(contact.id)}
      className={cn(
        'group flex items-center gap-3 cursor-pointer border-b border-gray-100 dark:border-navy-800 px-4 py-2.5 transition-colors',
        selected ? 'bg-primary-50 dark:bg-navy-800' : 'hover:bg-gray-50 dark:hover:bg-navy-850',
      )}
    >
      <div className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
        getAvatarColor(contact.name),
      )}>
        {getInitials(contact.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-navy-100 truncate">{contact.name}</p>
        <p className="text-xs text-gray-400 dark:text-navy-400 truncate">{contact.email}</p>
      </div>
      {contact.tags.length > 0 && (
        <span className="hidden group-hover:hidden lg:inline-flex items-center rounded-full bg-gray-100 dark:bg-navy-850 px-2 py-0.5 text-[10px] text-gray-500 dark:text-navy-400">
          {contact.tags[0]}
        </span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); deleteContact(contact.id); }}
        className="shrink-0 rounded p-1 text-gray-300 dark:text-navy-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function ContactDetail({ contact }: { contact: ContactEntry }) {
  const { openContactDialog } = useAppStore();

  return (
    <div className="p-6 dark:bg-navy-950">
      <div className="flex items-start gap-4">
        <div className={cn(
          'flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white',
          getAvatarColor(contact.name),
        )}>
          {getInitials(contact.name)}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-navy-100">{contact.name}</h2>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-navy-200">
              <Mail size={15} className="text-gray-400 dark:text-navy-400" /> {contact.email}
            </div>
            {contact.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-navy-200">
                <Phone size={15} className="text-gray-400 dark:text-navy-400" /> {contact.phone}
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-navy-200">
                <Building2 size={15} className="text-gray-400 dark:text-navy-400" /> {contact.company}
              </div>
            )}
          </div>
          {contact.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {contact.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-navy-850 px-2.5 py-0.5 text-xs text-gray-600 dark:text-navy-200">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          )}
          {contact.notes && (
            <div className="mt-4 rounded-lg bg-gray-50 dark:bg-navy-850 p-3 text-sm text-gray-600 dark:text-navy-200">
              {contact.notes}
            </div>
          )}
          <button
            onClick={() => openContactDialog(contact)}
            className="mt-4 flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-navy-700 px-3 py-1.5 text-sm text-gray-600 dark:text-navy-200 hover:bg-gray-50 dark:hover:bg-navy-850"
          >
            <Edit size={14} /> Edit Contact
          </button>
        </div>
      </div>
    </div>
  );
}

export function ContactList() {
  const { contacts, contactSearch, setContactSearch, selectedContactId, openContactDialog } = useAppStore();

  const filtered = useMemo(() => {
    if (!contactSearch) return contacts;
    const q = contactSearch.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [contacts, contactSearch]);

  const selected = contacts.find((c) => c.id === selectedContactId);

  return (
    <div className="flex h-full dark:bg-navy-950">
      <div className="flex w-80 shrink-0 flex-col border-r border-gray-200 dark:border-navy-800 dark:bg-navy-900">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-navy-800 px-4 py-2.5">
          <User size={20} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-gray-800 dark:text-navy-100">Contacts</h2>
          <span className="text-xs text-gray-400 dark:text-navy-400">({filtered.length})</span>
          <button
            onClick={() => openContactDialog()}
            className="ml-auto flex items-center gap-1 rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-700"
          >
            <Plus size={13} /> Add
          </button>
        </div>
        <div className="px-3 py-2 border-b border-gray-100 dark:border-navy-800">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-400" />
            <input
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              placeholder="Search contacts..."
              className="w-full rounded-md border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-850 py-1.5 pl-8 pr-3 text-sm text-gray-900 dark:text-navy-200 placeholder:text-gray-500 dark:placeholder:text-navy-400 outline-none focus:border-primary-300 dark:focus:border-primary-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filtered.map((c) => (
            <ContactRow key={c.id} contact={c} selected={selectedContactId === c.id} />
          ))}
        </div>
      </div>
      <div className="flex-1 dark:bg-navy-950">
        {selected ? (
          <ContactDetail contact={selected} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-300 dark:text-navy-400">
            <User size={48} strokeWidth={1} />
            <p className="mt-3 text-sm text-gray-400 dark:text-navy-400">Select a contact</p>
          </div>
        )}
      </div>
    </div>
  );
}
