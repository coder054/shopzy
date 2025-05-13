export class Just<T> {
  constructor(public value: T) {}
  map() {}

  flatMap<T2>(fn: (a: T) => Maybe<T2>): Maybe<T2> {
    const b = fn(this.value);
    return b;
  }
}
export class Nothing {
  constructor() {}

  flatMap<T2>(fn: (a: never) => Maybe<T2>): Maybe<T2> {
    return new Nothing();
  }
}

export type Maybe<T> = Just<T> | Nothing;
