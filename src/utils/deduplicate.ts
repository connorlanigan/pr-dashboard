export function deduplicate<T>(data: ReadonlyArray<T>, key: keyof T) {
  const deduplicatedData: Array<T> = [];

  for (const entry of data) {
    if (
      !deduplicatedData.find(
        (encounteredData) => encounteredData[key] === entry[key]
      )
    ) {
      deduplicatedData.push(entry);
    }
  }
  return deduplicatedData;
}
