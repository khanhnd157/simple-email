import { useState } from 'react';
import { SettingGroup, SettingRow, Toggle, Select, Button } from './controls';

export function PrivacyTab() {
  const [blockRemote, setBlockRemote] = useState(true);
  const [blockCookies, setBlockCookies] = useState(true);
  const [doNotTrack, setDoNotTrack] = useState(true);
  const [webBeacon, setWebBeacon] = useState(true);
  const [phishing, setPhishing] = useState(true);
  const [antivirus, setAntivirus] = useState(false);

  return (
    <>
      <SettingGroup title="Mail Content">
        <SettingRow label="Block remote content in messages"><Toggle checked={blockRemote} onChange={setBlockRemote} /></SettingRow>
        <SettingRow label="Block cookies from messages"><Toggle checked={blockCookies} onChange={setBlockCookies} /></SettingRow>
      </SettingGroup>
      <SettingGroup title="Tracking">
        <SettingRow label="Request Do Not Track"><Toggle checked={doNotTrack} onChange={setDoNotTrack} /></SettingRow>
        <SettingRow label="Block web beacons / tracking pixels"><Toggle checked={webBeacon} onChange={setWebBeacon} /></SettingRow>
      </SettingGroup>
      <SettingGroup title="Security">
        <SettingRow label="Detect phishing / scam messages"><Toggle checked={phishing} onChange={setPhishing} /></SettingRow>
        <SettingRow label="Allow antivirus clients to quarantine messages"><Toggle checked={antivirus} onChange={setAntivirus} /></SettingRow>
      </SettingGroup>
    </>
  );
}

export function SecurityTab() {
  const [viewPlaintext, setViewPlaintext] = useState(false);
  const [signOutgoing, setSignOutgoing] = useState(false);
  const [encryptDefault, setEncryptDefault] = useState(false);
  const [pgpMime, setPgpMime] = useState('pgpmime');

  return (
    <>
      <SettingGroup title="Message Display">
        <SettingRow label="View messages as plain text (disable HTML)"><Toggle checked={viewPlaintext} onChange={setViewPlaintext} /></SettingRow>
      </SettingGroup>
      <SettingGroup title="OpenPGP / S/MIME">
        <SettingRow label="Digitally sign outgoing messages by default"><Toggle checked={signOutgoing} onChange={setSignOutgoing} /></SettingRow>
        <SettingRow label="Encrypt outgoing messages by default"><Toggle checked={encryptDefault} onChange={setEncryptDefault} /></SettingRow>
        <SettingRow label="Default encryption format">
          <Select value={pgpMime} onChange={setPgpMime} className="w-40"
            options={[{ value: 'pgpmime', label: 'PGP/MIME' }, { value: 'smime', label: 'S/MIME' }]} />
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Certificates">
        <div className="px-4 py-3 flex gap-2">
          <Button>Manage Certificates</Button>
          <Button>Manage Keys</Button>
        </div>
      </SettingGroup>
    </>
  );
}

export function AttachmentsTab() {
  const [saveLocation, setSaveLocation] = useState('ask');
  const [inlineImages, setInlineImages] = useState(true);
  const [autoDetach, setAutoDetach] = useState(false);
  const [maxAttach, setMaxAttach] = useState(25);

  return (
    <>
      <SettingGroup title="Saving">
        <SettingRow label="Save attachments to">
          <Select value={saveLocation} onChange={setSaveLocation} className="w-44"
            options={[{ value: 'ask', label: 'Always ask' }, { value: 'downloads', label: 'Downloads folder' }, { value: 'desktop', label: 'Desktop' }]} />
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Display">
        <SettingRow label="Show images inline"><Toggle checked={inlineImages} onChange={setInlineImages} /></SettingRow>
      </SettingGroup>
      <SettingGroup title="Limits">
        <SettingRow label="Auto-detach large attachments"><Toggle checked={autoDetach} onChange={setAutoDetach} /></SettingRow>
        <SettingRow label="Maximum attachment size">
          <div className="flex items-center gap-1.5">
            <input type="number" value={maxAttach} onChange={(e) => setMaxAttach(Number(e.target.value))} min={1} max={100}
              className="w-16 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 outline-none text-center" />
            <span className="text-xs text-gray-500">MB</span>
          </div>
        </SettingRow>
      </SettingGroup>
    </>
  );
}
