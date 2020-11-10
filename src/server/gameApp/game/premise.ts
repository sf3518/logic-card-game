import { Card, Premise, TruthTableInString } from "../../../types"
import { BoolTree, variable, top } from "../logicResolver/bools"
import { OperatorTable, Fixivity, BinaryConstructor } from "./operatorTable"
import { PlainResolver } from "../logicResolver/plainResolver"

// export function genTruthTableInString(vars: Card[], premises: Premise[]): TruthTableInString {
//   const trees = premises.map(p => parsePremiseSafe(p, vars))
//   if (trees.includes(undefined)) {
//     const table: TruthTableInString = {}
//     vars.forEach(v => table[v] = "-")
//     return table
//   } 
//   return genTruthTableInStringForBTree(vars, trees as BoolTree[])
// }

export function parsePremiseSafe(
  premise: Premise,
  variables: Card[] = ["A", "B", "C", "D"], 
  operatorTable: OperatorTable = OperatorTable.defaultTable()
): BoolTree | undefined {
  try {
    return parsePremise(premise, variables, operatorTable)
  } catch(e) {
    return undefined
  }
}

export function parsePremise(
  premise: Premise,
  variables: Card[], 
  operatorTable: OperatorTable = OperatorTable.defaultTable()
): BoolTree | never {
  if (premise.length == 0) {
    return top()
  }
  const isParenCard = (c: Card) => c == ")" || c == "("
  premise.forEach(card => {
    if (!variables.includes(card) 
    && !operatorTable.isOperator(card) 
    && !isParenCard(card)) {
      throw Error("Unexpected card: " + card)
    }
  })
  return parsePremiseSection(premise, operatorTable, 0, premise.length - 1)
}

// Parse the premise with in a given section suggested by @start and 
// @end (both inclusive), with the provided OperatorTable.
// Returns the BoolTree if the Parsing is successful.
function parsePremiseSection(
  premise: Premise, 
  operatorTable: OperatorTable, 
  start: number, 
  end: number
): BoolTree | never {

  if (start > end) {
    throw new Error("premise parse error")
  }

  type PcInfo = { 
    card: Card, 
    index: number, 
    precedence: number, 
    fixivity: Fixivity, 
    constructor: BinaryConstructor 
  }

  let pc: PcInfo | undefined = undefined
  let parenStack = 0
  
  // scan through the given section to determine pc
  for (let i = start; i <= end; i++) {
    let card = premise[i]
    switch(card) {
      case "(":
        parenStack += 1
        break
      case ")":
        parenStack -= 1
        // check if parens are unmatched
        if (parenStack < 0) {
          throw new Error("unmatched parentheses")
        }
        break
      default:
        if (parenStack == 0 && operatorTable.isBinaryOperator(card)) {
          let { precedence: p, fixivity: fix, nodeFunc: nodeFunc } = operatorTable.binOpDic[card] 
          if (pc == undefined
          || pc.precedence < p 
          || pc.precedence == p && pc.fixivity == 'infixl') {
            // update pc 
            pc = {
              card: card,
              index: i,
              precedence: p,
              fixivity: fix,
              constructor: nodeFunc
            }
          }
        }
        break
    }
  }

  if (parenStack != 0) {
    throw new Error("unmatched parentheses")
  }

  // If principle connector exists 
  // parse lhs and rhs of the pc within this section
  // return constructor(lhs, rhs)
  if (pc != undefined) {
    const left = parsePremiseSection(premise, operatorTable, start, pc.index - 1)
    const right = parsePremiseSection(premise, operatorTable, pc.index + 1, end)
    return pc.constructor(left, right)
  }
  
  // If the section given is covered by a pair of parentheses
  // Parse the section within that pair of parentheses
  if (premise[start] == "(" && premise[end] == ")") {
    return parsePremiseSection(premise, operatorTable, start + 1, end - 1)
  } 

  // If the first card in this section is a unary operator card
  const head = premise[start]
  if (operatorTable.isUnaryOperator(head)) {
    const child = parsePremiseSection(premise, operatorTable, start + 1, end)
    return operatorTable.unaryOps[head].nodeFunc(child)
  }

  // If the section only contain 1 card, and that card is a variable
  if (start == end) {
    return variable(head)
  }

  // Otherwise, there is an error
  throw new Error("parse error")

}