import React, { useState } from 'react';
import AUTHOR_INFO from '../../assets/author_data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBars, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import '../../styles/AuthorFilter.css'

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
}) => (
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
                        checked={selectedAuthors.length === AUTHOR_INFO.length}
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
                    {AUTHOR_INFO.filter(author => 
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

            </div>
        )}
    </>
);

export default AuthorFilter;
