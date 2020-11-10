import React, { useState, useContext } from 'react'
import { Card, Premise } from '../../types'
import { CardComponent } from './Card'
import { useDrop } from 'react-dnd'
import { ItemTypes } from './ItemTypes'
import { PremiseClickSlot } from './PremiseClickSlot'
import Context from './gameContext'

import LockIcon from '@material-ui/icons/Lock'

interface PremiseProps {
  premiseIndex: number
  isLocked: boolean
  isProofPremise: boolean
  scale: number
  cards: Premise
}


export const PremiseComponent = ({
  premiseIndex,
  isLocked,
  isProofPremise,
  scale,
  cards,
}: PremiseProps) => {

  const context = useContext(Context)

  const renderCard = (i: number): JSX.Element => {
    return (<CardComponent cardSymbol={cards[i]} scale={scale} tag={undefined} onClick={() => {}} isSelected={false} />)
  }

  const renderDropSlot = (i: number, slotLocked: boolean = false): JSX.Element => {
    return (
        <PremiseClickSlot 
          premiseIndex={premiseIndex}
          isLocked={isLocked || slotLocked}
          slotPosition={i}
        />
    )
  }

  const renderLock = () => {
    return <div style={{
      position: 'absolute',
      left: 40,
      marginTop: '40px',
    }}>
      <LockIcon/>
      Locked
    </div>
  }

  const renderPremise = (): JSX.Element[] => {
    let result: JSX.Element[] = []
    if (cards.length == 0) {
      result.push(renderDropSlot(0, true))
    }
    for (let i = 0; i < cards.length; i++) {
      if (context.handCardSelected && !isLocked) {
        result.push(renderDropSlot(i))
      }
      result.push(renderCard(i))
    }
    if (context.handCardSelected && !isLocked) {
      result.push(renderDropSlot(cards.length))
    }
    return result
  }

  return (
    <div 
      className="board-row" style={
      {
        display: 'flex',
        flexWrap: 'wrap', 
        float: "none",
        justifyContent: "center",
        verticalAlign: "center",
        marginTop: "5px",
        marginBottom: "5px",
        marginLeft: "auto",
        marginRight: "auto",
        backgroundColor: isProofPremise && isLocked ? '#CCC' : 'white'
      }
    }> 
      {renderPremise()}
      {isProofPremise && isLocked ? renderLock() : undefined}
    </div>
  )
}

