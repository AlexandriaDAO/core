import type { CSSProperties } from 'react'

export interface IBookmarkToggleStyle {
  Button: CSSProperties
  ButtonExpanded: CSSProperties
  ButtonBar: CSSProperties
  ButtonBarTop: CSSProperties
  ButtonBottom: CSSProperties
}

export const BookmarkToggleStyle: IBookmarkToggleStyle = {
  Button: {
    background: 'none',
    border: 'none',
    width: 32,
    height: 32,
    position: 'absolute',
    top: 10,
    left: 50,
    borderRadius: 2,
    outline: 'none',
    cursor: 'pointer',
  },
  ButtonExpanded: {
    background: '#f2f2f2',
  },
  ButtonBar: {
    position: 'absolute',
    width: 2,
    background: '#ccc',
    height: '60%',
    left: '50%',
    margin: '-1px -30%',
    top: '30%',
    transition: 'all .5s ease',
  },
  ButtonBarTop: {
    left: '60%',
  },
  ButtonBottom: {
    left: '90%',
  },
}
