import DDC from '@/data/categories';
import React from 'react';

interface CategorySelectProps {
  selectedCategories: number[];
  setSelectedCategories: (categories: number[]) => void;
  selectedType: number | null;
  setSelectedType: (category: number | null) => void;
  setMetadata: (metadata: any) => void;
  metadata: any;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  selectedCategories,
  setSelectedCategories,
  selectedType,
  setSelectedType,
  setMetadata,
  metadata
}) => {

  const addCategory = (category: number) => {
    if (selectedCategories.length < 5 && !selectedCategories.includes(category)) {
      const updatedCategories = [...selectedCategories, category];
      setSelectedCategories(updatedCategories);
      updateMetadataForCategories(updatedCategories);
    } else {
      alert('You can only select up to 5 categories.');
    }
  };

  const removeCategory = (category: number) => {
    const updatedCategories = selectedCategories.filter((c) => c !== category);
    setSelectedCategories(updatedCategories);
    updateMetadataForCategories(updatedCategories);
  };

  const updateMetadataForCategories = (selectedCategories: number[]) => {
    const uniqueMainCategories = Array.from(new Set(selectedCategories.map(category => Math.floor(category / 10))));
    // const types = `[${uniqueMainCategories.join(', ')}]`;
    const types = uniqueMainCategories;
    // const subtypes = `[${selectedCategories.join(', ')}]`;
    const subtypes = selectedCategories;
    setMetadata({ ...metadata, type: types, subtype: subtypes });
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value, 10);
    setSelectedType(value);
  };

  const handleSubcategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value, 10);
    addCategory(value);
  };


  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: 'auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>Type</label>
        <select
          onChange={handleTypeChange}
          value={selectedType || ''}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
        >
          <option value="">Select a Category</option>
          {Object.entries(DDC).map(([key, value]) => (
            <option key={key} value={key}>{value.type}</option>
          ))}
        </select>
      </div>

      {selectedType !== null && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>Subtype</label>
          <select
            onChange={handleSubcategoryChange}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
          >
            <option value="">Select a Subcategory</option>
            {Object.entries(DDC[selectedType]?.category || {}).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        {selectedCategories.map((category, index) => (
          <span
            key={index}
            onClick={() => removeCategory(category)}
            style={{
              cursor: 'pointer',
              margin: '0 5px',
              padding: '5px 10px',
              display: 'inline-block',
              background: '#e0e0e0',
              borderRadius: '15px',
              border: 'none',
              fontSize: '14px'
            }}
          >
            {DDC[Math.floor(category / 10)]?.category[category]} <b style={{ cursor: 'pointer' }}>✕</b>
          </span>
        ))}
      </div>
    </div>
  );
};

export default CategorySelect;
