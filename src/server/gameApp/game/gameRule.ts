import { Card, Goal } from "../../../types";
import { BoolTree, not, iff, implies, or, and, variable } from "../logicResolver/bools";
import { OperatorTable } from './operatorTable'

type CardCountTable = { card: Card, count: number }[]

export interface IRule {
  operatorTable: OperatorTable
  aimsOfPlayer(playerVar: Card): Goal[]
}

export class Rule implements IRule {

  cardCountTable: CardCountTable
  operatorTable: OperatorTable
  winningPoints: number
  drawCountPerTurn: number
  cardCountInHand: number
  isShuffledDeck: boolean

  private constructor(
    cardCountTable: CardCountTable, 
    operatorTable: OperatorTable, 
    winningPoints: number,
    drawCountPerTurn: number,
    cardCountInHand: number,
    isShuffledDeck: boolean
  ) {
      this.cardCountTable = cardCountTable
      this.operatorTable = operatorTable
      this.winningPoints = winningPoints
      this.drawCountPerTurn = drawCountPerTurn
      this.cardCountInHand = cardCountInHand
      this.isShuffledDeck = isShuffledDeck
  }

  aimsOfPlayer(playerVar: Card): Goal[] {
    return [{ kind: 'prove', expr: [playerVar], boolTree: variable(playerVar) }]
  }


  generateInitialDeck(): Card[] {
    
    let deck: Card[] = []
    this.cardCountTable.forEach(entry => {
      for (let i = 0; i < entry.count; i++) {
        deck.push(entry.card)
      }
    })

    if (this.isShuffledDeck) {
      for (let i = 0; i < deck.length - 1; i++) {
        let j = (i + 1) + Math.floor(Math.random() * (deck.length - i - 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]
      }
    }

    return deck
  }

  // Factory methods

  static aDefaultRule(): Rule {
    const defaultCardCounts: CardCountTable = [
      {card: 'A', count: 4},
      {card: 'B', count: 4},
      {card: 'C', count: 4},
      {card: 'D', count: 4},
      {card: '(', count: 8},
      {card: '&', count: 4},
      {card: '|', count: 4},
      {card: '->', count: 4},
      {card: '~', count: 6},
    ]
    return new Rule(
      defaultCardCounts,
      OperatorTable.defaultTable(),
      50,
      2,
      5,
      true
    )
  }

  withWinningPoints(winning: number) {
    return new Rule(
      this.cardCountTable, 
      this.operatorTable, 
      winning, 
      this.drawCountPerTurn, 
      this.cardCountInHand, 
      this.isShuffledDeck
    )
  }

}

