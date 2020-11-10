export type BoolTree = BoolConstant | BoolVariable | BoolUnary | BoolBinary

export class UnaryOperator { 
  static unaryOpFuncTable: { [id: string]: (b: boolean) => boolean} = {
    '~': b => !b
  }

  static apply(op: UnaryOperator, b : boolean): boolean {
    return UnaryOperator.unaryOpFuncTable[op.sign](b)
  }

  sign: string 

  constructor(sign: string) {
    this.sign = sign
  }
}

export class BinaryOperator { 
  static binaryOpFuncTable: { [id: string]: (b1: boolean, b2: boolean) => boolean} = {
    '&': (b1, b2) => b1 && b2,
    '|': (b1, b2) => b1 || b2,
    '->': (b1, b2) => !b1 || b2,
    '==': (b1, b2) => b1 == b2,
  }

  static apply(op: BinaryOperator, b1: boolean, b2: boolean): boolean {
    return BinaryOperator.binaryOpFuncTable[op.sign](b1, b2)
  }

  sign: string 

  constructor(sign: string) {
    this.sign = sign
  }
}


class BoolConstant {
  kind: "constant" = "constant"
  value: boolean
  constructor(value: boolean) {
    this.value = value
  }
}

class BoolVariable {
  kind: "variable" = "variable"
  variable: string
  constructor(variable: string) {
    this.variable = variable
  }
}

class BoolUnary {
  kind: "unary" = "unary"
  operator: UnaryOperator
  child: BoolTree
  constructor(sign: string, child: BoolTree) {
    this.operator = new UnaryOperator(sign)
    this.child = child
  }
}

class BoolBinary {
  kind: "binary" = "binary"
  operator: BinaryOperator
  left: BoolTree
  right: BoolTree
  constructor(left: BoolTree, sign: string, right: BoolTree) {
    this.operator = new BinaryOperator(sign)
    this.left = left
    this.right = right
  }
}

// Factory functions

export function variable(name: string): BoolVariable {
  return new BoolVariable(name)
}

export function top(): BoolConstant {
  return new BoolConstant(true)
}

export function bottom(): BoolConstant {
  return new BoolConstant(false)
}

export function not(child: BoolTree): BoolUnary {
  return new BoolUnary('~', child)
}

export function and(left: BoolTree, right: BoolTree): BoolBinary {
  return new BoolBinary(left, '&', right)
}

export function or(left: BoolTree, right: BoolTree): BoolBinary {
  return new BoolBinary(left, '|', right)
}

export function implies(left: BoolTree, right: BoolTree): BoolBinary {
  return new BoolBinary(left, '->', right)
}

export function iff(left: BoolTree, right: BoolTree): BoolBinary {
  return new BoolBinary(left, '==', right)
}

