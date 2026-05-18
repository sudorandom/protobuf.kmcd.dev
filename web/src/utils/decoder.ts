import {
  type DescMessage,
  ScalarType,
  fromBinary,
  toJson,
} from "@bufbuild/protobuf";

export enum WireType {
  Varint = 0,
  Fixed64 = 1,
  LengthDelimited = 2,
  StartGroup = 3,
  EndGroup = 4,
  Fixed32 = 5,
}

export interface DecodedSegment {
  tag: number;
  fieldName?: string;
  fieldType?: string;
  wireType: number;
  data: Uint8Array;
  value: bigint | number | string;
  rawHex: string[];
  tagBytes: Uint8Array;
  lengthBytes?: Uint8Array;
  payloadBytes: Uint8Array;
}

export function decodeBinary(
  binary: Uint8Array,
  schema?: DescMessage,
): DecodedSegment[] {
  const segments: DecodedSegment[] = [];
  let offset = 0;

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

  function decodeZigZag(n: bigint): bigint {
    return (n >> 1n) ^ -(n & 1n);
  }

  while (offset < binary.length) {
    const startOffset = offset;
    let res: { value: bigint; bytes: number[] };

    try {
      res = readVarint();
    } catch {
      break;
    }

    const tagValue = res.value;
    const tagBytesArray = res.bytes;
    const fieldNo = Number(tagValue >> 3n);
    const wireType = Number(tagValue & 0x07n);
    const field = schema?.fields.find((f) => f.number === fieldNo);

    let data: Uint8Array;
    let value: bigint | number | string;
    let lengthBytes: Uint8Array | undefined;
    let fieldTypeLabel = "";

    if (wireType === WireType.Varint) {
      const { value: v, bytes: vBytes } = readVarint();
      value = v;
      data = new Uint8Array(vBytes);

      if (field?.fieldKind === "scalar") {
        if (
          field.scalar === ScalarType.SINT32 ||
          field.scalar === ScalarType.SINT64
        ) {
          value = decodeZigZag(v);
          fieldTypeLabel =
            field.scalar === ScalarType.SINT32 ? "sint32" : "sint64";
        } else if (field.scalar === ScalarType.INT32) {
          value = Number(BigInt.asIntN(32, v));
          fieldTypeLabel = "int32";
        } else if (field.scalar === ScalarType.BOOL) {
          value = v !== 0n ? "true" : "false";
          fieldTypeLabel = "bool";
        } else {
          fieldTypeLabel = ScalarType[field.scalar].toLowerCase();
        }
      } else if (field?.fieldKind === "enum") {
        fieldTypeLabel = "enum";
        const enumValue = field.enum.values.find(
          (ev) => BigInt(ev.number) === v,
        );
        if (enumValue) value = `${enumValue.name} (${v})`;
      }
    } else if (wireType === WireType.LengthDelimited) {
      const { value: length, bytes: lBytes } = readVarint();
      lengthBytes = new Uint8Array(lBytes);
      const lengthNum = Number(length);
      data = binary.slice(offset, offset + lengthNum);
      offset += lengthNum;

      if (field?.fieldKind === "scalar" && field.scalar === ScalarType.STRING) {
        value = new TextDecoder().decode(data);
        fieldTypeLabel = "string";
      } else if (field?.fieldKind === "message") {
        try {
          const decodedObj = fromBinary(field.message, data);
          value = JSON.stringify(toJson(field.message, decodedObj), null, 2);
        } catch {
          value = `Message: ${field.message.name}`;
        }
        fieldTypeLabel = "message";
      } else {
        value = length;
        fieldTypeLabel =
          field?.fieldKind === "scalar"
            ? ScalarType[field.scalar].toLowerCase()
            : "bytes";
      }
    } else if (wireType === WireType.Fixed64) {
      data = binary.slice(offset, offset + 8);
      offset += 8;
      const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
      if (field?.fieldKind === "scalar" && field.scalar === ScalarType.DOUBLE) {
        value = view.getFloat64(0, true);
        fieldTypeLabel = "double";
      } else if (
        field?.fieldKind === "scalar" &&
        field.scalar === ScalarType.SFIXED64
      ) {
        value = view.getBigInt64(0, true);
        fieldTypeLabel = "sfixed64";
      } else {
        value = view.getBigUint64(0, true);
        fieldTypeLabel =
          field?.fieldKind === "scalar"
            ? ScalarType[field.scalar].toLowerCase()
            : "fixed64";
      }
    } else if (wireType === WireType.Fixed32) {
      data = binary.slice(offset, offset + 4);
      offset += 4;
      const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
      if (field?.fieldKind === "scalar" && field.scalar === ScalarType.FLOAT) {
        value = view.getFloat32(0, true);
        fieldTypeLabel = "float";
      } else if (
        field?.fieldKind === "scalar" &&
        field.scalar === ScalarType.SFIXED32
      ) {
        value = view.getInt32(0, true);
        fieldTypeLabel = "sfixed32";
      } else {
        value = view.getUint32(0, true);
        fieldTypeLabel =
          field?.fieldKind === "scalar"
            ? ScalarType[field.scalar].toLowerCase()
            : "fixed32";
      }
    } else {
      break;
    }

    const segmentBytes = binary.slice(startOffset, offset);
    const rawHex = Array.from(segmentBytes).map((b) =>
      b.toString(16).padStart(2, "0").toUpperCase(),
    );

    segments.push({
      tag: fieldNo,
      fieldName: field?.name,
      fieldType: fieldTypeLabel,
      wireType,
      data,
      value,
      rawHex,
      tagBytes: new Uint8Array(tagBytesArray),
      lengthBytes,
      payloadBytes: data,
    });
  }

  return segments;
}
