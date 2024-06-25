import type { CSSProperties } from 'react'

export interface IReaderStyle {
  container: CSSProperties
  readerArea: CSSProperties
  containerExpanded: CSSProperties
  titleArea: CSSProperties
  loadingView: CSSProperties
}

export const ReaderStyle: IReaderStyle = {
  container: {
    overflow: 'hidden',
    position: 'relative',
    height: '100%',
    background: 'rgb(50, 54, 57)',
  },
  readerArea: {
    position: 'relative',
    zIndex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#fff',
    transition: 'all .3s ease',
  },
  containerExpanded: {
    transform: 'translateX(256px)',
  },
  titleArea: {
    position: 'absolute',
    top: 20,
    left: 50,
    right: 50,
    textAlign: 'center',
    color: '#999',
  },

  loadingView: {
    position: 'absolute',
    top: '50%',
    left: '10%',
    right: '10%',
    color: '#ccc',
    textAlign: 'center',
    marginTop: '-.5em',
  },
}
