import { Key, Shield, ShieldCheck, ShieldAlert, X, Upload, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import type { PgpKey } from '@/lib/mock-data-phase3';

const TRUST_STYLES: Record<string, { icon: typeof Shield; color: string; label: string }> = {
  ultimate: { icon: ShieldCheck, color: 'text-green-600', label: 'Ultimate' },
  full: { icon: ShieldCheck, color: 'text-blue-600', label: 'Full' },
  marginal: { icon: ShieldAlert, color: 'text-amber-500', label: 'Marginal' },
  unknown: { icon: Shield, color: 'text-gray-400', label: 'Unknown' },
};

function KeyRow({ pgpKey }: { pgpKey: PgpKey }) {
  const trust = TRUST_STYLES[pgpKey.trustLevel];
  const TrustIcon = trust.icon;

  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 hover:bg-gray-50">
      <div className={cn(
        'flex h-10 w-10 items-center justify-center rounded-lg',
        pgpKey.hasPrivate ? 'bg-green-50' : 'bg-gray-50',
      )}>
        <Key size={18} className={pgpKey.hasPrivate ? 'text-green-600' : 'text-gray-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">{pgpKey.userId}</span>
          {pgpKey.hasPrivate && (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
              Private Key
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">{pgpKey.email}</p>
        <div className="mt-0.5 flex items-center gap-3 text-[10px] text-gray-400">
          <span className="font-mono">{pgpKey.fingerprint.slice(0, 4)} {pgpKey.fingerprint.slice(4, 8)} ... {pgpKey.fingerprint.slice(-8, -4)} {pgpKey.fingerprint.slice(-4)}</span>
          <span>Created {format(pgpKey.createdAt, 'MMM d, yyyy')}</span>
          {pgpKey.expiresAt && (
            <span className="text-amber-500">Expires {format(pgpKey.expiresAt, 'MMM d, yyyy')}</span>
          )}
        </div>
      </div>
      <div className={cn('flex items-center gap-1 text-xs', trust.color)}>
        <TrustIcon size={14} />
        {trust.label}
      </div>
    </div>
  );
}

export function KeyManager() {
  const { keyManagerOpen, closeKeyManager, pgpKeys } = useAppStore();
  if (!keyManagerOpen) return null;

  const privateKeys = pgpKeys.filter((k) => k.hasPrivate);
  const publicKeys = pgpKeys.filter((k) => !k.hasPrivate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={closeKeyManager}>
      <div className="w-[640px] max-h-[80vh] rounded-xl bg-white shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-3">
          <Shield size={18} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-gray-800">PGP Key Manager</h2>
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">
            <Upload size={13} /> Import Key
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1 text-xs font-medium text-white hover:bg-primary-700">
            <Plus size={13} /> Generate
          </button>
          <button onClick={closeKeyManager} className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {privateKeys.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Your Keys ({privateKeys.length})
              </div>
              {privateKeys.map((k) => <KeyRow key={k.id} pgpKey={k} />)}
            </div>
          )}
          {publicKeys.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Other Keys ({publicKeys.length})
              </div>
              {publicKeys.map((k) => <KeyRow key={k.id} pgpKey={k} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
