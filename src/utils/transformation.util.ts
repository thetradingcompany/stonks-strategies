export function convertObjectToArray(data: object): any[] {
  return Object.keys(data).map((key) => data[key]);
}
