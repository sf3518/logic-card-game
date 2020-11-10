import { Model } from "./resolver"

export type Cnf = CnfClause[]
export type CnfClause = CnfLiteral[]
type CnfLiteral = CnfVariable | CnfImmediate | CnfNot

class CnfVariable {
  kind: 'variable' = 'variable'
  variable: string
  constructor(variable: string) {
    this.variable = variable
  }
}

class CnfImmediate {
  kind: "immediate" = "immediate"
  value: boolean
  constructor(value: boolean) {
    this.value = value
  }
}

class CnfNot {
  kind: "not" = "not"
  atom: CnfVariable
  constructor(atom: CnfVariable) {
    this.atom = atom
  }
}

function dpll(cnf: Cnf): Model {
  return { positives: new Set(), negatives: new Set(), unknowns: new Set() }
}
