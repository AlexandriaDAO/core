import React, { useState, useEffect } from 'react';
import { connectRange } from 'react-instantsearch-dom';

const RangeSlider = ({ min, max, currentRefinement, refine }) => {
  const [minValue, setMinValue] = useState(currentRefinement.min);
  const [maxValue, setMaxValue] = useState(currentRefinement.max);

  useEffect(() => {
    setMinValue(currentRefinement.min);
    setMaxValue(currentRefinement.max);
  }, [currentRefinement.min, currentRefinement.max]);

  const handleMinChange = (event) => {
    const value = Math.min(Number(event.target.value), maxValue - 1);
    setMinValue(value);
    refine({ ...currentRefinement, min: value });
  };

  const handleMaxChange = (event) => {
    const value = Math.max(Number(event.target.value), minValue + 1);
    setMaxValue(value);
    refine({ ...currentRefinement, max: value });
  };

  return (
    <div>
      <label>
        Min:
        <input
          type="range"
          name="min"
          min={min}
          max={max}
          value={minValue}
          onChange={handleMinChange}
        />
        {minValue}
      </label>
      <label>
        Max:
        <input
          type="range"
          name="max"
          min={min}
          max={max}
          value={maxValue}
          onChange={handleMaxChange}
        />
        {maxValue}
      </label>
      <div>
        <input
          type="number"
          name="min"
          min={min}
          max={max}
          value={minValue}
          onChange={(e) => handleMinChange(e)}
        />
        <input
          type="number"
          name="max"
          min={min}
          max={max}
          value={maxValue}
          onChange={(e) => handleMaxChange(e)}
        />
      </div>
    </div>
  );
};

const CustomRangeSlider = connectRange(RangeSlider);

export default CustomRangeSlider;
