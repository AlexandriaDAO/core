import React from 'react';
import { connectRefinementList } from 'react-instantsearch-dom';

const TypeRefinementList = ({ items, refine }:any) => (
  <ul>
    {items.map((item:any) => (
      <li key={item.label}>
        <label>
          <input
            type="checkbox"
            checked={item.isRefined}
            onChange={() => refine(item.value)}
          />
          {item.label} ({item.count})
        </label>
      </li>
    ))}
  </ul>
);

const ConnectedTypeRefinementList = connectRefinementList(TypeRefinementList);

export default ConnectedTypeRefinementList