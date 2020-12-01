/**
 * Pads TypedArray on right and bottom with zeros out to target width
 * and target height respectively.
 * @param {Object} tile { data: TypedArray, width: number, height: number}
 * @param {Object} targetWidth number
 * @param {Object} targetHeight number
 * @returns {TypedArray} TypedArray
 */
function padTileWithZeros(tile, targetWidth, targetHeight) {
  const { data, width, height } = tile;
  // Create new TypedArray with same constructor as source
  const padded = new data.constructor(targetWidth * targetHeight);
  // Take strips (rows) from original tile data and fill padded tile using
  // multiples of the tileSize as the offset.
  for (let i = 0; i < height; i += 1) {
    const offset = i * width;
    const strip = data.subarray(offset, offset + width);
    padded.set(strip, i * targetWidth);
  }
  return padded;
}

export { padTileWithZeros };
