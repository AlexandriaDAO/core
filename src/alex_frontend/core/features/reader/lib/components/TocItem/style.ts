import type { CSSProperties } from 'react'

export interface ITocItemStyle {
  item: CSSProperties
  itemButton: CSSProperties
}

export const TocItemStyle: ITocItemStyle = {
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
