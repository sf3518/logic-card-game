import { Card, Premise, GameView, GameAction, Result } from "../../../types";
import { Rule, IRule } from "./gameRule";
import { parsePremise } from "./premise";
import { PlainResolver } from "../logicResolver/plainResolver";
import { BoolTree } from "../logicResolver/bools";
import { parse } from "path";
import { LevelSetup } from "./levelSetup";

type PlayerTable = { [variable: string]: Player }

const defaultPlayerVars: Card[] = ["A", "B", "C", "D"]

export class Player {

  variable: string
  nextPlayerVar: string
  handCards: Card[]
  constructor(variable: string, nextPlayerVar: string, handCards: Card[]) {
    this.variable = variable
    this.nextPlayerVar = nextPlayerVar
    this.handCards = handCards
  }

  clone(): Player {
    return new Player(this.variable, this.nextPlayerVar, this.handCards.slice())
  }

  removeHandCardAt(index: number): Card {
    const card = this.handCards[index]
    this.handCards.splice(index, 1)
    return card
  }

}

export class GameBoard {

  premises: Premise[]
  deck: Card[]
  discardPile: Card[]
  players: PlayerTable
  nextPlayerToPlay: string
  isTerminated: boolean
  readonly rule: IRule

  constructor(premises: Premise[], deck: Card[], discardPile: Card[], players: PlayerTable, rule: IRule) {
    this.premises = premises
    this.deck = deck
    this.discardPile = discardPile
    this.players = players
    this.nextPlayerToPlay = Object.keys(players)[0]
    this.isTerminated = false
    this.rule = rule
  }

  static initGameBoard(playerVars: string[], rule: Rule): GameBoard {
    const premises = [[], [], [], []] 
    const deck = rule.generateInitialDeck()
    const players: { [v: string]: Player } = {}
    for (let i = 0; i < playerVars.length; i++) {
      let curr = playerVars[i]
      let next = playerVars[i == playerVars.length - 1 ? 0 : i + 1]
      const hand: Card[] = []
      for (let j = 0; j < rule.cardCountInHand; j++) {
        hand.push(deck.pop()!!)
      } 
      players[curr] = new Player(curr, next, hand)
    }
    const board = new GameBoard(premises, deck, [], players, rule)
    board.drawCard(playerVars[0], rule.drawCountPerTurn)
    return board
  }

  static initLevel(rule: LevelSetup): GameBoard {
    const players: { [v: string]: Player } = {
      "A": new Player("A", "A", rule.cards.map(([c, l]) => c))
    };
    ["B", "C", "D"].forEach(p => players[p] = new Player(p, "A", []))
    
    return new GameBoard(
      rule.premises.map(([p, _]) => p), 
      [],
      [],
      players, 
      rule
      )
  }

  // Run actions to the game board for player given
  runActionsForPlayer(playerVar: string, actions: GameAction[]): GameBoard | never {
    let board: GameBoard = this
    for (let i = 0; i < actions.length; i++) {
      board = board.runActionForPlayer(playerVar, actions[i])
      board.premises.forEach(p => console.log(p))
    }
    if (!board.isValid()) {
      throw new Error("Invalid board state")
    }
    return board
  }

  private runActionForPlayer(playerVar: string, action: GameAction): GameBoard | never {
    const clone = this.clone()
    switch(action.kind) {
      case 'play-card':
        const [pid, ipid] = action.premiseIndices
        clone.playCardToPremise(playerVar, action.handIndex, pid, ipid)
        break
      case 'discard': 
        clone.discard(playerVar, action.handIndex)
        break
      case 'swap-hand':
        break
    }
    return clone
  }

  // Create a view of a player to the game board.
  viewOf(playerVar: string): GameView {
    return {
      playerVar: playerVar,
      handCardWithCount: this.players[playerVar].handCards.map(card => [card, 1]),
      discardPile: [],
      premises: this.premises.map(p => [p, false]), // false for not locked 
      deckCount: this.deck.length,
      goals: this.rule.aimsOfPlayer(playerVar as Card)
    }
  }

  // Check if the current state of the board is invalid.
  // A board is invalid, if:
  //   * Any premise is not parse-able
  isValid(): boolean {
    try {
      this.premises.forEach(p => parsePremise(p, Object.keys(this.players) as Card[], this.rule.operatorTable))
    } catch(e) {
      console.log(e);
      return false
    }
    return true
  }

  allPlayerVars(): string[] {
    return Object.keys(this.players)
  }

  drawCard(playerVar: string, numberOfCards: number) {
    let player = this.players[playerVar]
    while (this.deck.length > 0 && numberOfCards > 0) {
      let card = this.deck.pop()
      if (card != undefined) {
        player.handCards.push(card)
      }
      numberOfCards--
    }
  }

  // evalModel(playerVar: Card): Result {
  //   const aims = this.rule.aimsOfPlayer(playerVar)
  //   const model = new PlainResolver(this.allPlayerVars())
  //     .generateModel(this.premises.map(p => parsePremise(p, this.allPlayerVars() as Card[], this.rule.operatorTable)))
  //   let result: Result = aims.map(aim => )
  // }

  
  private playCardToPremise(playerVar: string, handCardIndex: number, premiseId: number, premisePosition: number) {
    // if the card is a normal card
    const player = this.players[playerVar]
    const card = player.removeHandCardAt(handCardIndex)
    const premise = this.premises[premiseId]
    premise.splice(premisePosition, 0, card)
  }

  private discard(playerVar: string, handCardIndex: number) {
    const player = this.players[playerVar]
    const card = player.removeHandCardAt(handCardIndex)
    this.discardPile.push(card)
  }

  // Create a clone of the current gameboard.
  // Each clone shares the same rule, as the rule is immutable.
  clone(): GameBoard {
    const playersCopy: PlayerTable = {}
    for (let p in this.players) {
      if (this.players.hasOwnProperty(p)) {
        playersCopy[p] = this.players[p].clone()
      }
    }
    return new GameBoard(
      this.premises.map(p => p.slice()), 
      this.deck.slice(), 
      this.discardPile.slice(), 
      playersCopy, 
      this.rule
    )
  }

}

// export function startGame(playerVars: string[], rule: Rule) {
//   let gameBoard = GameBoard.initGameBoard(playerVars, rule)
//   while (!gameBoard.isTerminated) {
//     gameBoard = gameBoard.runNextTurn()
//   }
//   const model = new PlainResolver(playerVars)
//     .generateModel(gameBoard.premises.map(p => parsePremise(p, playerVars as Card[], rule.operatorTable)))
//   console.log(model);
// }