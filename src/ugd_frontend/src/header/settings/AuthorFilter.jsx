import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBars, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/AuthorFilter.css'
import { useAuthors } from '../../contexts/AuthorContext';
import { useSettings } from '../../contexts/SettingsContext';

const CollapsibleSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="collapsible-section">
            <button className="collapsible-header" onClick={() => setIsOpen(!isOpen)}>
                {title}
                <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
            </button>
            {isOpen && <div className="collapsible-content">{children}</div>}
        </div>
    );
}

const AuthorFilter = ({ 
    isDropdownVisible, 
    toggleDropdown, 
    selectedAuthors, 
    handleAuthorSelection, 
    handleAllBooksSelection,
    allCategories,
    selectedCategories,
    handleCategorySelection 
}) => {
    const { authors } = useAuthors();
    const { topBooksCount, setTopBooksCount } = useSettings();

    return (
        <>
            <button className="filter-icon-button" onClick={toggleDropdown}>
                <FontAwesomeIcon icon={isDropdownVisible ? faTimes : faBars} />
            </button>
            {isDropdownVisible && (
                <div className="filter-popup">
                    <div className="filter-item">
                        <input 
                            type="checkbox" 
                            id="all-books" 
                            checked={selectedAuthors.length === authors.length}
                            onChange={handleAllBooksSelection}
                        />
                        <label htmlFor="all-books">All Books</label>
                    </div>

                    <CollapsibleSection title="Categories">
                        {allCategories.map(category => (
                            <div key={category} className="filter-item">
                                <input 
                                    type="checkbox"
                                    id={category}
                                    checked={selectedCategories.includes(category)}
                                    onChange={() => handleCategorySelection(category)}
                                />
                                <label htmlFor={category}>{category}</label>
                            </div>
                        ))}
                    </CollapsibleSection>

                    <CollapsibleSection title="Authors">
                        {authors.filter(author =>
                            selectedCategories.some(cat => author.category.includes(cat)) ||
                            selectedCategories.length === 0
                        ).map(author => (
                            <div key={author.id} className="filter-item">
                                <input 
                                    type="checkbox"
                                    id={author.id}
                                    checked={selectedAuthors.includes(author.id)}
                                    onChange={() => handleAuthorSelection(author.id)}
                                />
                                <label htmlFor={author.id}>{author.id}</label>
                            </div>
                        ))}
                    </CollapsibleSection>

                    <CollapsibleSection title="Settings">
                        <div className="slider-container">
                        <label htmlFor="top-books-slider">Top Books to Display: {topBooksCount}</label>
                        <input 
                            id="top-books-slider" 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={topBooksCount} 
                            onChange={e => setTopBooksCount(Number(e.target.value))}
                        />
                        </div>
                    </CollapsibleSection>

                </div>
            )}
        </>
    );
};

export default AuthorFilter;
