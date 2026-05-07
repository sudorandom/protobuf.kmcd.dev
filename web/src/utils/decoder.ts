export enum WireType {
  Varint = 0,
  Fixed64 = 1,
  LengthDelimited = 2,
  StartGroup = 3,
  EndGroup = 4,
  Fixed32 = 5,
}

export interface ByteSegment {
  val: string;
  raw: number;
  type: 'tag' | 'len' | 'data';
  desc: string;
  fieldId: number;
}

export function decodeBinary(binary: Uint8Array): ByteSegment[] {
  const segments: ByteSegment[] = [];
  let offset = 0;
  let currentFieldId = 0;

  function readVarint(): { value: bigint; bytes: number[] } {
    let value = 0n;
    let shift = 0n;
    const bytes = [];
    while (offset < binary.length) {
      const byte = binary[offset++];
      bytes.push(byte);
      value |= BigInt(byte & 0x7f) << shift;
      if (!(byte & 0x80)) break;
      shift += 7n;
    }
    return { value, bytes };
  }

  while (offset < binary.length) {
    const fieldId = currentFieldId++;
    const { value: tagValue, bytes: tagBytes } = readVarint();
    const fieldNo = Number(tagValue >> 3n);
    const wireType = Number(tagValue & 0x07n);

    segments.push(...tagBytes.map(b => ({
      val: b.toString(16).padStart(2, '0'),
      raw: b,
      type: 'tag' as const,
      desc: `Field ${fieldNo}, WireType ${wireType} (${WireType[wireType] || 'Unknown'})`,
      fieldId
    })));

    if (wireType === WireType.Varint) {
      const { value, bytes } = readVarint();
      segments.push(...bytes.map(b => ({
        val: b.toString(16).padStart(2, '0'),
        raw: b,
        type: 'data' as const,
        desc: `Varint Value: ${value}`,
        fieldId
      })));
    } else if (wireType === WireType.LengthDelimited) {
      const { value: length, bytes: lenBytes } = readVarint();
      segments.push(...lenBytes.map(b => ({
        val: b.toString(16).padStart(2, '0'),
        raw: b,
        type: 'len' as const,
        desc: `Length: ${length} bytes`,
        fieldId
      })));

      const dataBytes = binary.slice(offset, offset + Number(length));
      offset += Number(length);
      
      segments.push(...Array.from(dataBytes).map(b => ({
        val: b.toString(16).padStart(2, '0'),
        raw: b,
        type: 'data' as const,
        desc: `Data (Field ${fieldNo})`,
        fieldId
      })));
    } else if (wireType === WireType.Fixed64) {
      const dataBytes = binary.slice(offset, offset + 8);
      offset += 8;
      segments.push(...Array.from(dataBytes).map(b => ({
        val: b.toString(16).padStart(2, '0'),
        raw: b,
        type: 'data' as const,
        desc: `Fixed64 Data (Field ${fieldNo})`,
        fieldId
      })));
    } else if (wireType === WireType.Fixed32) {
      const dataBytes = binary.slice(offset, offset + 4);
      offset += 4;
      segments.push(...Array.from(dataBytes).map(b => ({
        val: b.toString(16).padStart(2, '0'),
        raw: b,
        type: 'data' as const,
        desc: `Fixed32 Data (Field ${fieldNo})`,
        fieldId
      })));
    } else {
      break;
    }
  }

  return segments;
}
