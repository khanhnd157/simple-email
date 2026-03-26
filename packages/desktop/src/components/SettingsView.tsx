import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings, UserCog, Monitor, PenSquare, ShieldCheck,
  Lock, Paperclip, Wrench, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { GeneralTab } from './settings/GeneralTab';
import { AccountsTab } from './settings/AccountsTab';
import { DisplayTab } from './settings/DisplayTab';
import { CompositionTab } from './settings/CompositionTab';
import { AdvancedTab } from './settings/AdvancedTab';
import { PrivacyTab, SecurityTab, AttachmentsTab } from './settings/PrivacySecurityTab';

type SettingsTab = 'general' | 'accounts' | 'display' | 'composition' | 'privacy' | 'security' | 'attachments' | 'advanced';

const TABS: Array<{ id: SettingsTab; icon: React.ElementType; label: string }> = [
  { id: 'general', icon: Settings, label: 'General' },
  { id: 'accounts', icon: UserCog, label: 'Accounts' },
  { id: 'display', icon: Monitor, label: 'Display' },
  { id: 'composition', icon: PenSquare, label: 'Composition' },
  { id: 'privacy', icon: ShieldCheck, label: 'Privacy' },
  { id: 'security', icon: Lock, label: 'Security' },
  { id: 'attachments', icon: Paperclip, label: 'Attachments' },
  { id: 'advanced', icon: Wrench, label: 'Advanced' },
];

export function SettingsDialog() {
  const { settingsOpen, closeSettings } = useAppStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  if (!settingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeSettings}>
      <div
        className="w-[820px] max-h-[85vh] rounded-xl bg-white dark:bg-navy-900 shadow-2xl flex flex-col border border-gray-200 dark:border-navy-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-navy-700/50">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-navy-100">{t('settings.title')}</h2>
          <button onClick={closeSettings} className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-navy-400 dark:hover:text-navy-200 dark:hover:bg-navy-800">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center border-b border-gray-200 dark:border-navy-700/50 bg-gray-50/50 dark:bg-navy-900/50 px-1">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors rounded-t-md min-w-[60px]',
                activeTab === id
                  ? 'text-primary-600 bg-white dark:bg-navy-800 dark:text-primary-400 border-b-2 border-primary-500 -mb-px'
                  : 'text-gray-400 hover:text-gray-600 dark:text-navy-400 dark:hover:text-navy-200 hover:bg-gray-100 dark:hover:bg-navy-850',
              )}>
              <Icon size={18} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">
          <div className="max-w-2xl">
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'accounts' && <AccountsTab />}
            {activeTab === 'display' && <DisplayTab />}
            {activeTab === 'composition' && <CompositionTab />}
            {activeTab === 'privacy' && <PrivacyTab />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'attachments' && <AttachmentsTab />}
            {activeTab === 'advanced' && <AdvancedTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
