import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { SubTabs, SettingGroup, SettingRow, Toggle, Select, NumberInput, Checkbox, RadioGroup, TextInput, Button } from './controls';

const SUB_TABS = ['General', 'Addressing', 'Typing', 'Signatures', 'Advanced'];

function GeneralSub() {
  const [font, setFont] = useState('variable');
  const [textColor, setTextColor] = useState('#000000');
  const [encoding, setEncoding] = useState('utf8');
  const [useDefaultEncoding, setUseDefaultEncoding] = useState(false);
  const [rotateExif, setRotateExif] = useState(true);
  const [forwardMode, setForwardMode] = useState('inline');
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveMin, setAutoSaveMin] = useState(5);
  const [checkAttachments, setCheckAttachments] = useState(true);

  return (
    <>
      <SettingGroup title="Font & Encoding">
        <SettingRow label="Font">
          <Select value={font} onChange={setFont} className="w-44"
            options={[{ value: 'variable', label: 'Variable Width' }, { value: 'fixed', label: 'Fixed Width' }]} />
        </SettingRow>
        <SettingRow label="Text Color">
          <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
            className="h-7 w-10 rounded border border-gray-200 dark:border-gray-700 cursor-pointer" />
        </SettingRow>
        <SettingRow label="Character Encoding">
          <Select value={encoding} onChange={setEncoding} className="w-44"
            options={[{ value: 'utf8', label: 'Unicode (UTF-8)' }, { value: 'iso8859', label: 'Western (ISO-8859-1)' }]} />
        </SettingRow>
        <SettingRow label="Use default character encoding in replies"><Toggle checked={useDefaultEncoding} onChange={setUseDefaultEncoding} /></SettingRow>
        <SettingRow label="Rotate images according to EXIF data"><Toggle checked={rotateExif} onChange={setRotateExif} /></SettingRow>
      </SettingGroup>
      <SettingGroup title="Sending">
        <SettingRow label="Forward messages">
          <Select value={forwardMode} onChange={setForwardMode} className="w-36"
            options={[{ value: 'inline', label: 'Inline' }, { value: 'attachment', label: 'As Attachment' }]} />
        </SettingRow>
        <SettingRow label="Auto Save drafts every">
          <div className="flex items-center gap-2">
            <Toggle checked={autoSave} onChange={setAutoSave} />
            {autoSave && <NumberInput value={autoSaveMin} onChange={setAutoSaveMin} min={1} max={30} suffix="min" />}
          </div>
        </SettingRow>
        <SettingRow label="Check for missing attachments before sending"><Toggle checked={checkAttachments} onChange={setCheckAttachments} /></SettingRow>
      </SettingGroup>
    </>
  );
}

function AddressingSub() {
  const [localBooks, setLocalBooks] = useState(true);
  const [dirServer, setDirServer] = useState(false);
  const [addOutgoing, setAddOutgoing] = useState(true);
  const [outgoingBook, setOutgoingBook] = useState('collected');
  const [contactsSidebar, setContactsSidebar] = useState('addressbooks');
  const [expandMailing, setExpandMailing] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [ignoreReplyTo, setIgnoreReplyTo] = useState(true);

  return (
    <>
      <SettingGroup title="Address Lookup">
        <SettingRow label="Look for matching entries in Local Address Books"><Toggle checked={localBooks} onChange={setLocalBooks} /></SettingRow>
        <SettingRow label="Use Directory Server"><Toggle checked={dirServer} onChange={setDirServer} /></SettingRow>
      </SettingGroup>
      <SettingGroup title="Outgoing">
        <SettingRow label="Add outgoing email addresses to">
          <div className="flex items-center gap-2">
            <Toggle checked={addOutgoing} onChange={setAddOutgoing} />
            {addOutgoing && (
              <Select value={outgoingBook} onChange={setOutgoingBook} className="w-44"
                options={[{ value: 'collected', label: 'Collected Addresses' }, { value: 'personal', label: 'Personal Address Book' }]} />
            )}
          </div>
        </SettingRow>
        <SettingRow label="Contacts Sidebar displays">
          <Select value={contactsSidebar} onChange={setContactsSidebar} className="w-40"
            options={[{ value: 'addressbooks', label: 'Address Books' }, { value: 'recent', label: 'Recent Contacts' }]} />
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Mailing Lists">
        <SettingRow label="Expand mailing list addresses"><Toggle checked={expandMailing} onChange={setExpandMailing} /></SettingRow>
        <SettingRow label="Show full email addresses"><Toggle checked={showFull} onChange={setShowFull} /></SettingRow>
        <SettingRow label="Ignore Reply-to header for mailing lists"><Toggle checked={ignoreReplyTo} onChange={setIgnoreReplyTo} /></SettingRow>
      </SettingGroup>
    </>
  );
}

