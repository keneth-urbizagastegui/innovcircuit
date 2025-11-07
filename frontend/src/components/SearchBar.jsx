import React, { useState } from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ onSearch, placeholder = 'Buscar diseños...', size = 'medium', autoFocus = false, fullWidth = true }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (onSearch) onSearch(q);
  };

  const height = size === 'large' ? 52 : 40;

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', alignItems: 'center', p: 0.5, pl: 1.5, borderRadius: 10, width: fullWidth ? '100%' : 'auto' }}
      elevation={3}
    >
      <InputBase
        sx={{ ml: 1, flex: 1, height }}
        placeholder={placeholder}
        inputProps={{ 'aria-label': placeholder }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus={autoFocus}
      />
      <IconButton type="submit" color="primary" aria-label="buscar" sx={{ p: 1 }}>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchBar;