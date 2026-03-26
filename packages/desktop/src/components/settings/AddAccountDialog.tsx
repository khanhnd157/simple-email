import { useState } from 'react';
import { X, Mail, User, Loader2, CheckCircle2, Server, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { detectMailConfig, type MailServerConfig } from '@/lib/email-autoconfig';

type Step = 'input' | 'detecting' | 'result';

export function AddAccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>('input');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [config, setConfig] = useState<MailServerConfig | null>(null);
  const [error, setError] = useState('');

  if (!open) return null;

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
        setStep('result');
      } else {
        setError('Could not detect mail server configuration');
        setStep('input');
      }
    }, 800);
  };

  const handleAdd = () => {
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setStep('input');
    setDisplayName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setConfig(null);
    setError('');
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div className="w-[480px] rounded-xl bg-white dark:bg-navy-900 shadow-2xl border border-gray-200 dark:border-navy-700/50 flex flex-col"
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-navy-700/50">
          <div className="flex items-center gap-2">
            {step === 'result' && (
              <button onClick={() => setStep('input')} className="rounded p-0.5 text-gray-400 hover:text-gray-600 dark:text-navy-400 dark:hover:text-navy-200">
                <ArrowLeft size={16} />
              </button>
            )}
            <Mail size={18} className="text-primary-600 dark:text-primary-400" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-navy-100">Add Account</h2>
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
          <div className="px-5 py-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={18} className="text-green-500" />
              <p className="text-sm font-medium text-gray-800 dark:text-navy-100">Configuration found</p>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-850 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-navy-400">
                <Server size={13} />
                <span className="font-medium text-gray-700 dark:text-navy-200">{config.provider}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-md border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 p-3">
                  <p className="font-semibold text-gray-600 dark:text-navy-300 mb-1.5">Incoming (IMAP)</p>
                  <p className="text-gray-800 dark:text-navy-100">{config.imap.host}</p>
                  <p className="text-gray-500 dark:text-navy-400">Port {config.imap.port} · {config.imap.security.toUpperCase()}</p>
                </div>
                <div className="rounded-md border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 p-3">
                  <p className="font-semibold text-gray-600 dark:text-navy-300 mb-1.5">Outgoing (SMTP)</p>
                  <p className="text-gray-800 dark:text-navy-100">{config.smtp.host}</p>
                  <p className="text-gray-500 dark:text-navy-400">Port {config.smtp.port} · {config.smtp.security.toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-600 dark:text-navy-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your email password"
                  className="w-full rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-850 pl-9 pr-10 py-2.5 text-sm text-gray-800 dark:text-navy-100 outline-none placeholder:text-gray-300 dark:placeholder:text-navy-500 focus:border-primary-400 focus:ring-1 focus:ring-primary-200 dark:focus:ring-primary-900/30"
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

            <button onClick={handleAdd} disabled={!password.trim()}
              className="mt-5 w-full rounded-lg bg-primary-600 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Add Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
