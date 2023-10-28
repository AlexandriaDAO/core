import React from 'react'
import { CardDetailsFrontProps } from './types'

const CardDetailsFront: React.FC<CardDetailsFrontProps> = ({ messageData, messageType }) => {
  return (
    <div className='messageCardFrontDetails'>
      {messageType === 'input' ? <p>{messageData.user_query}</p> : <p>{messageData.message}</p>}
    </div>
  )
}

export default CardDetailsFront
