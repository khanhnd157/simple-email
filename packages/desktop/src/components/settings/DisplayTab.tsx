import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Sun, Moon, Monitor, Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubTabs, SettingGroup, SettingRow, Toggle, Select, Checkbox, NumberInput, RadioGroup, Button } from './controls';

const SUB_TABS = ['General', 'Conversations', 'Formatting', 'Topics', 'Themes', 'Advanced'];

function GeneralSub() {
  const [dpi, setDpi] = useState('default');
  const [fontSize, setFontSize] = useState('small');
  const [boldUnread, setBoldUnread] = useState(false);
  const [showEmoticons, setShowEmoticons] = useState(true);
  const [detectDates, setDetectDates] = useState(true);
  const [detectPhones, setDetectPhones] = useState(true);
  const [showTime, setShowTime] = useState(false);
  const [countInbox, setCountInbox] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [textAttachInline, setTextAttachInline] = useState(false);

  return (
    <>
      <SettingGroup title="Scaling & Fonts">
        <SettingRow label="DPI Scaling">
          <Select value={dpi} onChange={setDpi} className="w-32"
            options={[{ value: 'default', label: 'Default' }, { value: '125', label: '125%' }, { value: '150', label: '150%' }]} />
        </SettingRow>
        <SettingRow label="Message List and Folder Font Size">
          <Select value={fontSize} onChange={setFontSize} className="w-32"
            options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]} />
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Display Options">
        <SettingRow label="Bold Unread Messages"><Toggle checked={boldUnread} onChange={setBoldUnread} /></SettingRow>
        <SettingRow label="Show Emoticons"><Toggle checked={showEmoticons} onChange={setShowEmoticons} /></SettingRow>
        <SettingRow label="Detect Dates"><Toggle checked={detectDates} onChange={setDetectDates} /></SettingRow>
        <SettingRow label="Detect Phone Numbers"><Toggle checked={detectPhones} onChange={setDetectPhones} /></SettingRow>
        <SettingRow label="Always show time in message list"><Toggle checked={showTime} onChange={setShowTime} /></SettingRow>
        <SettingRow label="Count unread for Inboxes only"><Toggle checked={countInbox} onChange={setCountInbox} /></SettingRow>
        <SettingRow label="Show Tooltips"><Toggle checked={showTooltips} onChange={setShowTooltips} /></SettingRow>
        <SettingRow label="Show text attachments inline"><Toggle checked={textAttachInline} onChange={setTextAttachInline} /></SettingRow>
      </SettingGroup>
    </>
  );
}

function ConversationsSub() {
  const [includeFrom, setIncludeFrom] = useState('inbox-sent');
  const [orderBy, setOrderBy] = useState('newest');
  const [enableConvo, setEnableConvo] = useState(true);
  const [threadId, setThreadId] = useState(true);
  const [threadSubject, setThreadSubject] = useState(true);
  const [threadNoRe, setThreadNoRe] = useState(false);
  const [markRead, setMarkRead] = useState(true);
  const [contactPhotos, setContactPhotos] = useState(false);
  const [hideSignatures, setHideSignatures] = useState(true);

  return (
    <>
      <SettingGroup title="Conversation View">
        <SettingRow label="Include messages from">
          <Select value={includeFrom} onChange={setIncludeFrom} className="w-48"
            options={[{ value: 'inbox-sent', label: 'Inbox, Sent and Archive' }, { value: 'all', label: 'All Folders' }]} />
        </SettingRow>
        <SettingRow label="Order conversations by">
          <Select value={orderBy} onChange={setOrderBy} className="w-48"
            options={[{ value: 'newest', label: 'Newest messages first' }, { value: 'oldest', label: 'Oldest messages first' }]} />
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Threading">
        <SettingRow label="Enable conversation view for all folders"><Toggle checked={enableConvo} onChange={setEnableConvo} /></SettingRow>
        <SettingRow label="Thread by message ID"><Toggle checked={threadId} onChange={setThreadId} /></SettingRow>
        <SettingRow label="Thread by message subject"><Toggle checked={threadSubject} onChange={setThreadSubject} /></SettingRow>
        <SettingRow label="Thread by subject without Re:"><Toggle checked={threadNoRe} onChange={setThreadNoRe} /></SettingRow>
      </SettingGroup>
      <SettingGroup title="Behavior">
        <SettingRow label="Mark messages as read when viewing conversation"><Toggle checked={markRead} onChange={setMarkRead} /></SettingRow>
        <SettingRow label="Include contact photos in conversation"><Toggle checked={contactPhotos} onChange={setContactPhotos} /></SettingRow>
        <SettingRow label="Hide signatures"><Toggle checked={hideSignatures} onChange={setHideSignatures} /></SettingRow>
      </SettingGroup>
    </>
  );
}

