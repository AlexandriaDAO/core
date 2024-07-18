import React, { useState, useEffect } from 'react';
import DDC from "../../../../data/categories";

interface CategorySelectProps {
  setMetadata: (metadata: any) => void;
  metadata: any;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  setMetadata,
  metadata
}) => {
  const [selectedMainCategory, setSelectedMainCategory] = useState<number | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<number[]>([]);

  useEffect(() => {
    // Initialize from metadata
    if (metadata.type !== undefined) {
      setSelectedMainCategory(parseInt(metadata.type, 10));
    }
    const initialSubcategories = [];
    for (let i = 0; i < 10; i++) {
      if (metadata[`type${i}`] === '1') {
        initialSubcategories.push(i);
      }
    }
    setSelectedSubcategories(initialSubcategories);
  }, []);

  useEffect(() => {
    updateMetadata();
  }, [selectedMainCategory, selectedSubcategories]);

  const updateMetadata = () => {
    if (selectedMainCategory !== null) {
      const newMetadata = { ...metadata };
      newMetadata.type = selectedMainCategory.toString();
      
      for (let i = 0; i < 10; i++) {
        newMetadata[`type${i}`] = selectedSubcategories.includes(i) ? '1' : '0';
      }

      setMetadata(newMetadata);
    }
  };

  const handleMainCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value, 10);
    setSelectedMainCategory(value);
    setSelectedSubcategories([]);
  };

  const handleSubcategoryChange = (subcategory: number) => {
    if (selectedSubcategories.includes(subcategory)) {
      setSelectedSubcategories(selectedSubcategories.filter(sc => sc !== subcategory));
    } else if (selectedSubcategories.length < 3) {
      setSelectedSubcategories([...selectedSubcategories, subcategory]);
    } else {
      alert('You must select exactly 3 subcategories.');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: 'auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>Type</label>
        <select
          onChange={handleMainCategoryChange}
          value={selectedMainCategory || ''}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
        >
          <option value="">Select a Category</option>
          {Object.entries(DDC).map(([key, value]) => (
            <option key={key} value={key}>{value.type}</option>
          ))}
        </select>
      </div>

      {selectedMainCategory !== null && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>Subtypes (Select exactly 3)</label>
          {Object.entries(DDC[selectedMainCategory]?.category || {}).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '5px' }}>
              <input
                type="checkbox"
                id={`subtype-${key}`}
                checked={selectedSubcategories.includes(parseInt(key, 10))}
                onChange={() => handleSubcategoryChange(parseInt(key, 10))}
                disabled={selectedSubcategories.length >= 3 && !selectedSubcategories.includes(parseInt(key, 10))}
              />
              <label htmlFor={`subtype-${key}`} style={{ marginLeft: '5px' }}>{value}</label>
            </div>
          ))}
        </div>
      )}

      <div>
        <strong>Selected Subcategories:</strong>
        <ul>
          {selectedSubcategories.map((subcat) => (
            <li key={subcat}>{DDC[selectedMainCategory!]?.category[subcat]}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategorySelect;