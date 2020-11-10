import { GameView, GameAction, Card, Premise, Goal } from '../types'
import { BoolTree } from '../server/gameApp/logicResolver/bools'
import { allPossibleTruthTablesOf, PlainResolver } from '../server/gameApp/logicResolver/plainResolver'
import { parsePremise } from '../server/gameApp/game/premise'
import { Model } from '../server/gameApp/logicResolver/resolver'
import { OperatorTable } from '../server/gameApp/game/operatorTable'

export function doActionToView(
  view: GameView,
  action: GameAction
): GameView {
  switch(action.kind) {
    case 'play-card':
      const [pid, ipid] = action.premiseIndices
      return playHandCardTo(view, action.handIndex, pid, ipid) 
    case 'discard':
      return discardToPile(view, action.handIndex)
    case 'ergo':
      return view
    case 'swap-hand':
      return swapHandCards(view, action.handIndex1, action.handIndex2)
  }
}

export function playHandCardTo(
  view: GameView, 
  handCardIndex: number, 
  premiseIndex: number, 
  inPremisePosition: number
): GameView {
  const [card, count] = view.handCardWithCount[handCardIndex]
  const nextHandCards = view.handCardWithCount.slice()
  const [premise, isLocked] = view.premises[premiseIndex]
  const nextPremise: [Premise, boolean] = [premise.slice(), isLocked]
  const nextPremises = view.premises.slice()
  if (count == 1) {
    nextHandCards.splice(handCardIndex, 1)
  } else {
    nextHandCards[handCardIndex] = [card, count - 1]
  }
  nextPremise[0].splice(inPremisePosition, 0, card)
  nextPremises.splice(premiseIndex, 1, nextPremise)

  console.log(view.premises[premiseIndex].slice())
  console.log(nextPremise)
  return {
    playerVar: view.playerVar,
    handCardWithCount: nextHandCards,
    discardPile: [...view.discardPile],
    premises: nextPremises,
    deckCount: view.deckCount,
    goals: view.goals
  }
}

export function discardToPile(
  view: GameView,
  handCardIndex: number
): GameView {
  const [card, count] = view.handCardWithCount[handCardIndex]
  const nextHandCards: [Card, number][] = [...view.handCardWithCount]
  const nextDiscardPile = view.discardPile.slice()
  if (count == 1) {
    nextHandCards.splice(handCardIndex, 1)
    nextDiscardPile.push(card)
  } else {
    nextHandCards[handCardIndex] = [card, count - 1]
  }

  return {
    playerVar: view.playerVar,
    handCardWithCount: nextHandCards,
    discardPile: nextDiscardPile,
    premises: view.premises.map(([premise, isLocked]) => [premise.slice(), isLocked]),
    deckCount: view.deckCount,
    goals: view.goals
  }
  
}

export function swapHandCards(
  view: GameView,
  index1: number,
  index2: number
): GameView {
  let newHand = view.handCardWithCount.slice();
  [newHand[index1], newHand[index2]] = [newHand[index2], newHand[index1]]
  return {
    playerVar: view.playerVar,
    handCardWithCount: newHand,
    discardPile: [...view.discardPile],
    premises: view.premises,
    deckCount: view.deckCount,
    goals: view.goals
  }
}

export function getGoalStates(view: GameView): boolean[] {
  return evalSuccess(view.premises.map(([p, _]) => p), view.goals)
}
 
export function evalSuccess(premises: Premise[], goals: (Goal|undefined)[]): boolean[] {
  let btrees: BoolTree[] = []
  try {
    premises.forEach(premise => {
      const btree = parsePremise(premise, ["A", "B", "C", "D"], OperatorTable.defaultTable())
      btrees.push(btree)
    })
  } catch(e) {
    return goals.map(_ => false)
  }
  
  const resolver = new PlainResolver(["A", "B", "C", "D"])
  const model = resolver.generateModel(btrees)
  if (model == undefined) {
    return goals.map(g => g?.kind == 'paradox' ?? false)
  }
  return goals.map(goal => {
    console.log(goal);
    if (goal) {
      switch(goal.kind) {
        case 'prove': return resolver.canBeProvenBy(btrees, goal.boolTree, true)
        case 'disprove': return resolver.canBeProvenBy(btrees, goal.boolTree, false)
        case 'unknown': return resolver.canBeProvenBy(btrees, goal.boolTree, undefined)
        case 'equivalent': return resolver.isEquivalentTo(btrees, goal.boolTree)
        case 'tautology': return resolver.isAlwaysTrue(btrees)
        case 'paradox': return false
      }
    }
    return false
  })
}


export function fixInfinityNumber(view: GameView): GameView {
  view.handCardWithCount = view.handCardWithCount.map(([card, num]) => {
    return [card, num ? num : Number.POSITIVE_INFINITY]
  })
  return view
}