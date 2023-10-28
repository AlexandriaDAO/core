import { faRefresh } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { DetailsHeaderInterface } from './types'


const DetailsHeader: React.FC<DetailsHeaderInterface> = ({ onFlip, onMessageTypeUpdate, messageType }) => {

  const isActive = (type: string) => {
    return messageType === type ? 'active' : ''
  }

  return (
    <div className="messageDetailsHeaderTab">
      <div className="inputOutBtnBx">
        <button className={isActive('output')} onClick={() => onMessageTypeUpdate('output')}>AI Output</button>
        <button className={isActive('input')} onClick={() => onMessageTypeUpdate('input')}>AI Input</button>
      </div>

      <button className="headerFlipButton" onClick={onFlip}>
        <FontAwesomeIcon icon={faRefresh} size="sm" color="gray" />
      </button>
    </div>
  )
}

export default DetailsHeader
