import { Premise, Card, GoalInJSON } from "../../types";
import { State } from "./state";

// Premise-related operations

export const deleteCardAt = (index: number) => (premise: Premise) : State<Card, Premise> => {
  const copy = premise.slice()
  const [card] = copy.splice(index, 1)
  return State.of(card, copy)
}

export const getCardAt = (index: number) => (premise: Premise) : State<Card, Premise> => {
  const card = premise[index]
  return State.of(card, premise)
}

export const insertCardTo = (card: Card, index: number) => (premise: Premise): State<void, Premise> => {
  const copy = premise.slice()
  copy.splice(index, 0, card)
  return State.put(copy)
}

export const swapCardsAt = (index1: number, index2: number) => (premise: Premise): State<void, Premise> => {
  const copy = premise.slice();
  [copy[index1], copy[index2]] = [copy[index2], copy[index1]]
  return State.put(copy)
}

export const onIndex = <A, S>(index: number, f: (s: S) => State<A, S>) => (premises: S[]): State<A, S[]> => {
  const ap = f(premises[index])
  return State.of(ap.get, premises.map((p, i) => i == index ? ap.state : p))
}

export const onGoalJson = <A>(f: (p: Card[]) => State<A, Card[]>) => (goal: GoalInJSON): State<A, GoalInJSON> => {
  switch (goal.kind) {
    case 'paradox':
    case 'tautology': 
      throw new Error("paradox or tautology")
    default:
      const fp = f(goal.expr)
      return State.of(fp.get, { kind: goal.kind, expr: fp.state })
  }
}

// Handcard related operations

export const addHandCard = (card: Card, count: number = Number.POSITIVE_INFINITY) => (hand: [Card, number][])
    : State<void, [Card, number][]> => {
  const newHand: [Card, number][] = []
  let added = false
  hand.forEach(([c0, count0], i) => {
    if (!added && c0 == card) {
      count0 += count
      added = true
    }
    newHand.push([c0, count0])
  })
  if (!added) {
    newHand.push([card, count])
  }
  return State.put(newHand)
}

export const changeCountHandCard = (index: number, count: number = Number.POSITIVE_INFINITY) => (hand: [Card, number][])
    : State<void, [Card, number][]> => {
  if (count == 0) {
    return deleteHandCard(index)(hand).then(s => State.put(s))
  }
  const copy = hand.slice()
  copy[index][1] = count
  return State.put(copy)
}

export const getAHandCard = (index: number) => (hand: [Card, number][]): State<Card, [Card, number][]> => {
  const copy = hand.slice()
  copy[index][1]--
  if (copy[index][1] == 0) {
    return deleteHandCard(index)(hand).getBy(([c, _]) => c)
  }
  return State.of(copy[index][0], copy)
}

export const deleteHandCard = (index: number) => (hand: [Card, number][])
    : State<[Card, number], [Card, number][]> => {
  const copy = hand.slice()
  const [card] = copy.splice(index, 1)
  return State.of(card, copy)
}


// misc utils

export const moveFromTo = <C, S, D, _>(source: S, getFromS: (s: S) => State<C, S>, dest: D, putToD: (c: C) => (d: D) => State<_, D>)
  : [S, D] => {
    const {get, state} = getFromS(source)
    const d = putToD(get)(dest).state
    return [state, d]
}

export const moveWithin = <C, S, _>(source: S, getFrom: (s: S) => State<C, S>, putTo: (c: C) => (d: S) => State<_, S>): S => {
  const {get, state} = getFrom(source)
  return putTo(get)(state).state
}

export const allCards: Card[] = ['A' , 'B' , 'C' , 'D' , '&' , '|' , '->' , '==' , '~' , '(' , ')' ]