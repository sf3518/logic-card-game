export class State<A, S> {
  readonly get: A
  readonly state: S

  constructor(a: A, s: S) {
    this.get = a
    this.state = s
  }

  then<B>(f: (s: S) => State<B, S>): State<B, S> {
    return f(this.state)
  }

  apply<B>(f: (a: A) => (s: S) => State<B, S>): State<B, S> {
    return f(this.get)(this.state)
  }

  getBy<B>(f: (a: A) => B): State<B, S> {
    return State.of(f(this.get), this.state)
  }

  static of<A, S>(a: A, s: S): State<A, S> {
    return new State(a, s)
  }
  
  static put<S>(s: S): State<void, S> {
    return new State(undefined, s)
  }
}