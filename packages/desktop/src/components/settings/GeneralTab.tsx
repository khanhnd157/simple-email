import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingGroup, SettingRow, Toggle, Select, Checkbox, TextInput, Button, RadioGroup } from './controls';

export function GeneralTab() {
  const { t, i18n } = useTranslation();
  const [defaultClient, setDefaultClient] = useState(true);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [profilePath] = useState('C:\\Users\\AppData\\SimpleMail\\Profiles\\default');
  const [searchEngine, setSearchEngine] = useState('google');
  const [minimizeToTray, setMinimizeToTray] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [showTrayIcon, setShowTrayIcon] = useState(true);
  const [playSound, setPlaySound] = useState(true);
  const [soundType, setSoundType] = useState('default');
  const [language, setLanguage] = useState(i18n.language);

  const changeLang = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('simple-email-lang', lang);
  };

  return (
    <div>
      <SettingGroup title={t('settings.general')}>
        <SettingRow label="Check if Simple Email is the default mail client on startup">
          <Toggle checked={defaultClient} onChange={setDefaultClient} />
        </SettingRow>
        <SettingRow label="Show Profile Manager on startup">
          <Toggle checked={showProfileManager} onChange={setShowProfileManager} />
        </SettingRow>
        <SettingRow label={t('settings.language')}>
          <Select value={language} onChange={changeLang}
            options={[{ value: 'en', label: 'English' }, { value: 'vi', label: 'Tiếng Việt' }]}
            className="w-40" />
        </SettingRow>
      </SettingGroup>

      <SettingGroup title="Storage">
        <SettingRow label="Profile & data location">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 max-w-[280px] truncate">{profilePath}</span>
            <Button>Browse</Button>
          </div>
        </SettingRow>
        <SettingRow label="Default Search Engine">
          <Select value={searchEngine} onChange={setSearchEngine}
            options={[
              { value: 'google', label: 'Google' },
              { value: 'bing', label: 'Bing' },
              { value: 'duckduckgo', label: 'DuckDuckGo' },
            ]} className="w-40" />
        </SettingRow>
      </SettingGroup>

      <SettingGroup title="System">
        <SettingRow label="Minimize to System Tray">
          <Toggle checked={minimizeToTray} onChange={setMinimizeToTray} />
        </SettingRow>
      </SettingGroup>

      <SettingGroup title="When new messages arrive">
        <SettingRow label="Show an alert notification">
          <Toggle checked={showAlert} onChange={setShowAlert} />
        </SettingRow>
        <SettingRow label="Show a tray icon">
          <Toggle checked={showTrayIcon} onChange={setShowTrayIcon} />
        </SettingRow>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Play a sound</span>
            <Toggle checked={playSound} onChange={setPlaySound} />
          </div>
          {playSound && (
            <div className="ml-1 mt-2">
              <RadioGroup value={soundType} onChange={setSoundType}
                options={[
                  { value: 'default', label: 'Default system sound for new mail' },
                  { value: 'custom', label: 'Use the following sound file' },
                ]} />
              {soundType === 'custom' && (
                <div className="mt-2 ml-6">
                  <div className="flex items-center gap-2">
                    <TextInput value="" onChange={() => {}} placeholder="Select sound file..." className="flex-1 text-xs" />
                    <Button>Browse</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SettingGroup>
    </div>
  );
}
