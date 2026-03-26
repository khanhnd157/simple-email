import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEmailStore } from '@/stores/email-store';

export function SearchBar() {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery } = useEmailStore();

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t('mail.search')}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-1.5 pl-9 pr-8 text-sm text-gray-900 dark:text-gray-100 outline-none transition-colors focus:border-primary-300 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30"
      />
      {searchQuery && (
        <button onClick={() => setSearchQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
