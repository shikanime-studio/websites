export const LittleEndianness = 0x4949 // 'II'
export const BigEndianness = 0x4D4D // 'MM'
export const TiffMagicNumber = 42

export type Endianness = typeof LittleEndianness | typeof BigEndianness

export const ByteExifType = 1
export const AsciiExifType = 2
export const ShortExifType = 3
export const LongExifType = 4
export const RationalExifType = 5
export const SLongExifType = 9
export const SRationalExifType = 10

export type ExifType
  = | typeof ByteExifType
    | typeof AsciiExifType
    | typeof ShortExifType
    | typeof LongExifType
    | typeof RationalExifType
    | typeof SLongExifType
    | typeof SRationalExifType

export function sizeOf(type: ExifType): number {
  switch (type) {
    case ByteExifType:
    case AsciiExifType:
      return 1
    case ShortExifType:
      return 2
    case LongExifType:
    case SLongExifType:
      return 4
    case RationalExifType:
    case SRationalExifType:
      return 8
    default:
      return 0
  }
}

export function isContainer(type: ExifType) {
  return type === AsciiExifType || type === ByteExifType
}

export class TiffDataView<T extends ArrayBufferLike> extends DataView<T> {
  setEndianness(endianness: Endianness) {
    this.setUint16(0, endianness, true)
  }

  setMagicNumber(magic = TiffMagicNumber) {
    this.setUint16(2, magic, true)
  }

  setFirstIfdOffset(firstIfdOffset = 8) {
    this.setUint32(4, firstIfdOffset, true)
  }

  getAscii(offset: number, length: number): string {
    let str = ''
    for (let i = 0; i < length; i++) {
      const charCode = this.getUint8(offset + i)
      if (charCode === 0)
        break
      str += String.fromCharCode(charCode)
    }
    return str.trim()
  }

  setAscii(offset: number, str: string, length: number) {
    const bytes = new Uint8Array(this.buffer, this.byteOffset + offset, length)
    bytes.fill(0)
    const len = Math.min(length, str.length)
    for (let i = 0; i < len; i++) {
      bytes[i] = str.charCodeAt(i) & 0xFF
    }
  }

  getRational(offset: number, littleEndian?: boolean): number {
    const numerator = this.getUint32(offset, littleEndian)
    const denominator = this.getUint32(offset + 4, littleEndian)
    return numerator / denominator
  }

  getSRational(offset: number, littleEndian?: boolean): number {
    const sNumerator = this.getInt32(offset, littleEndian)
    const sDenominator = this.getInt32(offset + 4, littleEndian)
    return sNumerator / sDenominator
  }

  getEndianness() {
    return this.getUint16(0, true) as Endianness
  }

  getLittleEndian() {
    return this.getEndianness() === LittleEndianness
  }

  getMagicNumber(littleEndian = this.getLittleEndian()) {
    return this.getUint16(2, littleEndian)
  }

  getFirstIfdOffset(littleEndian = this.getLittleEndian()) {
    const ifdOffset = this.getUint32(4, littleEndian)
    if (ifdOffset < 8 || ifdOffset + 2 > this.byteLength)
      return null
    return ifdOffset
  }

  getIfdEntryCount(ifdOffset: number, littleEndian = this.getLittleEndian()) {
    if (ifdOffset < 8 || ifdOffset + 2 > this.byteLength)
      return null
    return this.getUint16(ifdOffset, littleEndian)
  }

  getIfdEntryOffset(ifdOffset: number, entryIndex: number) {
    return ifdOffset + 2 + entryIndex * 12
  }

  getIfdNextOffset(ifdOffset: number, littleEndian = this.getLittleEndian()) {
    const entryCount = this.getIfdEntryCount(ifdOffset, littleEndian)
    if (entryCount === null)
      return null
    const nextOffsetPos = ifdOffset + 2 + entryCount * 12
    if (nextOffsetPos + 4 > this.byteLength)
      return null
    return this.getUint32(nextOffsetPos, littleEndian)
  }

  getIfdEntries(ifdOffset: number, littleEndian = this.getLittleEndian()) {
    const entryCount = this.getIfdEntryCount(ifdOffset, littleEndian)
    if (entryCount === null)
      return []

    const ifdByteLength = 2 + entryCount * 12 + 4
    if (ifdOffset + ifdByteLength > this.byteLength)
      return []

    const entries: Array<{ tagId: number, value: unknown }> = []
    for (let i = 0; i < entryCount; i++) {
      const entryOffset = this.getIfdEntryOffset(ifdOffset, i)
      entries.push(this.getTagEntry(entryOffset, littleEndian))
    }
    return entries
  }

