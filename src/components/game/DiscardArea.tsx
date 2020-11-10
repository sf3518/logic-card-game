import React, { useContext } from 'react'
import './DiscardArea.css'
import { useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import Context from './gameContext';

interface DiscardAreaProps {
  actionOnDrop: () => void
}

export const DiscardArea = ({
  actionOnDrop
}: DiscardAreaProps): JSX.Element => {

  const context = useContext(Context)
  
  return (
    <div className="DiscardArea" onClick={context.discardPickedHandCard} style={{
      backgroundColor: context.handCardSelected ?  "green" : "#333"
    }}>
      {context.handCardSelected ? "Click me to discard" : ""}
    </div>
  )
}