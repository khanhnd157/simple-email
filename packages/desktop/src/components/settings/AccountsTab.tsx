import { useState } from 'react';
import { ChevronDown, ChevronRight, Mail, Server, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingGroup, SettingRow, Toggle, Select, NumberInput, TextInput, Button, Checkbox, RadioGroup } from './controls';

interface AccountNode {
  id: string; label: string; email?: string;
  children?: Array<{ id: string; label: string }>;
}

const MOCK_ACCOUNTS: AccountNode[] = [
  {
    id: 'acc1', label: 'mazetech@zohomail.com', email: 'mazetech@zohomail.com',
    children: [
      { id: 'identity', label: 'Identity' },
      { id: 'copies', label: 'Copies & Folders' },
      { id: 'composition', label: 'Composition' },
      { id: 'storage', label: 'Local Storage' },
      { id: 'junk', label: 'Junk Settings' },
      { id: 'receipts', label: 'Return Receipts' },
      { id: 'security', label: 'Security' },
    ],
  },
  {
    id: 'local', label: 'Local Folders',
    children: [
      { id: 'local-storage', label: 'Local Storage' },
      { id: 'local-junk', label: 'Junk Settings' },
    ],
  },
  { id: 'outgoing', label: 'Outgoing Server' },
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
          isSelected ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}
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

function AccountSettingsForm() {
  const [accountName, setAccountName] = useState('mazetech@zohomail.com');
  const [incomingServer, setIncomingServer] = useState('imap.zoho.com');
  const [port, setPort] = useState(993);
  const [userName, setUserName] = useState('mazetech@zohomail.com');
  const [connSecurity, setConnSecurity] = useState('ssl');
  const [auth, setAuth] = useState('password');
  const [checkStartup, setCheckStartup] = useState(true);
  const [checkInterval, setCheckInterval] = useState(true);
  const [intervalMin, setIntervalMin] = useState(10);
  const [cleanupInbox, setCleanupInbox] = useState(false);
  const [emptyTrash, setEmptyTrash] = useState(false);
  const [serverNotify, setServerNotify] = useState(true);
  const [deleteAction, setDeleteAction] = useState('move');
  const [trashFolder, setTrashFolder] = useState('trash');

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Account Settings</h3>

      <SettingGroup title="Server">
        <SettingRow label="Account Name">
          <TextInput value={accountName} onChange={setAccountName} className="w-56" />
        </SettingRow>
        <SettingRow label="Account Type">
          <span className="text-sm text-gray-500">IMAP Mail Server</span>
        </SettingRow>
        <SettingRow label="Incoming Server">
          <TextInput value={incomingServer} onChange={setIncomingServer} className="w-56" />
        </SettingRow>
        <SettingRow label="Port">
          <NumberInput value={port} onChange={setPort} min={1} max={65535} />
        </SettingRow>
        <SettingRow label="User Name">
          <TextInput value={userName} onChange={setUserName} className="w-56" />
        </SettingRow>
        <SettingRow label="Connection Security">
          <Select value={connSecurity} onChange={setConnSecurity} className="w-40"
            options={[
              { value: 'none', label: 'None' },
              { value: 'starttls', label: 'STARTTLS' },
              { value: 'ssl', label: 'SSL/TLS' },
            ]} />
        </SettingRow>
        <SettingRow label="Authentication">
          <Select value={auth} onChange={setAuth} className="w-40"
            options={[
              { value: 'password', label: 'Password' },
              { value: 'oauth2', label: 'OAuth2' },
            ]} />
        </SettingRow>
      </SettingGroup>

      <SettingGroup title="Sync">
        <SettingRow label="Check for new messages at startup">
          <Toggle checked={checkStartup} onChange={setCheckStartup} />
        </SettingRow>
        <SettingRow label="Check for new messages every">
          <div className="flex items-center gap-2">
            <Toggle checked={checkInterval} onChange={setCheckInterval} />
            {checkInterval && <NumberInput value={intervalMin} onChange={setIntervalMin} min={1} max={60} suffix="min" />}
          </div>
        </SettingRow>
        <SettingRow label="Allow immediate server notifications (IDLE)">
          <Toggle checked={serverNotify} onChange={setServerNotify} />
        </SettingRow>
      </SettingGroup>

      <SettingGroup title="Cleanup">
        <SettingRow label="Clean up (Expunge) Inbox on Exit">
          <Toggle checked={cleanupInbox} onChange={setCleanupInbox} />
        </SettingRow>
        <SettingRow label="Empty Trash on Exit">
          <Toggle checked={emptyTrash} onChange={setEmptyTrash} />
        </SettingRow>
      </SettingGroup>

      <SettingGroup title="When I delete a message">
        <div className="px-4 py-3">
          <RadioGroup value={deleteAction} onChange={setDeleteAction}
            options={[
              { value: 'move', label: 'Move it to Trash folder' },
              { value: 'mark', label: 'Just mark it as deleted' },
              { value: 'remove', label: 'Remove it immediately' },
            ]} />
        </div>
      </SettingGroup>
    </div>
  );
}

export function AccountsTab() {
  const [selected, setSelected] = useState('acc1');

  return (
    <div className="flex gap-4 h-full">
      <div className="w-48 shrink-0 border-r border-gray-200 dark:border-gray-700 pr-3">
        <div className="space-y-0.5">
          {MOCK_ACCOUNTS.map((acc) => (
            <TreeItem key={acc.id} node={acc} selected={selected} onSelect={setSelected} />
          ))}
        </div>
        <div className="flex gap-1.5 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button variant="primary" className="flex items-center gap-1"><Plus size={12} /> Add</Button>
          <Button variant="danger" className="flex items-center gap-1"><Trash2 size={12} /> Remove</Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
        <AccountSettingsForm />
      </div>
    </div>
  );
}