  getIfdTagValues(ifdOffset: number, tagId: number, littleEndian = this.getLittleEndian()) {
    const entryCount = this.getIfdEntryCount(ifdOffset, littleEndian)
    if (entryCount === null)
      return null

    const ifdByteLength = 2 + entryCount * 12 + 4
    if (ifdOffset + ifdByteLength > this.byteLength)
      return null

    for (let i = 0; i < entryCount; i++) {
      const entryOffset = this.getIfdEntryOffset(ifdOffset, i)
      const header = this.getTagHeader(entryOffset, littleEndian)
      if (header.tagId !== tagId)
        continue

      const typeSize = sizeOf(header.type)
      if (typeSize <= 0 || header.count <= 0)
        return null

      const byteLen = typeSize * header.count
      const valueOffset
        = byteLen <= 4 ? entryOffset + 8 : this.getUint32(entryOffset + 8, littleEndian)

      if (valueOffset + byteLen > this.byteLength)
        return null

      if (isContainer(header.type)) {
        return this.getContainer(valueOffset, header.type, header.count)
      }

      if (header.count === 1) {
        return this.getValue(valueOffset, header.type, littleEndian)
      }

      const values: Array<number> = []
      for (let j = 0; j < header.count; j++) {
        const v = this.getValue(
          valueOffset + j * typeSize,
          header.type,
          littleEndian,
        )
        if (typeof v !== 'number')
          return null
        values.push(v)
      }
      return values
    }

    return null
  }

  getIfdTagNumberArray(ifdOffset: number, tagId: number, littleEndian = this.getLittleEndian()) {
    const v = this.getIfdTagValues(ifdOffset, tagId, littleEndian)
    if (typeof v === 'number')
      return [v]
    if (Array.isArray(v) && v.every(x => typeof x === 'number'))
      return v
    return null
  }

  getTagHeader(offset: number, littleEndian?: boolean) {
    return {
      tagId: this.getUint16(offset, littleEndian),
      type: this.getUint16(offset + 2, littleEndian) as ExifType,
      count: this.getUint32(offset + 4, littleEndian),
    }
  }

  setTagHeader(
    offset: number,
    tagId: number,
    type: ExifType,
    count: number,
    littleEndian?: boolean,
  ) {
    this.setUint16(offset, tagId, littleEndian)
    this.setUint16(offset + 2, type, littleEndian)
    this.setUint32(offset + 4, count, littleEndian)
  }

  setTagValueOrOffset(offset: number, valueOrOffset: number, littleEndian?: boolean) {
    this.setUint32(offset + 8, valueOrOffset, littleEndian)
  }

  setTagEntry(
    offset: number,
    tagId: number,
    type: ExifType,
    count: number,
    valueOrOffset: number,
    littleEndian?: boolean,
  ) {
    this.setTagHeader(offset, tagId, type, count, littleEndian)
    this.setTagValueOrOffset(offset, valueOrOffset, littleEndian)
  }

  setShortArray(offset: number, values: Array<number>, littleEndian?: boolean) {
    for (let i = 0; i < values.length; i++) {
      this.setUint16(offset + i * 2, values[i], littleEndian)
    }
  }

  getValue(offset: number, type: ExifType, littleEndian?: boolean) {
    switch (type) {
      case ShortExifType:
        return this.getUint16(offset, littleEndian)
      case LongExifType:
        return this.getUint32(offset, littleEndian)
      case RationalExifType:
        return this.getRational(offset, littleEndian)
      case SRationalExifType:
        return this.getSRational(offset, littleEndian)
      default:
        return null
    }
  }

  getContainer(offset: number, type: ExifType, count: number) {
    switch (type) {
      case AsciiExifType:
        return this.getAscii(offset, count)
      case ByteExifType:
        return this.buffer.slice(
          this.byteOffset + offset,
          this.byteOffset + offset + count,
        )
      default:
        return null
    }
  }

  getTagEntry(offset: number, littleEndian?: boolean) {
    const { tagId, type, count } = this.getTagHeader(offset, littleEndian)
    const typeSize = sizeOf(type)
    const totalSize = typeSize * count

    let valueOffset = offset + 8
    if (totalSize > 4) {
      valueOffset = this.getUint32(offset + 8, littleEndian)
    }

    const value = isContainer(type)
      ? this.getContainer(valueOffset, type, count)
      : this.getValue(valueOffset, type, littleEndian)

    return {
      tagId,
      value,
    }
  }

  setIfdEntryCount(ifdOffset: number, entryCount: number, littleEndian = true) {
    this.setUint16(ifdOffset, entryCount, littleEndian)
  }

  setIfdEntry(
    ifdOffset: number,
    entryIndex: number,
    tagId: number,
    type: ExifType,
    count: number,
    valueOrOffset: number,
    littleEndian = true,
  ) {
    const entryOffset = ifdOffset + 2 + entryIndex * 12
    this.setTagEntry(entryOffset, tagId, type, count, valueOrOffset, littleEndian)
  }

  setIfdNextOffset(
    ifdOffset: number,
    entryCount: number,
    nextIfdOffset: number,
    littleEndian = true,
  ) {
    this.setUint32(ifdOffset + 2 + entryCount * 12, nextIfdOffset, littleEndian)
  }
}
