import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = 'Buscar diseños...', size = 'medium', autoFocus = false, fullWidth = true }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (onSearch) onSearch(q);
  };

  const isLarge = size === 'large';
  const containerClasses = `flex items-center gap-2 rounded-full border border-slate-200 bg-white shadow-sm ${fullWidth ? 'w-full' : 'w-auto'} ${isLarge ? 'px-4 py-2.5' : 'px-3 py-2'}`;
  const inputClasses = `flex-1 bg-transparent border-0 focus:ring-0 focus-visible:ring-0 placeholder:text-slate-500 ${isLarge ? 'text-base' : 'text-sm'}`;

  return (
    <form onSubmit={handleSubmit} className={containerClasses} aria-label={placeholder} role="search">
      <Input
        className={inputClasses}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus={autoFocus}
      />
      <Button type="submit" variant="default" aria-label="buscar">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default SearchBar;