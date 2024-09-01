/**
 * Pack into an 8-byte big-endian format.
 */
export const packBigEndian = (value: number): string => {
  const bytes = new Array(8).fill(0);
  for (let i = 7; i >= 0; i--) {
    bytes[i] = value & 255;
    value >>= 8;
  }

  return String.fromCharCode(...bytes);
};
