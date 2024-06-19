import type { CSSProperties } from 'react'

export interface IContentViewStyle {
  reader: CSSProperties
  viewHolder: CSSProperties
  view: CSSProperties

  swipeWrapper: CSSProperties
  prev: CSSProperties
  next: CSSProperties
  arrow: CSSProperties
  arrowHover: CSSProperties
}

export const ContentViewStyle: IContentViewStyle = {
  reader: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  viewHolder: {
    position: 'relative',
    height: '100%',
  },
  view: {
    height: '100%',
  },
  swipeWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 200,
  },
  prev: {
    left: 1,
  },
  next: {
    right: 1,
  },
  arrow: {
    outline: 'none',
    border: 'none',
    background: 'none',
    position: 'absolute',
    top: '50%',
    marginTop: -32,
    fontSize: 64,
    padding: '0 10px',
    color: '#E2E2E2',
    fontFamily: 'arial, sans-serif',
    cursor: 'pointer',
    userSelect: 'none',
    appearance: 'none',
    fontWeight: 'normal',
  },
  arrowHover: {
    color: '#777',
  },
}
