import { useState, useRef } from "react";
import './SearchBar.css';

const COLORS = ["#e77c5e", "#5b8ef4", "#a85ef4", "#3ecf8e", "#f4b25b", "#f45b8e"];

function SearchBar({ onSelectUser }) {
    const [search, setSearch] = useState("")
    const [focused, setFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const searchTimeout = useRef(null);
    const apiUrl = "http://localhost:3000";
    // const apiUrl = import.meta.env.VITE_WEMESSAGE_API_URL;

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);

        // debounce — wait for user to stop typing before fetching
        clearTimeout(searchTimeout.current);
        if (!value.trim()) {
            setSearchResults([]);
            return;
        }
        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await fetch(`${apiUrl}/api/search/${value}`);
                const data = await res.json();
                setSearchResults(data);
            } catch (error) {
                console.error('Search error:', error);
            }
        }, 300);
    };

    return (
        <div className="search-bar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input 
        placeholder="Search conversations..." 
        value={search} 
        onChange={handleSearch}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
    />
    {focused && searchResults.length > 0 && (
        <div className="search-results">
            {searchResults.map(user => (
                <div 
                    key={user._id} 
                    className="search-result-item"
                    onClick={() => onSelectUser(user)}
                >
                    <div className="search-result-avatar">{user.name[0].toUpperCase()}</div>
                    <span>{user.name}</span>
                </div>
            ))}
        </div>
    )}
        </div >
    );
}

export default SearchBar;