import { Goal, GoalInJSON, Card } from "../../../types";
import { parsePremise, parsePremiseSafe } from "./premise";
import { BoolTree } from "../logicResolver/bools";

export function showGoal(goal: Goal): string {
  const showKind = goal.kind == 'prove' ? "To prove" 
                 : goal.kind == 'disprove' ? "To disprove" 
                 : "Make undecidable"
  const showGoal = goal.expr?.join("")
  return showKind + ": [" + showGoal + "]"
}

export function fromGoalJson(json: GoalInJSON): Goal {
  switch(json.kind) {
    case 'tautology':
    case 'paradox':
      return { kind: json.kind, expr: undefined, boolTree: undefined}
  }
  return {
    kind: json.kind,
    expr: json.expr, 
    boolTree: parsePremise(json.expr, ["A", "B", "C", "D"])
  }
}

export function getExprFromJson(json: GoalInJSON): Card[] {
  switch (json.kind) {
    case 'tautology':
    case 'paradox':
      return []
    default:
      return json.expr
  }
}

export function parseGoalTreeSafe(json: GoalInJSON): BoolTree | undefined {
  switch (json.kind) {
    case 'tautology':
    case 'paradox':
      return undefined
    default:
      return parsePremiseSafe(json.expr)
  }
}