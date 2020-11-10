import { and, variable, not, or, implies, BoolTree, iff } from "../logicResolver/bools";
import { PlainResolver } from "../logicResolver/plainResolver"
import { Model } from "../logicResolver/resolver";

function aModel(trees: BoolTree[], extra: string[] = []) {
  return new PlainResolver(findAllVariables(trees, extra)).generateModel(trees)
}

function findAllVariables(trees: BoolTree[], extra: string[]): string[] {
  let set: Set<string> = new Set(extra)
  function dfa(tree: BoolTree) {
    switch(tree.kind) {
      case "variable": 
        set.add(tree.variable)
        break
      case "constant":
        break
      case "unary":
        dfa(tree.child)
        break
      case "binary":
        dfa(tree.left)
        dfa(tree.right)
        break
    }
  }
  trees.forEach(tree => dfa(tree))
  return Array.from(set.values())
}

describe("plain resolver tests: ", () => {
  it("a & b |= a, b", () => {
    expect(aModel([and(variable("a"), variable("b"))])).toEqual({
      positives: new Set(["a", "b"]),
      negatives: new Set(),
      unknowns: new Set(),
    })
  })

  it("a | b; ~a |= b", () => {
    let model = aModel([
        or(variable("a"), variable("b")),
        not(variable("a"))
      ])
    expect(model).toEqual({
      positives: new Set(["b"]),
      negatives: new Set(["a"]),
      unknowns: new Set(),
    })
  })

  it("a -> b; a |= a, b", () => {
    let model = aModel([
        implies(variable("a"), variable("b")),
        variable("a")
      ])
    expect(model).toEqual({
      positives: new Set(["a", "b"]),
      negatives: new Set(),
      unknowns: new Set(),
    })
  })

  it("a -> b; ~b |= ~a, ~b", () => {
    let model = aModel([
        implies(variable("a"), variable("b")),
        not(variable("b"))
      ])
    expect(model).toEqual({
      positives: new Set(),
      negatives: new Set(["a", "b"]),
      unknowns: new Set(),
    })
  })

  it("a -> b; ~a |= ~a", () => {
    let model = aModel([
        implies(variable("a"), variable("b")),
        not(variable("a"))
      ])
    expect(model).toEqual({
      positives: new Set(),
      negatives: new Set("a"),
      unknowns: new Set("b"),
    })
  })

  it("a == b; ~a |= ~b", () => {
    let model = aModel([
      iff(variable("a"), variable("b")),
      not(variable("a"))
    ])
    expect(model).toEqual({
      positives: new Set(),
      negatives: new Set(["a", "b"]),
      unknowns: new Set()
    })
  })

  it("(a | ~a) is tautology", () => {
    let taut = or(variable("a"), not(variable("a")))
    expect(aModel([taut])).toEqual({
      positives: new Set(),
      negatives: new Set(),
      unknowns: new Set(["a"]),
    })
  })

  it("(a & ~a) is paradox", () => {
    let para = and(variable("a"), not(variable("a")))
    expect(new PlainResolver(["a"]).generateModel([para])).toEqual(undefined)
  })
})

describe("modelProves tests", () => {})