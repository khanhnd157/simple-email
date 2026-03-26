import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button onClick={() => !disabled && onChange(!checked)} disabled={disabled}
      className={cn('relative h-5 w-9 rounded-full transition-colors shrink-0',
        checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-navy-600',
        disabled && 'opacity-50 cursor-not-allowed')}>
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
        checked ? 'left-[18px]' : 'left-0.5')} />
    </button>
  );
}

export function Select({ value, onChange, options, className }: {
  value: string; onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-md border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-850 px-3 py-1.5 pr-8 text-sm text-gray-700 dark:text-navy-200 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-400 pointer-events-none" />
    </div>
  );
}

export function NumberInput({ value, onChange, min, max, suffix, className }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string; className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <input type="number" value={value} min={min} max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 rounded-md border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-850 px-2 py-1.5 text-sm text-gray-700 dark:text-navy-200 outline-none focus:border-primary-400 text-center" />
      {suffix && <span className="text-xs text-gray-500 dark:text-navy-400">{suffix}</span>}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, className }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className={cn('rounded-md border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-850 px-3 py-1.5 text-sm text-gray-700 dark:text-navy-200 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200', className)} />
  );
}

export function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-navy-400">{title}</h4>
      <div className="rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-850 divide-y divide-gray-100 dark:divide-navy-700/50">
        {children}
      </div>
    </div>
  );
}

export function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm text-gray-700 dark:text-navy-200">{label}</p>
        {description && <p className="mt-0.5 text-xs text-gray-400 dark:text-navy-400">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SubTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 border-b border-gray-200 dark:border-navy-700 mb-4">
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)}
          className={cn('px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors -mb-px border-b-2',
            active === t
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-400 dark:text-navy-400 hover:text-gray-600 dark:hover:text-navy-200')}>
          {t}
        </button>
      ))}
    </div>
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
      <div className={cn('h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors',
        checked ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-navy-600 group-hover:border-gray-400 dark:group-hover:border-navy-500')}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span className="text-sm text-gray-700 dark:text-navy-200">{label}</span>
    </label>
  );
}

export function RadioGroup({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-1.5">
      {options.map((o) => (
        <label key={o.value} className="flex items-center gap-2.5 cursor-pointer group">
          <div className={cn('h-4 w-4 rounded-full border flex items-center justify-center shrink-0',
            value === o.value ? 'border-primary-600' : 'border-gray-300 dark:border-navy-600 group-hover:border-gray-400 dark:group-hover:border-navy-500')}>
            {value === o.value && <div className="h-2 w-2 rounded-full bg-primary-600" />}
          </div>
          <span className="text-sm text-gray-700 dark:text-navy-200">{o.label}</span>
        </label>
      ))}
    </div>
  );
}

export function Button({ children, variant = 'secondary', onClick, className }: {
  children: React.ReactNode; variant?: 'primary' | 'secondary' | 'danger'; onClick?: () => void; className?: string;
}) {
  return (
    <button onClick={onClick} className={cn(
      'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
      variant === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700',
      variant === 'secondary' && 'border border-gray-200 dark:border-navy-700 text-gray-600 dark:text-navy-200 hover:bg-gray-50 dark:hover:bg-navy-800',
      variant === 'danger' && 'border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20',
      className)}>
      {children}
    </button>
  );
}

export function useSettingState<T>(initial: T) {
  return useState<T>(initial);
}
