
export function convertToBytes(bytes: number, unit: string): number {
  switch (unit) {
    case "KB":
      return bytes * 1000;
    case "MB":
      return bytes * (1000 * 1000);
    case "GB":
      return bytes * (1000 * 1000 * 1000);
    default:
      return bytes;
  }
}

export function convertFromBytes(bytes: number, unit: string): number {
  if (bytes === Infinity) return Infinity;
  switch (unit) {
    case "KB":
      return bytes / 1000;
    case "MB":
      return bytes / (1000 * 1000);
    case "GB":
      return bytes / (1000 * 1000 * 1000);
    default:
      return bytes;
  }
}