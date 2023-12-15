import type { CSSProperties } from 'react'

export interface ISearchItemStyle {
  item: CSSProperties
  itemButton: CSSProperties
}

export const SearchItemStyle: ISearchItemStyle = {
  item: {},
  itemButton: {
    userSelect: 'none',
    appearance: 'none',
    background: 'none',
    display: 'block',
    fontFamily: 'sans-serif',
    width: '100%',
    fontSize: '.9em',
    textAlign: 'left',
    boxSizing: 'border-box',
    outline: 'none',
    cursor: 'pointer',
  },
}
