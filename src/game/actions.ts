export interface PlayCardToAction {
  kind: 'play-card',
  player: string,
  handIndex: number,
  premiseIndices: [number, number]
}

export interface SwapHandCardAction {
  kind: 'swap-hand',
  player: string,
  handIndex1: number,
  handIndex2: number
}

export interface ForceAccountAction {
  kind: 'ergo',
  player: string,
}

export interface DiscardAction {
  kind: 'discard'
  player: string,
  handIndex: number
}

export function playCardsToAction(  
  player: string,
  handIndex: number,
  premiseIndices: [number, number]
): PlayCardToAction {
  return {
    kind: 'play-card',
    player: player,
    handIndex: handIndex,
    premiseIndices: premiseIndices
  }
}

export function discardAction(
  player: string,
  handIndex: number
): DiscardAction {
  return {
    kind: 'discard',
    player: player,
    handIndex: handIndex
  }
}