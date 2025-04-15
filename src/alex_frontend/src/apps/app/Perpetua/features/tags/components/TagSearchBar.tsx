import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/lib/components/input'; // Assuming Input component exists
import { LoaderCircle, Search } from 'lucide-react';
import { useTagActions } from '../hooks/useTagActions';
import { useTagData } from '../hooks/useTagData';
import debounce from 'lodash/debounce';

const DEBOUNCE_DELAY = 300; // ms

export const TagSearchBar: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { fetchTagsWithPrefix, setTagFilter } = useTagActions();
    const { tagSearchResults, isTagSearchLoading } = useTagData();
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounced fetch function
    const debouncedFetch = useCallback(
        debounce((prefix: string) => {
            if (prefix.trim()) {
                fetchTagsWithPrefix(prefix);
            }
        }, DEBOUNCE_DELAY),
        [fetchTagsWithPrefix]
    );

    useEffect(() => {
        debouncedFetch(searchTerm);
        // Cleanup debounce on unmount or when searchTerm changes
        return () => {
            debouncedFetch.cancel();
        };
    }, [searchTerm, debouncedFetch]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleTagSelect = (tagName: string) => {
        setTagFilter(tagName);
        setSearchTerm(''); // Clear search bar
        setIsFocused(false); // Hide dropdown
    };

    const showDropdown = isFocused && searchTerm.trim().length > 0;

    return (
        <div className="relative w-full max-w-xs" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search tags..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    className="pl-9 pr-8" // Padding for icons
                />
                {isTagSearchLoading && (
                    <LoaderCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                )}
            </div>

            {showDropdown && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <ul className="p-1">
                        {tagSearchResults.length > 0 ? (
                            tagSearchResults.map((tag) => (
                                <li
                                    key={tag} // Assuming tag is a string
                                    className="px-3 py-1.5 text-sm rounded cursor-pointer hover:bg-accent"
                                    onClick={() => handleTagSelect(tag)} // Assuming tag is a string
                                >
                                    {tag} {/* Assuming tag is a string */}
                                </li>
                            ))
                        ) : !isTagSearchLoading ? (
                            <li className="px-3 py-1.5 text-sm text-muted-foreground text-center">No matching tags found.</li>
                        ) : null /* Show nothing while loading */}
                    </ul>
                </div>
            )}
        </div>
    );
}; 