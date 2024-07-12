import DDC from '@/data/categories';
import React, { useState, useEffect } from 'react';

interface CategorySelectProps {
  setMetadata: (metadata: any) => void;
  metadata: any;
}

const eras = [
  { value: 1, label: "Prehistoric (-10000 to -2000)", range: [-10000, -2000] },
  { value: 2, label: "Ancient (-2000 to -500)", range: [-2000, -500] },
  { value: 3, label: "Classical Antiquity (-500 to 0)", range: [-500, 0] },
  { value: 4, label: "Late Antiquity and Early Middle Ages (0 to 500)", range: [0, 500] },
  { value: 5, label: "Early Medieval (500 to 1000)", range: [500, 1000] },
  { value: 6, label: "High Medieval (1000 to 1300)", range: [1000, 1300] },
  { value: 7, label: "Late Middle Age, Early Renaissance (1300 to 1500)", range: [1300, 1500] },
  { value: 8, label: "Renaissance (1500 to 1700)", range: [1500, 1700] },
  { value: 9, label: "Age of Enlightenment (1700 to 1800)", range: [1700, 1800] },
  { value: 10, label: "Early Industrial (1800 to 1850)", range: [1800, 1850] },
  { value: 11, label: "Late Industrial (1850 to 1900)", range: [1850, 1900] },
  { value: 12, label: "Early 20th Century (1900 to 1950)", range: [1900, 1950] },
  { value: 13, label: "Post-War (1950 to 1975)", range: [1950, 1975] },
  { value: 14, label: "Late 20th Century (1975 to 2000)", range: [1975, 2000] },
  { value: 15, label: "Early 21st Century (2000 to 2020)", range: [2000, 2020] },
  { value: 16, label: "Contemporary (2020 onwards)", range: [2020, 10000] },
];

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

  const handleEraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setMetadata({ ...metadata, era: value });
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

      <div className="flex flex-col gap-1 w-full justify-between items-start">
        <label htmlFor="era">Historical Era</label>
        <select
          id="era"
          value={metadata.era || ''}
          onChange={handleEraChange}
          className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline"
        >
          <option value="">Select an Era</option>
          {eras.map((era) => (
            <option key={era.value} value={era.value}>
              {era.label}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
};

export default CategorySelect;