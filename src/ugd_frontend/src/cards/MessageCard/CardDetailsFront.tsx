import React from 'react'
import { CardDetailsFrontProps } from './types'

const CardDetailsFront: React.FC<CardDetailsFrontProps> = ({ messageData, messageType }) => {
  let MaxText = 500

  const MinifiedText = (text: string) => {
    let textLength = text.length
    return textLength > MaxText ? <p>{text.slice(0, MaxText)}. <button>Show More Details</button></p> : <p>{text}</p>
  }

  return (
    <div className='messageCardFrontDetails'>
      {messageType === 'input' ? MinifiedText(messageData.user_query) : MinifiedText(messageData.message)}
    </div>
  )
}

export default CardDetailsFront
