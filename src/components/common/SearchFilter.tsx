import React, { useState, useEffect } from 'react';
import { HiSearch } from 'react-icons/hi';

const SearchFilter = ({ 
  onSearch, 
  initialValue = '' 
}: { 
  onSearch: (query: string) => void;
  initialValue?: string;
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);

  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  const handleSearch = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex items-center">
        <input
          type="text"
          placeholder="Search episodes..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onSearch(e.target.value);
          }}
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <button
          type="submit"
          title="Search"
          className="border border-gray-600 bg-gray-800 p-2 rounded-r-md hover:bg-gray-700 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black"
        >
          <HiSearch className="w-6 h-6 text-gray-300" />
        </button>
      </form>
    </div>
  );
};

export default SearchFilter;