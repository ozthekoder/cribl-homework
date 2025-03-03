export function getJsonLineCount(obj: any): number {
  const formattedJson = JSON.stringify(obj, null, 2);
  return formattedJson.split("\n").length;
}


