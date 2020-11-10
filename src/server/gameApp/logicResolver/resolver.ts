import { BoolTree } from "./bools";
import { TruthTable, allPossibleTruthTablesOf } from "./plainResolver";

export type Model = { positives: Set<string>, negatives: Set<string>, unknowns: Set<string> }

export interface Resolver {
  generateModel(tree: BoolTree[]): Model | undefined
  canBeProvenBy(trees: BoolTree[], goalTree: BoolTree, expected: boolean): boolean
  isEquivalentTo(trees: BoolTree[], goalTree: BoolTree): boolean
  isAlwaysTrue(trees: BoolTree[]): boolean
}

