import React, { useState, useContext } from 'react'
import { Card, Premise } from '../../types'
import { CardComponent } from '../game/Card'
import { EditorContext } from './LevelEditor'
import { EditorClickSlot } from './ClickSlot'
import Tooltip from '@material-ui/core/Tooltip'

interface HandCardAreaProps {
  onPick: (hpos: number) => void
  onClickOnTag: (hpos: number) => void
  onDrop: () => void
}

export const EditorHand = ({
  onPick,
  onClickOnTag,
  onDrop
}: HandCardAreaProps): JSX.Element => {

  const context = useContext(EditorContext)
  const cards = context.handCards

  const isSelected = context.state.kind == 'select'

  const isPicked = (index: number) => 
    context.state.kind == 'select'  
    && context.state.select.kind == 'hand' 
    && context.state.select.hpos == index

  const renderCard = (i: number): JSX.Element => {
    const tag = cards[i][1] ? cards[i][1] : Number.POSITIVE_INFINITY
    return <CardComponent  
      isSelected={isPicked(i)}
      scale={1}
      tag={tag}
      cardSymbol={cards[i][0]} 
      onClick={() => {
          onPick(i)
      }}
      onClickOnTag={() => onClickOnTag(i)}
    />
  }

  const renderHandCardArea = (): JSX.Element[] => {
    let result: JSX.Element[] = []
    if (isSelected) {
      result.push(<EditorClickSlot 
        scale={1}
        isActive={true}
        onDrop={onDrop}
      />)
    }
    for (let i = 0; i < cards.length; i++) {
      result.push(renderCard(i))
      if (isSelected) {
        result.push(<EditorClickSlot 
          scale={1}
          isActive={true}
          onDrop={onDrop}
        />)
      }
    }
    return result
  }

  const tooltip = isSelected ? "" : "Click me to select a hand card"

  return (
    <Tooltip title={tooltip} arrow >
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
    </Tooltip>
  )
}
