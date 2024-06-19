import type { CSSProperties } from 'react'

export interface IAnnotationItemStyle {
  item: CSSProperties
  itemButton: CSSProperties
}

export const AnnotationItemStyle: IAnnotationItemStyle = {
  item: {},
  itemButton: {
    userSelect: 'none',
    appearance: 'none',
    background: 'none',
    border: 'none',
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
