import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings, Globe, Palette, UserCog, Keyboard, Download,
  Sun, Moon, Monitor, ChevronRight, Upload, FolderInput,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';

type SettingsTab = 'general' | 'appearance' | 'accounts' | 'shortcuts' | 'import';

const TABS: Array<{ id: SettingsTab; icon: React.ElementType; labelKey: string }> = [
  { id: 'general', icon: Settings, labelKey: 'settings.general' },
  { id: 'appearance', icon: Palette, labelKey: 'settings.appearance' },
  { id: 'accounts', icon: UserCog, labelKey: 'settings.accounts' },
  { id: 'shortcuts', icon: Keyboard, labelKey: 'settings.shortcuts' },
  { id: 'import', icon: Download, labelKey: 'settings.import' },
];

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function SegmentedControl({ options, value, onChange }: { options: Array<{ id: string; label: string; icon?: React.ElementType }>; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <button key={opt.id} onClick={() => onChange(opt.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
              value === opt.id
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800',
            )}>
            {Icon && <Icon size={13} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function GeneralTab() {
  const { t, i18n } = useTranslation();
  const [syncInterval, setSyncInterval] = useState('5');
  const [notifications, setNotifications] = useState(true);
  const [previewLines, setPreviewLines] = useState('1');

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('simple-email-lang', lang);
  };

  return (
    <div className="space-y-1">
      <SettingRow label={t('settings.language')}>
        <SegmentedControl
          options={[{ id: 'en', label: 'English' }, { id: 'vi', label: 'Tiếng Việt' }]}
          value={i18n.language}
          onChange={changeLanguage}
        />
      </SettingRow>
      <SettingRow label={t('settings.autoSync')} description={t('settings.syncMinutes', { count: Number(syncInterval) })}>
        <select value={syncInterval} onChange={(e) => setSyncInterval(e.target.value)}
          className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 outline-none">
          <option value="1">1 min</option>
          <option value="5">5 min</option>
          <option value="15">15 min</option>
          <option value="30">30 min</option>
        </select>
      </SettingRow>
      <SettingRow label={t('settings.notifications')}>
        <button onClick={() => setNotifications(!notifications)}
          className={cn('relative h-6 w-11 rounded-full transition-colors', notifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600')}>
          <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', notifications ? 'left-[22px]' : 'left-0.5')} />
        </button>
      </SettingRow>
      <SettingRow label={t('settings.previewLines')}>
        <SegmentedControl
          options={[{ id: '0', label: '0' }, { id: '1', label: '1' }, { id: '2', label: '2' }]}
          value={previewLines}
          onChange={setPreviewLines}
        />
      </SettingRow>
    </div>
  );
}

function AppearanceTab() {
  const { t } = useTranslation();
  const { theme, setTheme } = useAppStore();
  const [fontSize, setFontSize] = useState('14');

  return (
    <div className="space-y-1">
      <SettingRow label={t('settings.theme')}>
        <SegmentedControl
          options={[
            { id: 'light', label: t('settings.themeLight'), icon: Sun },
            { id: 'dark', label: t('settings.themeDark'), icon: Moon },
            { id: 'system', label: t('settings.themeSystem'), icon: Monitor },
          ]}
          value={theme}
          onChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}
        />
      </SettingRow>
      <SettingRow label={t('settings.fontSize')}>
        <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}
          className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 outline-none">
          <option value="12">12px</option>
          <option value="13">13px</option>
          <option value="14">14px</option>
          <option value="15">15px</option>
          <option value="16">16px</option>
        </select>
      </SettingRow>
    </div>
  );
}

function ShortcutsTab() {
  const { t } = useTranslation();
  const shortcuts = [
    { action: t('settings.shortcutCompose'), keys: 'Ctrl + N' },
    { action: t('settings.shortcutReply'), keys: 'Ctrl + R' },
    { action: t('settings.shortcutArchive'), keys: 'Ctrl + E' },
    { action: t('settings.shortcutDelete'), keys: 'Del' },
    { action: t('settings.shortcutSearch'), keys: 'Ctrl + K' },
    { action: t('settings.shortcutNextMsg'), keys: '↓ / J' },
    { action: t('settings.shortcutPrevMsg'), keys: '↑ / K' },
  ];

  return (
    <div>
      {shortcuts.map((s) => (
        <div key={s.action} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
          <span className="text-sm text-gray-700 dark:text-gray-300">{s.action}</span>
          <kbd className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-mono text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            {s.keys}
          </kbd>
        </div>
      ))}
    </div>
  );
}

function ImportTab() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <FolderInput size={20} className="mt-0.5 text-amber-500" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('settings.importThunderbird')}</h3>
            <p className="mt-0.5 text-xs text-gray-400">{t('settings.importThunderbirdDesc')}</p>
            <button className="mt-3 flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <Upload size={13} /> {t('settings.selectProfile')}
            </button>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <Download size={20} className="mt-0.5 text-blue-500" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('settings.exportData')}</h3>
            <p className="mt-0.5 text-xs text-gray-400">{t('settings.exportDataDesc')}</p>
            <button className="mt-3 flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <Download size={13} /> {t('settings.exportData')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <div className="flex h-full">
      <div className="w-56 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 py-3">
        <h2 className="px-4 pb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">{t('settings.title')}</h2>
        {TABS.map(({ id, icon: Icon, labelKey }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={cn(
              'flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors',
              activeTab === id
                ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
            )}>
            <Icon size={16} />
            {t(labelKey)}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-8 py-5">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
          {t(`settings.${activeTab}`)}
        </h3>
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'shortcuts' && <ShortcutsTab />}
        {activeTab === 'import' && <ImportTab />}
        {activeTab === 'accounts' && (
          <p className="text-sm text-gray-400">Account management coming soon.</p>
        )}
      </div>
    </div>
  );
}
