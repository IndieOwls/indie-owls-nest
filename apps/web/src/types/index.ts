/** Makes a given type optionally null. */
export type Nullable<T> = T | null

/** Recursively marks all properties of T as optional. */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

/** Extracts value type from an array type. */
export type ValueOf<T> = T extends (infer U)[] ? U : never

/** Picks keys of T whose values extend U. */
export type PickByType<T, U> = { [P in keyof T]: T[P] extends U ? P : never }[keyof T]
