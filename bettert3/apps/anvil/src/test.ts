type BoundFunctionWithFoo<T extends (...args: any[]) => any> = T & { foo: boolean };
type FunctionWithFoo<T extends (...args: any[]) => any> = BoundFunctionWithFoo<T> & {
  bind: (thisArg: any, ...args: any[]) => BoundFunctionWithFoo<T>;
};

function addFooProperty<T extends (...args: any[]) => any>(fn: T): FunctionWithFoo<T> {
  (fn as any).foo = true;

  // Override the bind method
  const ORIG = fn.bind;
  (fn as any).bind = (thisArg: any, ...args: any[]): BoundFunctionWithFoo<T> => {
    const boundMethod = ORIG.apply(fn, [thisArg, ...args]) as T;
    (boundMethod as any).foo = true;
    return boundMethod as BoundFunctionWithFoo<T>;
  };

  return fn as FunctionWithFoo<T>;
}

const publisher = addFooProperty(async function* (_f: any): AsyncGenerator<any, void, unknown> {});

console.log(publisher.foo);
const fn = publisher.bind(undefined, 1);
console.log(fn.foo);
