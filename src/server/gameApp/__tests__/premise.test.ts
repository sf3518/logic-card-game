import { parsePremise } from "../game/premise"
import { Premise, Card } from "../../../types"
import { BoolTree, and, variable, not, implies, or, top } from "../logicResolver/bools"
import { OperatorTable } from "../game/operatorTable"

function parsePremiseByDefaultConfig(premise: Premise): BoolTree | never {
  return parsePremise(premise, ["A", "B", "C", "D"], OperatorTable.defaultTable())
}

function fail(failPattern: string) {
  it("Fail: " + failPattern, () => {
    const premise: Premise = failPattern.split(/[ ,]+/) as Premise
    expect(() => parsePremiseByDefaultConfig(premise)).toThrowError()
  })
}


describe("Premise parsing test - success", () => {

  it("empty should be top", () => {
    const premise: Premise = []
    expect(parsePremiseByDefaultConfig(premise)).toEqual(
      top()
    )
  })

  it("parse: A", () => {
    const premise: Premise = ['A']
    expect(parsePremiseByDefaultConfig(premise)).toEqual(
      variable("A")
    )
  })
  
  it("parse: ~A", () => {
    const premise: Premise = ["~", "A"]
    expect(parsePremiseByDefaultConfig(premise)).toEqual(
      not(variable("A"))
    )
  })

  it("parse: A & B", () => {
    const premise: Premise = ["A", "&", "B"]
    expect(parsePremiseByDefaultConfig(premise)).toEqual(
      and(variable("A"), variable("B"))
    )
  })

  it("parse: A | B -> C", () => {
    const premise: Premise = ["A", "|", "B", "->", "C"]
    expect(parsePremiseByDefaultConfig(premise)).toEqual(
      implies(or(variable("A"), variable("B")), variable("C"))
    )
  })

  it("parse A & (B -> C)", () => {
    const premise: Premise = ["A", "&", "(", "B", "->", "C", ")"]
    expect(parsePremiseByDefaultConfig(premise)).toEqual(
      and(variable("A"), implies(variable("B"), variable("C")))
    )
  })

  it("parse A & B & C & D left-assoc", () => {
    const premise: Premise = ["A", "&", "B", "&", "C", "&", "D"]
    expect(parsePremiseByDefaultConfig(premise)).toEqual(
      and(and(and(variable("A"), variable("B")), variable("C")), variable("D"))
    )
  })

  it("parse A -> B -> C -> D right-assoc", () => {
    const premise: Premise = ["A", "->", "B", "->", "C", "->", "D"]
    expect(parsePremiseByDefaultConfig(premise)).toEqual(
      implies(variable("A"), 
        implies(variable("B"), 
          implies(variable("C"), variable("D"))
        )
      )
    )
  })

})

describe("Premise parsing test - failure", () => {

  it("unmatched parens: (", () => {
    const premise: Premise = ["("]
    expect(() => parsePremiseByDefaultConfig(premise)).toThrowError("unmatched parentheses")
  })

  it("unmatched parens: )))", () => {
    const premise: Premise = [")", ")", ")"]
    expect(() => parsePremiseByDefaultConfig(premise)).toThrowError("unmatched parentheses")
  })

  it("unmatched parens: )(", () => {
    const premise: Premise = [")", "("]
    expect(() => parsePremiseByDefaultConfig(premise)).toThrowError("unmatched parentheses")
  })

  fail("A B")
  fail("A & & B")
  fail("& A")
  fail("A &")
  fail("A & ( -> B )")
  fail("( A -> ) & A")

})