import React from 'react'
import { GameView } from '../../types'
import { Card } from '../../types'

interface GameBoardContext {
  playerVar: string
  handSelected: number
  handCardSelected: Card | undefined
  unselectHand: () => void
  pickHandCardCallback: (handIndex: number) => void
  moveHandCardToPremise: (premiseId: number, inPremiseIndex: number) => void
  discardPickedHandCard: () => void
}

const Context: React.Context<GameBoardContext> = React.createContext({
  playerVar: "A",
  handSelected: -1,
  handCardSelected: undefined,
  unselectHand: () => {},
  pickHandCardCallback: (_) => {},
  moveHandCardToPremise: (_2, _3) => {},
  discardPickedHandCard: () => {}
} as GameBoardContext)

export default Context
