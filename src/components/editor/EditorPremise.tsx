import React, { useState, useContext } from 'react'
import { Card, Premise } from '../../types'
import { CardComponent } from '../game/Card'
import { useDrop } from 'react-dnd'
import { PremiseClickSlot } from '../game/PremiseClickSlot'

import LockIcon from '@material-ui/icons/Lock'
import LockOpenIcon from '@material-ui/icons/LockOpen'
import { EditorContext } from './LevelEditor'
import { EditorClickSlot } from './ClickSlot'
import { getExprFromJson } from '../../server/gameApp/game/goal'
import { Tooltip, IconButton } from '@material-ui/core'

type PremiseCategory = { kind: 'premise', index: number }
                     | { kind: 'goal', index: number }

interface PremiseProps {
  category: PremiseCategory
  scale: number
  onLock: (() => void) | undefined
  onSelect: (pos: number) => void
  onDrop: (pos: number) => void
}

export const EditorPremise = ({
  category,
  scale,
  onLock,
  onSelect,
  onDrop,
}: PremiseProps) => {

  const context = useContext(EditorContext)
  const kind = category.kind
  const index = category.index
  const isLocked = kind == 'premise' && context.lockedPremises.includes(index)
  const cards = kind == 'premise' ? context.premises[index] : getExprFromJson(context.goals[index])
  const isSelected = context.state.kind == 'select'

  const isPicked = (i: number) => 
    context.state.kind == 'select' && 
    ((context.state.select.kind == 'premise'
      && kind == 'premise'
      && context.state.select.pid == index
      && context.state.select.ppos == i)
    || (context.state.select.kind == 'goal'
      && kind == 'goal'
      && context.state.select.gid == index
      && context.state.select.gpos == i)
    )


  const renderCard = (i: number): JSX.Element => {
    return <CardComponent 
      cardSymbol={cards[i]} 
      scale={scale} 
      tag={undefined} 
      onClick={() => isPicked(i) ? context.setIdle() : onSelect(i) } 
      isSelected={isPicked(i)} 
    />
  }

  const renderDropSlot = (i: number, active: boolean = true): JSX.Element => {
    return (
        <EditorClickSlot 
          scale={scale}
          isActive={active}
          onDrop={() => onDrop(i)}
        />
    )
  }

  const renderLock = () => {
    return onLock ? <div style={{
      position: 'absolute',
      left: 40,
      marginTop: '40px',
    }}>
      <Tooltip title={"Click me to " + (isLocked ? "unlock" : "lock") + " this premise"} arrow placement="right">
        <IconButton onClick={onLock}>
          { isLocked ? <LockIcon fontSize="large"/> : <LockOpenIcon fontSize="large"/>}
        </IconButton>
      </Tooltip>
    </div> : undefined
  }

  const renderPremise = (): JSX.Element[] => {
    let result: JSX.Element[] = []
    if (cards.length == 0 && !isSelected) {
      result.push(renderDropSlot(0, false))
    }
    let offset = 0
    for (let i = 0; i < cards.length; i++) {
      if (isSelected) {
        result.push(renderDropSlot(i - offset))
      }
      result.push(renderCard(i))
      if (isPicked(i)) {
        offset = 1
      }
    }
    if (isSelected) {
      result.push(renderDropSlot(cards.length - offset))
    }
    return result
  }

  return (
    <Tooltip title={isSelected || cards.length == 0 ? "" : "Click a card to select it"} arrow>
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
          backgroundColor: isLocked ? '#CCC' : 'white'
        }
      }> 
          {renderPremise()}
        {renderLock()}
      </div>
    </Tooltip>

  )
}

