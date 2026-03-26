import { Search, X } from 'lucide-react';
import { useEmailStore } from '@/stores/email-store';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useEmailStore();

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search messages..."
        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-8 text-sm outline-none transition-colors focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
