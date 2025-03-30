import React from 'react'
import IIProcessor from './IIProcessor'
import NFIDProcessor from './NFIDProcessor'
// import ETHProcessor from './ETHProcessor'
// import SOLProcessor from './SOLProcessor'

const Processors = () => {
  return (
    <div className='flex flex-col gap-2'>
        <IIProcessor />
        {/* <ETHProcessor />
        <SOLProcessor /> */}
        <NFIDProcessor />
    </div>
  )
}

export default Processors