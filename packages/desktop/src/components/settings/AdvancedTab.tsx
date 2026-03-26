import { useState } from 'react';
import { SubTabs, SettingGroup, SettingRow, Toggle, Select, NumberInput, RadioGroup, Button } from './controls';

const SUB_TABS = ['General', 'Network & Disk Space', 'Update'];

function GeneralSub() {
  const [gmailShortcuts, setGmailShortcuts] = useState(false);
  const [rememberLast, setRememberLast] = useState(true);
  const [afterDelete, setAfterDelete] = useState('previous');
  const [imapExpunge, setImapExpunge] = useState(true);
  const [mime8bit, setMime8bit] = useState(false);
  const [downloadHeaders, setDownloadHeaders] = useState(false);
  const [downloadBodies, setDownloadBodies] = useState(false);
  const [idleIndex, setIdleIndex] = useState(180);

  return (
    <>
      <SettingGroup title="Behavior">
        <SettingRow label="Use Gmail keyboard shortcuts"><Toggle checked={gmailShortcuts} onChange={setGmailShortcuts} /></SettingRow>
        <SettingRow label="Remember the last selected message"><Toggle checked={rememberLast} onChange={setRememberLast} /></SettingRow>
        <SettingRow label="After deleting a message select">
          <Select value={afterDelete} onChange={setAfterDelete} className="w-44"
            options={[{ value: 'previous', label: 'Previous Message' }, { value: 'next', label: 'Next Message' }, { value: 'none', label: 'None' }]} />
        </SettingRow>
        <SettingRow label="Return Receipts">
          <Button>Configure...</Button>
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="IMAP">
        <SettingRow label="IMAP Expunge"><Toggle checked={imapExpunge} onChange={setImapExpunge} /></SettingRow>
        <SettingRow label="MIME encode 8-bit headers"><Toggle checked={mime8bit} onChange={setMime8bit} /></SettingRow>
        <SettingRow label="Download all message headers"><Toggle checked={downloadHeaders} onChange={setDownloadHeaders} /></SettingRow>
        <SettingRow label="Download all message bodies"><Toggle checked={downloadBodies} onChange={setDownloadBodies} /></SettingRow>
        <SettingRow label="Index on idle after">
          <NumberInput value={idleIndex} onChange={setIdleIndex} min={10} max={600} suffix="seconds" />
        </SettingRow>
      </SettingGroup>
    </>
  );
}

function NetworkSub() {
  const [connTimeout, setConnTimeout] = useState(100);
  const [startupMode, setStartupMode] = useState('online');
  const [goOnline, setGoOnline] = useState('ask');
  const [compactFolders, setCompactFolders] = useState(true);
  const [compactSize, setCompactSize] = useState(100);
  const [tcpKeepAlive, setTcpKeepAlive] = useState(true);

  return (
    <>
      <SettingGroup title="Connection">
        <SettingRow label="Connection timeout">
          <NumberInput value={connTimeout} onChange={setConnTimeout} min={10} max={600} suffix="seconds" />
        </SettingRow>
        <SettingRow label="When starting up">
          <Select value={startupMode} onChange={setStartupMode} className="w-48"
            options={[{ value: 'online', label: 'Always start up online' }, { value: 'offline', label: 'Start up offline' }, { value: 'ask', label: 'Ask me' }]} />
        </SettingRow>
        <SettingRow label="When going online">
          <Select value={goOnline} onChange={setGoOnline} className="w-48"
            options={[{ value: 'ask', label: 'Ask to send unsent messages' }, { value: 'send', label: 'Send immediately' }, { value: 'dont', label: "Don't send" }]} />
        </SettingRow>
        <SettingRow label="TCP keepalive"><Toggle checked={tcpKeepAlive} onChange={setTcpKeepAlive} /></SettingRow>
      </SettingGroup>
      <SettingGroup title="Disk Space">
        <SettingRow label="Compact all folders when it will save over">
          <div className="flex items-center gap-2">
            <Toggle checked={compactFolders} onChange={setCompactFolders} />
            {compactFolders && <NumberInput value={compactSize} onChange={setCompactSize} min={10} max={1000} suffix="MB" />}
          </div>
        </SettingRow>
      </SettingGroup>
    </>
  );
}

function UpdateSub() {
  const [updateMode, setUpdateMode] = useState('auto');

  return (
    <>
      <SettingGroup title="Application Updates">
        <div className="px-4 py-3">
          <RadioGroup value={updateMode} onChange={setUpdateMode}
            options={[
              { value: 'auto', label: 'Automatically install updates (recommended)' },
              { value: 'check', label: 'Check for updates, but let me choose whether to install them' },
              { value: 'never', label: 'Never check for updates (not recommended)' },
            ]} />
        </div>
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700/50">
          <Button>Show Update History</Button>
        </div>
      </SettingGroup>
    </>
  );
}

export function AdvancedTab() {
  const [sub, setSub] = useState('General');

  return (
    <div>
      <SubTabs tabs={SUB_TABS} active={sub} onChange={setSub} />
      {sub === 'General' && <GeneralSub />}
      {sub === 'Network & Disk Space' && <NetworkSub />}
      {sub === 'Update' && <UpdateSub />}
    </div>
  );
}
