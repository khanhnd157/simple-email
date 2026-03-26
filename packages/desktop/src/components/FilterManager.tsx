import { Filter, Plus, Trash2, ToggleLeft, ToggleRight, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import type { FilterRule } from '@/lib/mock-data-phase3';

const ACTION_LABELS: Record<string, string> = {
  moveTo: 'Move to',
  markRead: 'Mark as read',
  star: 'Star',
  delete: 'Delete',
  label: 'Label',
};

function FilterRow({ rule }: { rule: FilterRule }) {
  const { toggleFilter, deleteFilter } = useAppStore();

  return (
    <div className={cn(
      'group border-b border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors',
      !rule.enabled && 'opacity-50',
    )}>
      <div className="flex items-center gap-3">
        <button onClick={() => toggleFilter(rule.id)}>
          {rule.enabled
            ? <ToggleRight size={22} className="text-primary-600" />
            : <ToggleLeft size={22} className="text-gray-300" />
          }
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{rule.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
            {rule.conditions.map((c, i) => (
              <span key={i} className="rounded bg-blue-50 px-2 py-0.5 text-blue-600">
                {c.field} {c.operator} "{c.value}"
              </span>
            ))}
            <ArrowRight size={12} className="text-gray-300 mx-1" />
            {rule.actions.map((a, i) => (
              <span key={i} className="rounded bg-green-50 px-2 py-0.5 text-green-600">
                {ACTION_LABELS[a.type]}{a.value ? `: ${a.value}` : ''}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => deleteFilter(rule.id)}
          className="shrink-0 rounded p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export function FilterManager() {
  const { filterRules, openFilterDialog } = useAppStore();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-2.5">
        <Filter size={20} className="text-primary-600" />
        <h2 className="text-sm font-semibold text-gray-800">Filters & Rules</h2>
        <span className="text-xs text-gray-400">
          ({filterRules.filter((r) => r.enabled).length} active)
        </span>
        <button
          onClick={() => openFilterDialog()}
          className="ml-auto flex items-center gap-1 rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-primary-700"
        >
          <Plus size={13} /> Add Rule
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filterRules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <Filter size={40} strokeWidth={1} />
            <p className="mt-2 text-sm">No filter rules configured</p>
          </div>
        ) : (
          filterRules.map((r) => <FilterRow key={r.id} rule={r} />)
        )}
      </div>
    </div>
  );
}
