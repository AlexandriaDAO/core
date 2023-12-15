import type { CSSProperties } from 'react'

export interface IDrawerStyle {
  Background: CSSProperties
  sidebar: CSSProperties
  Area: CSSProperties
  tab_content: CSSProperties
}

export const DrawerStyle: IDrawerStyle = {
  sidebar: {
    display: 'flex',
  },
  Background: {
    position: 'absolute',
    left: 256,
    top: 0,
    bottom: 0,
    right: 0,
    zIndex: 1,
  },
  Area: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 0,
    width: 256,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    padding: '10px 0',
  },
  tab_content: {
    flexGrow: '1',
  },
}
