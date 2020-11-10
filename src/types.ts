import { PlayCardToAction, ForceAccountAction, DiscardAction, SwapHandCardAction } from "./game/actions";
import { BoolTree } from "./server/gameApp/logicResolver/bools";
import { TruthTable } from "./server/gameApp/logicResolver/plainResolver";

export type Card = 'A' | 'B' | 'C' | 'D' | '&' | '|' | '->' | '==' | '~' | '(' | ')' 
export type Premise = Card[];

export type CardWithLimit = [Card, number]

export type GoalKind = 'prove' | 'disprove' | 'unknown' | 'equivalent' | 'tautology' | 'paradox'

export type Goal = { kind: 'prove'      , expr: Premise, boolTree: BoolTree } 
                 | { kind: 'disprove'   , expr: Premise, boolTree: BoolTree }
                 | { kind: 'unknown'    , expr: Premise, boolTree: BoolTree }
                 | { kind: 'equivalent' , expr: Premise, boolTree: BoolTree }
                 | { kind: 'tautology'  , expr: undefined, boolTree: undefined }
                 | { kind: 'paradox'    , expr: undefined, boolTree: undefined }

export type GoalInJSON = { kind: 'prove'      , expr: Premise } 
                       | { kind: 'disprove'   , expr: Premise }
                       | { kind: 'unknown'    , expr: Premise }
                       | { kind: 'equivalent' , expr: Premise }
                       | { kind: 'tautology' }
                       | { kind: 'paradox'   }   

export type LevelSetupJsonFormat = {
  title: string
  description: string[]
  premises: Premise[]
  lockedPremises: number[]
  cards: Card[]
  limitedCards: CardWithLimit[]
  goals: GoalInJSON[]
}

export type LevelResponse = {
  title: string
  description: string[]
  view: GameView
  hasPrev: boolean
  hasNext: boolean
}

export type LevelsFilter = { kind: 'likes' } 
                         | { kind: 'user', username: string } 
                         | { kind: 'title', title: string } 
                         | { kind: 'date', isAsc: boolean }

export type TruthTableInString = {
  headers: string[]
  body: string[][]
}


export type Result = { goal: Goal, isSatified: true }[]

export type GameView = {
  playerVar: string
  handCardWithCount: [Card, number][]
  discardPile: Card[]
  premises: [Premise, boolean][]
  deckCount: number
  goals: Goal[]
}

export type GameAction = PlayCardToAction | ForceAccountAction | DiscardAction | SwapHandCardAction

export type LevelView = {
  title: string
  author: string
  lid: string
  uid: string
  likes: number
  dislikes: number
}

export type PostAction = {
  gameID: number,
  playerVar: string,
  actions: GameAction[],
  view: GameView
}

export type LevelPageInfo = {
  title: string
  startID: number
  levelsCount: number
  hasPrev: boolean
  hasNext: boolean
  unavailables: number[]
}

export type UserCredential = {
  username: string
  email: string
  password: string
}

export type UserInfo = {
  uid: number
  username: string
  email: string
  levelFinished: number
}

export type LoginCredential = {
  username: string
  password: string
}

export type UserResponse = {
  ok: boolean
  status: number
  statusText: string
}