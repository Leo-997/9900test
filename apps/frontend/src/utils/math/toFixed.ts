export function toFixed(num: number, precision: number): string {
  const exponentialForm = Number(`${num}e${precision}`);
  const rounded = Math.round(exponentialForm);
  const finalResult = Number(`${rounded}e-${precision}`).toFixed(precision);
  return finalResult;
}