function TypingSub() {
  const [spellBefore, setSpellBefore] = useState(false);
  const [spellAsType, setSpellAsType] = useState(true);
  const [spellLang, setSpellLang] = useState('en-us');
  const [intlChars, setIntlChars] = useState(false);
  const [emoji, setEmoji] = useState(true);
  const [urlAutoComplete, setUrlAutoComplete] = useState(true);
  const [warnSize, setWarnSize] = useState(true);
  const [maxSize, setMaxSize] = useState(4);
  const [compGoals, setCompGoals] = useState(false);

  return (
    <>
      <SettingGroup title="Spell Check">
        <SettingRow label="Check spelling before sending"><Toggle checked={spellBefore} onChange={setSpellBefore} /></SettingRow>
        <SettingRow label="Enable spell check as you type"><Toggle checked={spellAsType} onChange={setSpellAsType} /></SettingRow>
        <SettingRow label="Language">
          <Select value={spellLang} onChange={setSpellLang} className="w-44"
            options={[{ value: 'en-us', label: 'English (US)' }, { value: 'en-gb', label: 'English (UK)' }, { value: 'vi', label: 'Vietnamese' }]} />
        </SettingRow>
      </SettingGroup>
      <SettingGroup title="Input">
        <SettingRow label="International Characters panel"><Toggle checked={intlChars} onChange={setIntlChars} /></SettingRow>
        <SettingRow label="Emoji shortcuts"><Toggle checked={emoji} onChange={setEmoji} /></SettingRow>
        <SettingRow label="Enable URL Autocomplete"><Toggle checked={urlAutoComplete} onChange={setUrlAutoComplete} /></SettingRow>
      </SettingGroup>
      <SettingGroup title="Limits">
        <SettingRow label="Warn if message size is above">
          <div className="flex items-center gap-2">
            <Toggle checked={warnSize} onChange={setWarnSize} />
            {warnSize && <NumberInput value={maxSize} onChange={setMaxSize} min={1} max={50} suffix="MB" />}
          </div>
        </SettingRow>
        <SettingRow label="Set composition goals"><Toggle checked={compGoals} onChange={setCompGoals} /></SettingRow>
      </SettingGroup>
    </>
  );
}

function SignaturesSub() {
  const [signatures] = useState(['Default Signature']);
  const [selected, setSelected] = useState('Default Signature');
  const [addDelimiter, setAddDelimiter] = useState(true);

  return (
    <>
      <SettingGroup title="Signatures">
        <div className="max-h-48 overflow-y-auto">
          {signatures.map((s) => (
            <button key={s} onClick={() => setSelected(s)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${selected === s ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700/50">
          <SettingRow label="Add delimiter above the signature"><Toggle checked={addDelimiter} onChange={setAddDelimiter} /></SettingRow>
        </div>
        <div className="flex gap-1.5 px-4 py-2.5 border-t border-gray-100 dark:border-gray-700/50">
          <Button className="flex items-center gap-1"><Plus size={12} /> New</Button>
          <Button className="flex items-center gap-1"><Pencil size={12} /> Edit</Button>
          <Button variant="danger" className="flex items-center gap-1"><Trash2 size={12} /> Delete</Button>
        </div>
      </SettingGroup>
    </>
  );
}

function AdvancedCompSub() {
  const [quoteOrder, setQuoteOrder] = useState('newest');
  const [quoteMax, setQuoteMax] = useState(5);
  const [quickReply, setQuickReply] = useState('reply');
  const [quoteInQR, setQuoteInQR] = useState(true);
  const [sendSound, setSendSound] = useState(false);
  const [sendArchive, setSendArchive] = useState(false);
  const [sendBg, setSendBg] = useState(true);

  return (
    <>
      <SettingGroup title="Quoting">
        <SettingRow label="When summarizing, quote">
          <Select value={quoteOrder} onChange={setQuoteOrder} className="w-48"
            options={[{ value: 'newest', label: 'Newest messages first' }, { value: 'oldest', label: 'Oldest messages first' }]} />
        </SettingRow>
        <SettingRow label="Include at most">
          <NumberInput value={quoteMax} onChange={setQuoteMax} min={1} max={20} suffix="messages" />
        </SettingRow>
        <SettingRow label="Default Quick Reply to">
          <Select value={quickReply} onChange={setQuickReply} className="w-32"
            options={[{ value: 'reply', label: 'Reply' }, { value: 'replyall', label: 'Reply All' }]} />
        </SettingRow>
        <SettingRow label="Quote the message in Quick Reply"><Toggle checked={quoteInQR} onChange={setQuoteInQR} /></SettingRow>
      </SettingGroup>
      <SettingGroup title="Sending">
        <SettingRow label="Play sound on sending mail"><Toggle checked={sendSound} onChange={setSendSound} /></SettingRow>
        <SettingRow label="Enable send and archive"><Toggle checked={sendArchive} onChange={setSendArchive} /></SettingRow>
        <SettingRow label="Send in background"><Toggle checked={sendBg} onChange={setSendBg} /></SettingRow>
      </SettingGroup>
    </>
  );
}

export function CompositionTab() {
  const [sub, setSub] = useState('General');

  return (
    <div>
      <SubTabs tabs={SUB_TABS} active={sub} onChange={setSub} />
      {sub === 'General' && <GeneralSub />}
      {sub === 'Addressing' && <AddressingSub />}
      {sub === 'Typing' && <TypingSub />}
      {sub === 'Signatures' && <SignaturesSub />}
      {sub === 'Advanced' && <AdvancedCompSub />}
    </div>
  );
}