function FormattingSub() {
  const [font, setFont] = useState('calibri');
  const [size, setSize] = useState('15');
  const [textColor, setTextColor] = useState('#000000');
  const [quotedStyle, setQuotedStyle] = useState('regular');
  const [quotedSize, setQuotedSize] = useState('regular');

  return (
    <>
      <SettingGroup title="Font">
        <SettingRow label="Default Font">
          <Select value={font} onChange={setFont} className="w-44"
            options={[{ value: 'calibri', label: 'Calibri' }, { value: 'arial', label: 'Arial' }, { value: 'helvetica', label: 'Helvetica' }, { value: 'georgia', label: 'Georgia' }, { value: 'monospace', label: 'Monospace' }]} />
        </SettingRow>
        <SettingRow label="Size">
          <Select value={size} onChange={setSize} className="w-24"
            options={['11', '12', '13', '14', '15', '16', '18', '20'].map((s) => ({ value: s, label: s }))} />
        </SettingRow>
        <SettingRow label="Text Color">
          <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
            className="h-7 w-10 rounded border border-gray-200 dark:border-gray-700 cursor-pointer" />
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Quoted Text">
        <SettingRow label="Quoted plain text style">
          <Select value={quotedStyle} onChange={setQuotedStyle} className="w-32"
            options={[{ value: 'regular', label: 'Regular' }, { value: 'bold', label: 'Bold' }, { value: 'italic', label: 'Italic' }]} />
        </SettingRow>
        <SettingRow label="Quoted plain text size">
          <Select value={quotedSize} onChange={setQuotedSize} className="w-32"
            options={[{ value: 'regular', label: 'Regular' }, { value: 'smaller', label: 'Smaller' }, { value: 'larger', label: 'Larger' }]} />
        </SettingRow>
      </SettingGroup>
    </>
  );
}

