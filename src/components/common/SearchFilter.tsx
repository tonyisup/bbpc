import React, { useEffect, useRef, useState } from 'react';
import { HiSearch } from 'react-icons/hi';

const SearchFilter = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
	const initial = useRef(true);

	useEffect(() => {
		if (initial.current) {
			initial.current = false;
			return;
		}
		const searchDebounce = setTimeout(() => {
			onSearch(searchQuery);
		}, 500);

		return () => clearTimeout(searchDebounce);
	}, [onSearch, searchQuery]);
	
  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex items-center">
        <input
          type="text"
          placeholder="Search episodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow p-2 border text-black border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="bg-red-600 text-white p-2 rounded-r-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <HiSearch className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default SearchFilter;