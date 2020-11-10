import { GameBoard } from './game/gameBoard'
import { Rule } from './game/gameRule'
import { GameView } from '../../types'

export class GameApp {

  private gameTable: Map<number, GameBoard> = new Map()
  private seed = 0

  registerAGame(playerCount: number) {
    while (this.gameTable.has(this.seed)) {
      this.seed++
      if (this.seed == Number.MAX_VALUE) {
        this.seed = 0
      }
    }
    this.registerAGameByID(this.seed, playerCount)
  }

  registerAGameByID(gameID: number, playerCount: number) {
    console.log("starting a game of " + playerCount + ". ID: " + gameID)
    if (this.gameTable.has(gameID)) {
      throw new Error("A game with id: " + gameID + " was already registered!")
    }
    const playerVars: string[] = []
    for (let i = 0; i < playerCount; i++) {
      playerVars.push(String.fromCharCode("A".charCodeAt(0) + i))
    }
    this.gameTable = this.gameTable.set(gameID, GameBoard.initGameBoard(playerVars, Rule.aDefaultRule()))
  }

  deregisterAGame(gameID: number) {
    this.gameTable.delete(gameID)
  }

  getGameBoard(gameID: number): GameBoard | undefined {
    console.log(gameID);
    return this.gameTable.get(gameID)
  }

  getGameView(gameID: number, playerVar: string): GameView | undefined {
    return this.getGameBoard(gameID)?.viewOf(playerVar)
  }

  updateGameBoard(gameID: number, cb: (board: GameBoard) => GameBoard | never): GameBoard | undefined {
    const board = this.getGameBoard(gameID)
    if (board) {
      try {
        const newBoard = cb(board)
        this.gameTable.set(gameID, newBoard)
        return newBoard
      } catch (e) {
        return undefined
      }
    }
    return undefined 
  }

}