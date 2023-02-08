

export function readNextFloat(binary: Buffer, pos: number) {
  const float = binary.slice(pos, pos + 4).readFloatLE()
  pos += 4
  return float
}

export function readNextInt(binary: Buffer, pos: number) {
  const float = binary.slice(pos, pos + 4).readInt32LE()
  pos += 4
  return float
}

export function readNextInt8(binary: Buffer, pos: number) {
  const int8 = binary.slice(pos, pos + 1).readUInt8()
  pos += 1
  return int8
}

export function readNextShort(binary: Buffer, pos: number) {
  const short = binary.slice(pos, pos + 2).readInt16LE()
  pos += 2
  return short
}
