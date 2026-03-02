export function castArray(data = [] as any | any[]): Array<any> {
  return Array.isArray(data) ? data : [data];
}
