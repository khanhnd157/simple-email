import { useState } from 'react';
import { X, Mail, User, Loader2, CheckCircle2, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { detectMailConfig, type MailServerConfig, type SecurityType, type AuthType } from '@/lib/email-autoconfig';
import { useEmailStore } from '@/stores/email-store';

type Step = 'input' | 'detecting' | 'result';

const inputCls = 'w-full rounded-md border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-850 px-2.5 py-1.5 text-xs text-gray-800 dark:text-navy-100 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 dark:focus:ring-primary-900/30';
const selectCls = 'w-full rounded-md border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-850 px-2 py-1.5 text-xs text-gray-800 dark:text-navy-100 outline-none focus:border-primary-400 cursor-pointer';
const labelCls = 'text-xs text-gray-500 dark:text-navy-400 w-24 shrink-0 text-right';

function ServerSection({
  title,
  username,
  onUsernameChange,
  host,
  onHostChange,
  type,
  port,
  onPortChange,
  security,
  onSecurityChange,
  auth,
  onAuthChange,
}: {
  title: string;
  username: string;
  onUsernameChange: (v: string) => void;
  host: string;
  onHostChange: (v: string) => void;
  type: string;
  port: number;
  onPortChange: (v: number) => void;
  security: SecurityType;
  onSecurityChange: (v: SecurityType) => void;
  auth: AuthType;
  onAuthChange: (v: AuthType) => void;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-700 dark:text-navy-200 mb-2.5 text-center">{title}</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <span className={labelCls}>User Name:</span>
          <input className={inputCls} value={username} onChange={(e) => onUsernameChange(e.target.value)} />
        </div>
        <div className="flex items-center gap-2.5">
          <span className={labelCls}>Server Name:</span>
          <input className={inputCls} value={host} onChange={(e) => onHostChange(e.target.value)} />
        </div>
        <div className="flex items-center gap-2.5">
          <span className={labelCls}>Type:</span>
          <div className="flex-1 flex items-center gap-3">
            <span className="text-xs text-gray-700 dark:text-navy-200 font-medium">{type}</span>
            <span className={cn(labelCls, 'w-auto')}>Port:</span>
            <input type="number" className={cn(inputCls, 'w-20')} value={port} onChange={(e) => onPortChange(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={labelCls}>Security:</span>
          <select className={selectCls} value={security} onChange={(e) => onSecurityChange(e.target.value as SecurityType)}>
            <option value="ssl">SSL/TLS</option>
            <option value="starttls">STARTTLS</option>
            <option value="none">None</option>
          </select>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={labelCls}>Auth:</span>
          <select className={selectCls} value={auth} onChange={(e) => onAuthChange(e.target.value as AuthType)}>
            <option value="password">Password</option>
            <option value="oauth2">OAuth2</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export function AddAccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>('input');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [config, setConfig] = useState<MailServerConfig | null>(null);
  const [error, setError] = useState('');

  const [imapUsername, setImapUsername] = useState('');
  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState(993);
  const [imapSecurity, setImapSecurity] = useState<SecurityType>('ssl');
  const [imapAuth, setImapAuth] = useState<AuthType>('password');

  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpSecurity, setSmtpSecurity] = useState<SecurityType>('ssl');
  const [smtpAuth, setSmtpAuth] = useState<AuthType>('password');

  const addAccount = useEmailStore((s) => s.addAccount);
  const connectAndSync = useEmailStore((s) => s.connectAndSync);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const applyConfig = (cfg: MailServerConfig) => {
    setImapUsername(email);
    setImapHost(cfg.imap.host);
    setImapPort(cfg.imap.port);
    setImapSecurity(cfg.imap.security);
    setImapAuth(cfg.imap.auth);
    setSmtpUsername(email);
    setSmtpHost(cfg.smtp.host);
    setSmtpPort(cfg.smtp.port);
    setSmtpSecurity(cfg.smtp.security);
    setSmtpAuth(cfg.smtp.auth);
  };

  const handleContinue = () => {
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setStep('detecting');

    setTimeout(() => {
      const detected = detectMailConfig(email);
      if (detected) {
        setConfig(detected);
        applyConfig(detected);
        setStep('result');
      } else {
        setError('Could not detect mail server configuration');
        setStep('input');
      }
    }, 800);
  };

  const handleRetest = () => {
    setStep('detecting');
    setTimeout(() => {
      const detected = detectMailConfig(email);
      if (detected) {
        setConfig(detected);
        applyConfig(detected);
      }
      setStep('result');
    }, 600);
  };

  const handleAdd = async () => {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const account = await addAccount({
        name: displayName || email.split('@')[0],
        email,
        imapHost,
        imapPort,
        imapSecure: imapSecurity === 'ssl',
        smtpHost,
        smtpPort,
        smtpSecure: smtpSecurity === 'ssl',
        authType: imapAuth === 'none' ? 'password' : imapAuth,
        username: imapUsername,
        password: password || undefined,
      });
      await connectAndSync(account.id);
      onClose();
      resetForm();
    } catch (err) {
      setError((err as Error).message || 'Failed to add account');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setStep('input');
    setDisplayName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setConfig(null);
    setError('');
    setImapUsername(''); setImapHost(''); setImapPort(993); setImapSecurity('ssl'); setImapAuth('password');
    setSmtpUsername(''); setSmtpHost(''); setSmtpPort(465); setSmtpSecurity('ssl'); setSmtpAuth('password');
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={(e) => { e.stopPropagation(); handleClose(); }}>
      <div className="w-[520px] rounded-xl bg-white dark:bg-navy-900 shadow-2xl border border-gray-200 dark:border-navy-700/50 flex flex-col"
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-navy-700/50">
          <div className="flex items-center gap-2">
            {step === 'result' && (
              <button onClick={() => setStep('input')} className="rounded p-0.5 text-gray-400 hover:text-gray-600 dark:text-navy-400 dark:hover:text-navy-200">
                <ArrowLeft size={16} />
              </button>
            )}
            <Mail size={18} className="text-primary-600 dark:text-primary-400" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-navy-100">
              {step === 'result' ? 'Mail Account Setup' : 'Add Account'}
            </h2>
          </div>
          <button onClick={handleClose} className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-navy-400 dark:hover:text-navy-200 dark:hover:bg-navy-800">
            <X size={16} />
          </button>
        </div>

        {step === 'input' && (
          <div className="px-5 py-5">
            <p className="text-xs text-gray-500 dark:text-navy-400 mb-5">
              Enter your name and email address to automatically configure your account.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-navy-300 mb-1.5">Display Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500" />
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-850 pl-9 pr-3 py-2.5 text-sm text-gray-800 dark:text-navy-100 outline-none placeholder:text-gray-300 dark:placeholder:text-navy-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-200 dark:focus:ring-primary-900/30" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-navy-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                    className={cn(
                      'w-full rounded-lg border bg-white dark:bg-navy-850 pl-9 pr-3 py-2.5 text-sm text-gray-800 dark:text-navy-100 outline-none placeholder:text-gray-300 dark:placeholder:text-navy-500 focus:ring-1',
                      error
                        ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200'
                        : 'border-gray-200 dark:border-navy-700 focus:border-primary-400 focus:ring-primary-200 dark:focus:ring-primary-900/30',
                    )} />
                </div>
                {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
              </div>
            </div>

            <button onClick={handleContinue} disabled={!email.trim()}
              className="mt-5 w-full rounded-lg bg-primary-600 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Continue
            </button>
          </div>
        )}

        {step === 'detecting' && (
          <div className="px-5 py-12 flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-primary-500 animate-spin" />
            <p className="text-sm text-gray-600 dark:text-navy-300">Detecting mail server for <span className="font-medium text-gray-800 dark:text-navy-100">{email}</span>...</p>
          </div>
        )}

        {step === 'result' && config && (
          <div className="px-5 py-5 max-h-[70vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} className="text-green-500" />
              <p className="text-xs text-gray-600 dark:text-navy-300">
                Settings found for <span className="font-medium text-gray-800 dark:text-navy-100">{config.provider}</span>
              </p>
            </div>

            <div className="space-y-5 mt-4">
              <ServerSection
                title="Incoming Server"
                username={imapUsername} onUsernameChange={setImapUsername}
                host={imapHost} onHostChange={setImapHost}
                type="IMAP" port={imapPort} onPortChange={setImapPort}
                security={imapSecurity} onSecurityChange={setImapSecurity}
                auth={imapAuth} onAuthChange={setImapAuth}
              />

              <div className="border-t border-gray-200 dark:border-navy-700/50" />

              <ServerSection
                title="Outgoing Server"
                username={smtpUsername} onUsernameChange={setSmtpUsername}
                host={smtpHost} onHostChange={setSmtpHost}
                type="SMTP" port={smtpPort} onPortChange={setSmtpPort}
                security={smtpSecurity} onSecurityChange={setSmtpSecurity}
                auth={smtpAuth} onAuthChange={setSmtpAuth}
              />

              <div className="border-t border-gray-200 dark:border-navy-700/50" />

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-navy-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your email password"
                    className="w-full rounded-md border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-850 pl-9 pr-10 py-2 text-xs text-gray-800 dark:text-navy-100 outline-none placeholder:text-gray-300 dark:placeholder:text-navy-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-200 dark:focus:ring-primary-900/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-navy-500 dark:hover:text-navy-300"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {error && step === 'result' && (
              <p className="mt-3 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-gray-200 dark:border-navy-700/50">
              <button onClick={handleRetest}
                className="rounded-lg border border-gray-200 dark:border-navy-700 px-4 py-2 text-xs font-medium text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors">
                Re-test
              </button>
              <button onClick={() => setStep('input')}
                className="rounded-lg border border-gray-200 dark:border-navy-700 px-4 py-2 text-xs font-medium text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors">
                Go Back
              </button>
              <button onClick={handleAdd} disabled={!password.trim() || saving}
                className="rounded-lg bg-primary-600 px-5 py-2 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {saving ? 'Connecting...' : 'Done'}
              </button>
              <button onClick={handleClose}
                className="rounded-lg border border-gray-200 dark:border-navy-700 px-4 py-2 text-xs font-medium text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
