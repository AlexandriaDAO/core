import DDC from '@/data/categories';
import eras from '@/data/eras';
import { Label } from '@/lib/components/label';
import React, { useState, useEffect } from 'react';

interface CategorySelectProps {
  setMetadata: (metadata: any) => void;
  metadata: any;
  isSubmitAttempted: boolean;
}


const CategorySelect: React.FC<CategorySelectProps> = ({
  setMetadata,
  metadata,
  isSubmitAttempted
}) => {
  const [selectedMainCategory, setSelectedMainCategory] = useState<number>(-1);
  const [selectedSubcategories, setSelectedSubcategories] = useState<number[]>([]);
  const [errors, setErrors] = useState<{category?: string, subcategories?: string, era?: string}>({});

  useEffect(() => {
    // Initialize from metadata
    if (metadata.type !== undefined) {
      setSelectedMainCategory(parseInt(metadata.type, 10));
    }

    if(Array.isArray(metadata['categories'])){
      setSelectedSubcategories(metadata['categories']);
    }else{
      setSelectedSubcategories([]);
    }
  }, []);

  useEffect(() => {
    updateMetadata();
    validateFields();
  }, [selectedMainCategory, selectedSubcategories, metadata.era]);

  const updateMetadata = () => {
    if (selectedMainCategory >= 0) {
      const newMetadata = { ...metadata };
      newMetadata.type = selectedMainCategory;
      
      // for (let i = 0; i < 10; i++) {
      //   newMetadata[`type${i}`] = selectedSubcategories.includes(i) ? '1' : '0';
      // }

      newMetadata['categories'] = selectedSubcategories
      setMetadata(newMetadata);
    }
  };

  const validateFields = () => {
    const newErrors: {category?: string, subcategories?: string, era?: string} = {};

    if (selectedMainCategory < 0) {
      newErrors.category = "Please select a main category";
    }

    if (selectedSubcategories.length !== 3) {
      newErrors.subcategories = "Please select exactly 3 subcategories";
    }

    if (!metadata.era) {
      newErrors.era = "Please select an era";
    }

    setErrors(newErrors);
    
    // Return true if there are no errors
    return Object.keys(newErrors).length === 0;
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
    <>
      <div className="flex flex-col gap-1 w-full justify-between items-start">
        <Label
          htmlFor="type"
          scale="md"
          variant={(isSubmitAttempted && selectedMainCategory<0 ? "destructive" : "default" ) }
        >
          Type
        </Label>
        <select
          onChange={handleMainCategoryChange}
          value={selectedMainCategory}
          className="w-full py-1 px-2 placeholder-gray-600 border border-gray-800 rounded focus:shadow-outline" id="type"
        >
          <option value="-1">Select a Category</option>
          {Object.entries(DDC).map(([key, value]) => (
            <option key={key} value={key}>{value.type}</option>
          ))}
        </select>
        {isSubmitAttempted && selectedMainCategory<0 && (
          <p style={{ color: 'red' }}>Please select a category</p>
        )}
      </div>

      {selectedMainCategory >= 0 && (
        <div>
          <Label
            scale="md"
            variant={(isSubmitAttempted && selectedSubcategories.length<0 ? "destructive" : "default" ) }
          >
            Subtypes (Select exactly 3)
          </Label>
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
          {isSubmitAttempted && selectedSubcategories.length !== 3 && (
            <p style={{ color: 'red' }}>Please select exactly 3 subcategories</p>
          )}
        </div>
      )}

      {selectedSubcategories && selectedSubcategories.length > 0 && (<div>
        <strong>Selected Subcategories:</strong>
        <ul>
          {selectedSubcategories.map((subcat) => (
            <li key={subcat}>{DDC[selectedMainCategory!]?.category[subcat]}</li>
          ))}
        </ul>
      </div>)}

      <div className="flex flex-col gap-1 w-full justify-between items-start">
        <Label
          htmlFor="era"
          scale="md"
          variant={(isSubmitAttempted && errors.era ? "destructive" : "default" ) }
        >
          Historical Era
        </Label>
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
        {isSubmitAttempted && errors.era && <p style={{ color: 'red' }}>{errors.era}</p>}
      </div>

    </>
  );
};

export default CategorySelect;