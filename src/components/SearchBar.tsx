'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Search cards..." }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-slate-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-slate-400" />
        </button>
      )}
    </div>
  );
}