function TopicsSub() {
  const [applyColor, setApplyColor] = useState(true);
  const topics = [
    { name: 'Home', color: '#3b82f6', favorite: true },
    { name: 'Important', color: '#ef4444', favorite: true },
    { name: 'Later', color: '#f59e0b', favorite: true },
    { name: 'Personal', color: '#8b5cf6', favorite: true },
    { name: 'Work', color: '#10b981', favorite: true },
  ];

  return (
    <>
      <SettingGroup title="Topic Colors">
        <SettingRow label="Apply topic color to entire row in message list">
          <Toggle checked={applyColor} onChange={setApplyColor} />
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Topics">
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          <div className="flex items-center px-4 py-2 text-xs font-medium text-gray-400 uppercase">
            <span className="flex-1">Topic</span><span className="w-20 text-center">Favorite</span>
          </div>
          {topics.map((t) => (
            <div key={t.name} className="flex items-center px-4 py-2">
              <div className="h-3 w-3 rounded-full mr-2.5" style={{ backgroundColor: t.color }} />
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{t.name}</span>
              <div className="w-20 flex justify-center">
                <Toggle checked={t.favorite} onChange={() => {}} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 px-4 py-2.5">
          <Button className="flex items-center gap-1"><Plus size={12} /> New</Button>
          <Button className="flex items-center gap-1"><Pencil size={12} /> Edit</Button>
          <Button variant="danger" className="flex items-center gap-1"><Trash2 size={12} /> Delete</Button>
        </div>
      </SettingGroup>
    </>
  );
}

function ThemesSub() {
  const { theme, setTheme } = useAppStore();
  const themes = ['Default', 'Default Dark', 'Affair', 'Astronaut', 'Big Stone', 'Bismark', 'Blush', 'Charade', 'Cinder', 'Cloud Burst'];
  const [selectedTheme, setSelectedTheme] = useState('Default');

  return (
    <>
      <SettingGroup title="Color Scheme">
        <div className="flex gap-2 px-4 py-3">
          {([
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTheme(id)}
              className={cn('flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-medium transition-colors',
                theme === id
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-600'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800')}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </SettingGroup>
      <SettingGroup title="Theme">
        <div className="max-h-52 overflow-y-auto scrollbar-thin">
          {themes.map((t) => (
            <button key={t} onClick={() => setSelectedTheme(t)}
              className={cn('w-full text-left px-4 py-2 text-sm transition-colors',
                selectedTheme === t
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800')}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 px-4 py-2.5 border-t border-gray-100 dark:border-gray-700/50">
          <Button>New</Button>
          <Button>Edit</Button>
          <Button variant="danger">Delete</Button>
          <div className="flex-1" />
          <Button>Import</Button>
          <Button>Export</Button>
        </div>
      </SettingGroup>
    </>
  );
}

function AdvancedDisplaySub() {
  const [autoRead, setAutoRead] = useState(true);
  const [readMode, setReadMode] = useState('immediate');
  const [readDelay, setReadDelay] = useState(5);
  const [openIn, setOpenIn] = useState('tab');
  const [closeOnMove, setCloseOnMove] = useState(false);
  const [rotateExif, setRotateExif] = useState(true);
  const [accountRows, setAccountRows] = useState(30);
  const [contactDisplay, setContactDisplay] = useState('display');

  return (
    <>
      <SettingGroup title="Reading">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Automatically mark messages as read</span>
            <Toggle checked={autoRead} onChange={setAutoRead} />
          </div>
          {autoRead && (
            <div className="ml-1 mt-2">
              <RadioGroup value={readMode} onChange={setReadMode}
                options={[
                  { value: 'immediate', label: 'Immediately on display' },
                  { value: 'delay', label: `After displaying for ${readDelay} seconds` },
                ]} />
            </div>
          )}
        </div>
        <SettingRow label="Open messages in">
          <Select value={openIn} onChange={setOpenIn} className="w-36"
            options={[{ value: 'tab', label: 'A new tab' }, { value: 'window', label: 'New window' }, { value: 'inline', label: 'Inline' }]} />
        </SettingRow>
        <SettingRow label="Close message window/tab on move or delete"><Toggle checked={closeOnMove} onChange={setCloseOnMove} /></SettingRow>
      </SettingGroup>
      <SettingGroup title="Display">
        <SettingRow label="Rotate images according to EXIF data"><Toggle checked={rotateExif} onChange={setRotateExif} /></SettingRow>
        <SettingRow label="Rows in Accounts Pane">
          <NumberInput value={accountRows} onChange={setAccountRows} min={10} max={100} suffix="rows" />
        </SettingRow>
        <SettingRow label="Contact Display">
          <Select value={contactDisplay} onChange={setContactDisplay} className="w-40"
            options={[{ value: 'display', label: 'Display Name' }, { value: 'email', label: 'Email Address' }, { value: 'both', label: 'Both' }]} />
        </SettingRow>
      </SettingGroup>
    </>
  );
}

export function DisplayTab() {
  const [sub, setSub] = useState('General');

  return (
    <div>
      <SubTabs tabs={SUB_TABS} active={sub} onChange={setSub} />
      {sub === 'General' && <GeneralSub />}
      {sub === 'Conversations' && <ConversationsSub />}
      {sub === 'Formatting' && <FormattingSub />}
      {sub === 'Topics' && <TopicsSub />}
      {sub === 'Themes' && <ThemesSub />}
      {sub === 'Advanced' && <AdvancedDisplaySub />}
    </div>
  );
}
