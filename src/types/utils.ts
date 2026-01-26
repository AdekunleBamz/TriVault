/**
 * TypeScript utility types for the application
 */

// Make all properties optional recursively
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Make all properties required recursively
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// Make all properties readonly recursively
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Remove readonly modifier from all properties
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// Get the type of array elements
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

// Get keys that have values of a specific type
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

// Omit properties that have undefined values
export type NonNullableProperties<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

// Make specific properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Extract function parameters
export type FunctionParams<T> = T extends (...args: infer P) => unknown ? P : never;

// Extract function return type
export type FunctionReturn<T> = T extends (...args: unknown[]) => infer R ? R : never;

// Extract async function return type
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> = 
  T extends (...args: unknown[]) => Promise<infer R> ? R : never;

// Object with string keys
export type StringKeyOf<T> = Extract<keyof T, string>;

// Merge two types, second type takes precedence
export type Merge<T, U> = Omit<T, keyof U> & U;

// Object path type (for nested access like 'user.profile.name')
export type PathOf<T, Key extends keyof T = keyof T> = Key extends string
  ? T[Key] extends Record<string, unknown>
    ? Key | `${Key}.${PathOf<T[Key]>}`
    : Key
  : never;

// Get type at a specific path
export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never;

// Nullable type
export type Nullable<T> = T | null;

// Maybe type (nullable and undefinable)
export type Maybe<T> = T | null | undefined;

// Falsy type
export type Falsy = false | 0 | '' | null | undefined;

// Truthy type
export type Truthy<T> = Exclude<T, Falsy>;

// Union to intersection
export type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

// Last element of tuple
export type Last<T extends unknown[]> = T extends [...unknown[], infer L] ? L : never;

// First element of tuple
export type First<T extends unknown[]> = T extends [infer F, ...unknown[]] ? F : never;

// Tuple to union
export type TupleToUnion<T extends unknown[]> = T[number];

// Create a tuple of specified length
export type Tuple<T, N extends number, R extends T[] = []> = R['length'] extends N
  ? R
  : Tuple<T, N, [...R, T]>;

// Prettify complex types for better IDE display
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// Strict omit that validates keys
export type StrictOmit<T, K extends keyof T> = Omit<T, K>;

// Strict pick that validates keys
export type StrictPick<T, K extends keyof T> = Pick<T, K>;

// Exact type (prevents extra properties)
export type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;

// Brand type for nominal typing
export type Brand<T, B> = T & { __brand: B };

// Opaque type alias
export type Opaque<T, Token> = T & { readonly __token: Token };

// Type guard helper
export type TypeGuard<T> = (value: unknown) => value is T;

// Constructor type
export type Constructor<T = unknown> = new (...args: unknown[]) => T;

// Instance type from constructor
export type InstanceOf<T> = T extends Constructor<infer I> ? I : never;

// Promisify all methods
export type Promisify<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<Awaited<R>>
    : T[K];
};

// Event handler type
export type EventHandler<E = Event> = (event: E) => void;

// Object entries type
export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

// Object from entries type
export type FromEntries<T extends readonly (readonly [PropertyKey, unknown])[]> = {
  [K in T[number][0]]: Extract<T[number], readonly [K, unknown]>[1];
};

// Validate type at compile time
export type AssertEqual<T, Expected> = T extends Expected
  ? Expected extends T
    ? true
    : never
  : never;

// Non-empty array
export type NonEmptyArray<T> = [T, ...T[]];

// JSON serializable types
export type JSONPrimitive = string | number | boolean | null;
export type JSONArray = JSONValue[];
export type JSONObject = { [key: string]: JSONValue };
export type JSONValue = JSONPrimitive | JSONArray | JSONObject;

export default {};
