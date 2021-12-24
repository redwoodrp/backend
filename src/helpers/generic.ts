export function containsDuplicates (arr: unknown[]): boolean {
  return new Set(arr).size !== arr.length;
}
