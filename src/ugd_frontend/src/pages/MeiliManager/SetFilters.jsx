import React, { useState } from 'react';

const SetFilters = ({ isOpen, onClose, onConfirm, allowedFields }) => {
  const [selectedFields, setSelectedFields] = useState([]);

  const handleFieldChange = (field) => {
    setSelectedFields((currentFields) =>
      currentFields.includes(field)
        ? currentFields.filter((f) => f !== field)
        : [...currentFields, field]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedFields);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', zIndex: 100 }}>
      <h2>Update Filterable Attributes</h2>
      <div style={{ marginBottom: '20px' }}>
        {allowedFields.map((field) => (
          <div key={field}>
            <label>
              <input
                type="checkbox"
                checked={selectedFields.includes(field)}
                onChange={() => handleFieldChange(field)}
              /> {field}
            </label>
          </div>
        ))}
      </div>
      <button onClick={handleConfirm} style={{ marginRight: '8px' }}>Confirm</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default SetFilters;
