import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export const TaskSearch = ({ value = '', onChange, placeholder = 'Search tasks by title or description...' }) => {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleClear = () => {
    setSearchTerm('');
    if (onChange) onChange('');
  };

  const handleChange = (e) => {
    const newVal = e.target.value;
    setSearchTerm(newVal);
    if (onChange) onChange(newVal);
  };

  return (
    <div className="relative w-full max-w-md font-montserrat">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] transition-all rounded-none"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default TaskSearch;
