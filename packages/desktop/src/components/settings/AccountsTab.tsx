import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Mail, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingGroup, SettingRow, Select, NumberInput, TextInput } from './controls';
import { AddAccountDialog } from './AddAccountDialog';
import { useEmailStore } from '@/stores/email-store';

interface AccountNode {
  id: string; label: string; email?: string;
  children?: Array<{ id: string; label: string }>;
}

const ACCOUNT_CHILDREN = [
  { id: 'identity', label: 'Identity' },
  { id: 'copies', label: 'Copies & Folders' },
  { id: 'composition', label: 'Composition' },
  { id: 'storage', label: 'Local Storage' },
  { id: 'junk', label: 'Junk Settings' },
  { id: 'receipts', label: 'Return Receipts' },
  { id: 'security', label: 'Security' },
];


function TreeItem({ node, selected, onSelect, depth = 0 }: {
  node: AccountNode; selected: string; onSelect: (id: string) => void; depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selected === node.id;

  return (
    <div>
      <button onClick={() => { hasChildren ? setExpanded(!expanded) : null; onSelect(node.id); }}
        className={cn('flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors',
          isSelected ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-600 dark:text-navy-300 hover:bg-gray-100 dark:hover:bg-navy-800')}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}>
        {hasChildren ? (expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : <span className="w-3" />}
        {depth === 0 ? <Mail size={12} /> : null}
        <span className="truncate">{node.label}</span>
      </button>
      {expanded && node.children?.map((child) => (
        <TreeItem key={child.id} node={child} selected={selected} onSelect={onSelect} depth={depth + 1} />
      ))}
    </div>
  );
}

function AccountSettingsForm({ accountId }: { accountId: string }) {
  const account = useEmailStore((s) => s.dbAccounts.find((a) => a.id === accountId));

  if (!account) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-navy-500">
        Select an account to view settings
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 dark:text-navy-100 mb-4">{account.name}</h3>

      <SettingGroup title="Incoming Server (IMAP)">
        <SettingRow label="User Name">
          <TextInput value={account.imapUsername} onChange={() => {}} className="w-56" />
        </SettingRow>
        <SettingRow label="Server">
          <TextInput value={account.imapHost} onChange={() => {}} className="w-56" />
        </SettingRow>
        <SettingRow label="Port">
          <NumberInput value={account.imapPort} onChange={() => {}} min={1} max={65535} />
        </SettingRow>
        <SettingRow label="Security">
          <Select value={account.imapSecurity} onChange={() => {}} className="w-40"
            options={[
              { value: 'none', label: 'None' },
              { value: 'starttls', label: 'STARTTLS' },
              { value: 'ssl', label: 'SSL/TLS' },
            ]} />
        </SettingRow>
        <SettingRow label="Authentication">
          <Select value={account.imapAuth} onChange={() => {}} className="w-40"
            options={[
              { value: 'password', label: 'Password' },
              { value: 'oauth2', label: 'OAuth2' },
              { value: 'none', label: 'None' },
            ]} />
        </SettingRow>
      </SettingGroup>

      <SettingGroup title="Outgoing Server (SMTP)">
        <SettingRow label="User Name">
          <TextInput value={account.smtpUsername} onChange={() => {}} className="w-56" />
        </SettingRow>
        <SettingRow label="Server">
          <TextInput value={account.smtpHost} onChange={() => {}} className="w-56" />
        </SettingRow>
        <SettingRow label="Port">
          <NumberInput value={account.smtpPort} onChange={() => {}} min={1} max={65535} />
        </SettingRow>
        <SettingRow label="Security">
          <Select value={account.smtpSecurity} onChange={() => {}} className="w-40"
            options={[
              { value: 'none', label: 'None' },
              { value: 'starttls', label: 'STARTTLS' },
              { value: 'ssl', label: 'SSL/TLS' },
            ]} />
        </SettingRow>
        <SettingRow label="Authentication">
          <Select value={account.smtpAuth} onChange={() => {}} className="w-40"
            options={[
              { value: 'password', label: 'Password' },
              { value: 'oauth2', label: 'OAuth2' },
              { value: 'none', label: 'None' },
            ]} />
        </SettingRow>
      </SettingGroup>
    </div>
  );
}

export function AccountsTab() {
  const accounts = useEmailStore((s) => s.accounts);
  const [selected, setSelected] = useState(accounts[0]?.id ?? '');
  const [addOpen, setAddOpen] = useState(false);

  const accountNodes: AccountNode[] = useMemo(() => {
    const nodes: AccountNode[] = accounts.map((acc) => ({
      id: acc.id,
      label: acc.email || acc.name,
      email: acc.email,
      children: ACCOUNT_CHILDREN.map((c) => ({ id: `${acc.id}-${c.id}`, label: c.label })),
    }));
    return nodes;
  }, [accounts]);

  const hasSelection = accounts.some((a) => a.id === selected);

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] h-full gap-3">
        <Mail size={36} className="text-gray-300 dark:text-navy-600" />
        <p className="text-sm text-gray-500 dark:text-navy-400">No accounts configured</p>
        <p className="text-xs text-gray-400 dark:text-navy-500 max-w-[260px] text-center">
          Add an email account to start sending and receiving messages.
        </p>
        <button
          onClick={() => setAddOpen(true)}
          className="mt-2 flex items-center gap-1.5 rounded-lg border border-primary-400 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
        >
          <Plus size={14} /> Add Account
        </button>
        <AddAccountDialog open={addOpen} onClose={() => setAddOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full">
      <div className="w-48 shrink-0 border-r border-gray-200 dark:border-navy-700 pr-3 flex flex-col">
        <div className="grid grid-cols-2 gap-1.5 mb-2 pb-2 border-b border-gray-200 dark:border-navy-700">
          <button className="flex items-center justify-center gap-1 text-xs py-1 rounded border border-gray-200 dark:border-navy-700 text-gray-600 dark:text-navy-300 hover:bg-primary-50 hover:border-primary-400 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:border-primary-500 dark:hover:text-primary-400 transition-colors" onClick={() => setAddOpen(true)}><Plus size={12} /> Add</button>
          <button className="flex items-center justify-center gap-1 text-xs py-1 rounded border border-gray-200 dark:border-navy-700 text-gray-600 dark:text-navy-300 hover:bg-primary-50 hover:border-primary-400 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:border-primary-500 dark:hover:text-primary-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:hover:text-gray-600 dark:disabled:hover:bg-transparent dark:disabled:hover:border-navy-700 dark:disabled:hover:text-navy-300" disabled={!hasSelection}><Trash2 size={12} /> Remove</button>
        </div>
        <div className="space-y-0.5 flex-1 overflow-y-auto scrollbar-thin">
          {accountNodes.map((acc) => (
            <TreeItem key={acc.id} node={acc} selected={selected} onSelect={setSelected} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
        {hasSelection ? (
          <AccountSettingsForm accountId={selected} />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-navy-500">
            Select an account to view settings
          </div>
        )}
      </div>

      <AddAccountDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
