/**
 * PartialPick
 * @description Picks out fields from an interface and makes them optional
 */
export type PartialPick<T, K extends keyof T> = {
  [P in K]?: T[P];
};
