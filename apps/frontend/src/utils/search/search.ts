/*
  This file contains useful functions/operations for searching and filtering
  Used usually in conjunction with the Search.tsx component
 */

// Generic search function
// source: https://javascript.plainenglish.io/react-and-typescript-generic-search-sort-and-filter-879c5c3e2f0e
export default function genericSearch<T>(
  object: T,
  properties: Array<keyof T>,
  query: string
): boolean {
  if (query === "") {
    return true;
  }

  const any_match = properties.some((property) => {
    const value = object[property];
    if (typeof value === "string" || typeof value === "number") {
      return value.toString().toLowerCase().includes(query.toLowerCase());
    }
    return false;
  });

  return any_match;
}

export interface IFilter<T> {
  property: keyof T;
  isTruthyPicked: boolean;
}

export function genericFilter<T>(object: T, filters: Array<IFilter<T>>) {
  if (filters.length === 0) {
    return true;
  }

  const results = filters.every((filter) => {
    return filter.isTruthyPicked
      ? object[filter.property]
      : !object[filter.property];
  });

  return results;
}
