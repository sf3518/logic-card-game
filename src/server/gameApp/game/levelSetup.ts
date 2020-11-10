import { IRule } from "./gameRule";
import { OperatorTable } from './operatorTable'
import { Premise, Card, LevelSetupJsonFormat, CardWithLimit, Goal, GameView, LevelResponse } from "../../../types";
import { fromGoalJson } from "./goal";


export class LevelSetup implements IRule {
  title: string
  description: string[]
  operatorTable: OperatorTable = OperatorTable.defaultTable()
  premises: [Premise, boolean][]
  cards: CardWithLimit[]
  goals: Goal[]
  hasPrev: boolean
  hasNext: boolean

  constructor(levelID: number|undefined, fromJSON: LevelSetupJsonFormat, hasPrev: boolean, hasNext: boolean) {
    this.title = fromJSON.title ? ((levelID === undefined ? "" : levelID + ": ") + fromJSON.title) : ""
    this.description = fromJSON.description ?? []
    this.premises = []
    for (let i = 0; i < fromJSON.premises.length; i++) {
      this.premises.push([fromJSON.premises[i], fromJSON.lockedPremises?.includes(i) ?? false])
    }
    this.cards = []
    fromJSON.cards?.forEach(card => {
      this.cards.push([card, Number.POSITIVE_INFINITY])
    })
    fromJSON.limitedCards?.forEach(it => this.cards.push(it))
    this.goals = fromJSON.goals.map(json => fromGoalJson(json))

    this.hasPrev = hasPrev
    this.hasNext = hasNext
  }

  static arena(fromJSON: LevelSetupJsonFormat) {
    return new LevelSetup(undefined, fromJSON, false, false) 
  }

  aimsOfPlayer(playerVar: Card): Goal[] {
    return this.goals
  }

  evictSetupResponse(): LevelResponse {
    const view: GameView = {
      playerVar: "A", 
      handCardWithCount: this.cards.slice(), 
      discardPile: [], 
      premises: this.premises.slice(),
      deckCount: 0,
      goals: this.goals.slice()
    }
    return {
      title: this.title,
      description: this.description,
      view: view,
      hasPrev: this.hasPrev,
      hasNext: this.hasNext,
    }
  }
  
  
}