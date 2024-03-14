import React from 'react'

type Props = {}

const Search = (props: Props) => {
  return (
    <div className='flex justify-between items-center gap-2 mt-10'>
        <div className="p-4 text-black shadow-xl border border-solid rounded-t-lg bg-white scale-y-100 transition-all duration-500 flex-grow flex justify-center items-center">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Et, aspernatur?
        </div> 
        <div className="p-4 text-black shadow-xl border border-solid rounded-t-lg bg-white scale-y-100 transition-all duration-500 flex-grow flex justify-center items-center">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Et, aspernatur?
        </div> 
        <div className="p-4 text-black shadow-xl border border-solid rounded-t-lg bg-white scale-y-100 transition-all duration-500 flex-grow flex justify-center items-center">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Et, aspernatur?
        </div>
        
    </div>
  )
}

export default Search