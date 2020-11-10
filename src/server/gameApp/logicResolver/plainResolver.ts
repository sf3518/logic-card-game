import { BoolTree, variable, UnaryOperator, BinaryOperator, and, implies, top } from "./bools"
import { Resolver, Model } from "./resolver"
import { Card, TruthTableInString } from "../../../types"

export type TruthTable = { [variable: string]: boolean }
export type TruthTableResults = [TruthTable, boolean]

type BitVector = number

export class PlainResolver implements Resolver {
  variables: string[]
  constructor(variables: string[] = ["A", "B", "C", "D"]) {
    this.variables = variables
  }
  generateModel(trees: BoolTree[]): Model | undefined {
    let provens: string[] = this.variables.slice()
    let disprovens: string[] = this.variables.slice()
    let isParadox = true
    generateTruthTables(this.variables).forEach(table => {
      if (resolutionAll(trees, table)) {
        provens = provens.filter(x => table[x])
        disprovens = disprovens.filter(x => !table[x])
        isParadox = false
      }
    })
    if (isParadox) {
      return undefined
    }
    return { 
      positives: new Set(provens), 
      negatives: new Set(disprovens), 
      unknowns: new Set(this.variables.filter(x => !provens.includes(x) && !disprovens.includes(x)))
    }
  }

  canBeProvenBy(trees: BoolTree[], goalTree: BoolTree, expected: boolean | undefined): boolean {
    let cases: boolean[] = []
    generateTruthTables(this.variables).forEach(table => {
      const all = resolutionAll(trees, table)
      const pass = resolution(goalTree, table)
      if (all) {
        cases.push(pass) 
      }
    })
    const isAllTrue = cases.reduce((a, b) => a && b)
    const isAllFalse = !cases.reduce((a, b) => a || b)
    switch(expected) {
      case true: return isAllTrue
      case false: return isAllFalse
      case undefined: return !isAllTrue && !isAllFalse
    }
  }

  isEquivalentTo(trees: BoolTree[], goalTree: BoolTree): boolean {
    const tables = generateTruthTables(this.variables)
    for (let i = 0; i < tables.length; i++) {
      if (resolutionAll(trees, tables[i]) != resolution(goalTree, tables[i])) {
        return false
      }
    }
    return true
  }

  isAlwaysTrue(trees: BoolTree[]): boolean {
    return this.isEquivalentTo(trees, top())
  }

}



function resolutionAll(trees: BoolTree[], table: TruthTable): boolean {
  if (trees.length == 0) {
    return true
  }
  return trees.map(tree => resolution(tree, table)).reduce((a, b) => a && b)
}

function resolution(tree: BoolTree, table: TruthTable): boolean {
  switch(tree.kind) {
    case "constant": 
      return tree.value
    case "variable":
      return table[tree.variable]
    case "unary":
      return UnaryOperator.apply(tree.operator, resolution(tree.child, table))
    case "binary":
      return BinaryOperator.apply(tree.operator, resolution(tree.left, table), resolution(tree.right, table))
  }
}

function bitVectorToTable(bitVector: BitVector, variables: string[]): TruthTable {
  let table: TruthTable = {}
  for(let i = 0; i < variables.length; i++, bitVector >>= 1) {
    let set = 1 & bitVector
    table[variables[i]] = set != 0
  }
  return table
}

function generateTruthTables(variables: string[]): TruthTable[] {
  return Array.from(Array(2 ** variables.length).keys())
    .map(vector => bitVectorToTable(vector, variables))
}

export function allPossibleTruthTablesOf(model: Model): TruthTable[] {
  const tables: TruthTable[] = []
  const unknowns: string[] = []
  model.unknowns.forEach(e => unknowns.push(e))
  Array.from(Array(2 ** unknowns.length).keys()).forEach(vector => {
    const table: TruthTable = {}
    model.positives.forEach(p => table[p] = true)
    model.negatives.forEach(n => table[n] = false)
    for(let i = 0; i < unknowns.length; i++, vector >>= 1) {
      let set = 1 & vector
      table[unknowns[i]] = set != 0
    }
    tables.push(table)
  })
  return tables
}

export function genTruthTableInStringForBTrees(vars: Card[], trees: (BoolTree | undefined)[]): TruthTableInString {
  const body: string[][] = []
  const translateBool = (b: boolean) => b ? "⊤" : "⊥"
  const isValid = !trees.includes(undefined)
  generateTruthTables(vars).forEach(table => {
    const row: string[] = []
    vars.forEach(v => row.push(translateBool(table[v])))
    row.push(isValid ? translateBool(resolutionAll(trees as BoolTree[], table)) : "?")
    body.push(row)
  })
  return { headers: (vars as string[]).concat("val"), body: body }
}