import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react";
import { HiSearch, HiX } from "react-icons/hi";

interface SearchProps {
	setSearch: Dispatch<SetStateAction<string>>;
}

const Search: FC<SearchProps> = ({ setSearch }) => {
	const initial = useRef(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		if (initial.current) {
			initial.current = false;
			return;
		}
		const searchDebounce = setTimeout(() => {
			handleSearch()
		}, 500);

		return () => clearTimeout(searchDebounce);
	}, [setSearch, searchQuery]);

	const clearSearch = () => {
		setSearchQuery("");
	}

	const handleSearch = () => {
		setSearch(searchQuery);
	}
	return (
		<div className="relative flex items-center justify-center text-white">
			<input
				type="text"
				value={searchQuery}
				placeholder="Search..."
				className="bg-black w-full rounded-md border-gray-300 shadow-sm focus:border-violet-300 focus:ring focus:ring-inset"
				onChange={(e) => setSearchQuery(e.target.value)}
			/>
			<span>
				<HiSearch onClick={handleSearch} />
			</span>
			{searchQuery && (
				<button
					onClick={clearSearch}
					className="absolute right-4 focus:outline-none flex items-center"
				>
					<HiX />
				</button>
			)}
		</div>
	);
};

export default Search;