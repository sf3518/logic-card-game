import { BoolTree, iff, implies, or, and, not } from "../logicResolver/bools"
import { Card } from "../../../types"

export type Fixivity = 'infixl' | 'infixr'

export type BinaryConstructor = (b1: BoolTree, b2: BoolTree) => BoolTree
export type UnaryConstructor = (b: BoolTree) => BoolTree

export class OperatorTable {

  readonly binOpDic: { [operator: string]: { precedence: number, fixivity: Fixivity, nodeFunc: BinaryConstructor } }
  readonly unaryOps: { [operator: string]: { nodeFunc: UnaryConstructor } }

  constructor(binOps: [string, number, Fixivity, BinaryConstructor][], unaryOps: [string, UnaryConstructor][] ) {
    this.binOpDic = {}
    binOps.forEach(([op, precedence, fix, nodeFunc]) => {
      this.binOpDic[op] = { precedence: precedence, fixivity: fix, nodeFunc: nodeFunc }
    })
    this.unaryOps = {}
    unaryOps.forEach(([op, nodeFunc]) => {
      this.unaryOps[op] = { nodeFunc: nodeFunc }
    })
  }

  static defaultTable(): OperatorTable {
    return new OperatorTable(
      [
        ["==", 4, 'infixl', iff],
        ["->", 3, 'infixr', implies],
        ["|", 2, 'infixl', or],
        ["&", 1, 'infixl', and],
      ],
      [["~", not]]
    )
  }

  isBinaryOperator(operator: Card): boolean {
    return this.binOpDic.hasOwnProperty(operator)
  }

  isUnaryOperator(operator: Card): boolean {
    return this.unaryOps.hasOwnProperty(operator)
  }

  isOperator(card: Card): boolean {
    return this.isUnaryOperator(card) || this.isBinaryOperator(card)
  }
}