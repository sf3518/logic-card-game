import React, { useState, useContext } from 'react'
import { Card, Premise } from '../../types'
import { CardComponent } from './Card'
import { useDrop } from 'react-dnd'
import { ItemTypes } from './ItemTypes'
import Context from './gameContext'

interface HandCardAreaProps {
  playerVar: string,
  cards: [Card, number][],
}

export const HandCardAreaComponent = ({
  playerVar,
  cards,
}: HandCardAreaProps): JSX.Element => {

  const context = useContext(Context)

  const isPicked = (index: number) => context.handSelected == index

  const renderCard = (i: number): JSX.Element => {
    const tag = cards[i][1] ? cards[i][1] : Number.POSITIVE_INFINITY
    return <CardComponent  
      isSelected={isPicked(i)}
      scale={1}
      tag={tag}
      cardSymbol={cards[i][0]} 
      onClick={() => {
        if (context.handSelected == i) {
          context.unselectHand()
        } else {
          context.pickHandCardCallback(i)
        }
      }}
    />
  }

  const renderHandCardArea = (): JSX.Element[] => {
    let result: JSX.Element[] = []
    for (let i = 0; i < cards.length; i++) {
      result.push(renderCard(i))
    }
    return result
  }

  return (
    <div 
      className="board-row" 
      style={{
        width: '100%',
        height: '133px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: "center",
        float: "none",
      }}> 
      {renderHandCardArea()}
    </div>
  )
}
