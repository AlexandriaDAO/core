import React, { useState } from 'react'
import ReactStars from 'react-rating-star-with-type'

interface RatingStarInterface{
  value?: number;
  size?: number;
}

const RatingCard:React.FC = ({value,size}:RatingStarInterface) => {

  const [star, setStar] = useState(5);

  const onChange=(nextValue:number)=>{
      setStar(nextValue)
  }
  return (
    <ReactStars 
    onChange={onChange} 
    value={value || 5}  
    size={size || 20}
    isEdit={true}  
    activeColors={["#8568FC",]} 
    />
  )
}

export default RatingCard
