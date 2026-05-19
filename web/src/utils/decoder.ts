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

    // Robust field lookup: check fields and extensions
    const field = schema?.fields.find((f) => f.number === fieldNo);

    let data: Uint8Array;
    let value: bigint | number | string;
    let lengthBytes: Uint8Array | undefined;
    let fieldTypeLabel: string;

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
      } else {
        fieldTypeLabel = field ? "varint" : "unknown (varint)";
      }
    } else if (wireType === WireType.LengthDelimited) {
      const { value: length, bytes: lBytes } = readVarint();
      lengthBytes = new Uint8Array(lBytes);
      const lengthNum = Number(length);
      data = binary.subarray(offset, offset + lengthNum);
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
      } else if (
        field?.fieldKind === "list" &&
        field.listKind === "scalar" &&
        wireType === WireType.LengthDelimited
      ) {
        // Packed repeated scalar (Protobuf v2 uses fieldKind: "list" and listKind: "scalar")
        const results: (bigint | number | string)[] = [];
        let pOffset = 0;
        const pData = data;
        const scalar = field.scalar;

        while (pOffset < pData.length) {
          if (
            scalar === ScalarType.INT32 ||
            scalar === ScalarType.INT64 ||
            scalar === ScalarType.UINT32 ||
            scalar === ScalarType.UINT64 ||
            scalar === ScalarType.BOOL ||
            scalar === ScalarType.SINT32 ||
            scalar === ScalarType.SINT64
          ) {
            // Varint types
            let v = 0n;
            let shift = 0n;
            let found = false;
            while (pOffset < pData.length) {
              const b = pData[pOffset++];
              v |= BigInt(b & 0x7f) << shift;
              if (!(b & 0x80)) {
                found = true;
                break;
              }
              shift += 7n;
            }
            if (!found) break;

            if (scalar === ScalarType.SINT32 || scalar === ScalarType.SINT64) {
              results.push(decodeZigZag(v).toString());
            } else if (scalar === ScalarType.BOOL) {
              results.push(v !== 0n ? "true" : "false");
            } else if (scalar === ScalarType.INT32) {
              results.push(Number(BigInt.asIntN(32, v)));
            } else {
              results.push(v.toString());
            }
          } else if (
            scalar === ScalarType.FIXED64 ||
            scalar === ScalarType.SFIXED64 ||
            scalar === ScalarType.DOUBLE
          ) {
            if (pOffset + 8 <= pData.length) {
              const view = new DataView(
                pData.buffer,
                pData.byteOffset + pOffset,
                8,
              );
              if (scalar === ScalarType.DOUBLE)
                results.push(view.getFloat64(0, true));
              else if (scalar === ScalarType.SFIXED64)
                results.push(view.getBigInt64(0, true).toString());
              else results.push(view.getBigUint64(0, true).toString());
              pOffset += 8;
            } else break;
          } else if (
            scalar === ScalarType.FIXED32 ||
            scalar === ScalarType.SFIXED32 ||
            scalar === ScalarType.FLOAT
          ) {
            if (pOffset + 4 <= pData.length) {
              const view = new DataView(
                pData.buffer,
                pData.byteOffset + pOffset,
                4,
              );
              if (scalar === ScalarType.FLOAT)
                results.push(view.getFloat32(0, true));
              else if (scalar === ScalarType.SFIXED32)
                results.push(view.getInt32(0, true));
              else results.push(view.getUint32(0, true));
              pOffset += 4;
            } else break;
          } else {
            break;
          }
        }
        value = `[${results.join(", ")}]`;
        fieldTypeLabel = `packed ${ScalarType[scalar].toLowerCase()}`;
      } else {
        value = lengthNum;
        if (field) {
          if (field.fieldKind === "scalar") {
            fieldTypeLabel = ScalarType[field.scalar].toLowerCase();
          } else if (field.fieldKind === "list") {
            fieldTypeLabel = `repeated ${field.listKind === "scalar" ? ScalarType[field.scalar].toLowerCase() : field.listKind}`;
          } else {
            fieldTypeLabel = field.fieldKind;
          }
        } else {
          const availableTags =
            schema?.fields.map((f) => f.number).join(",") || "none";
          fieldTypeLabel = `unknown (tag:${fieldNo}, message:${schema?.name || "none"}, fields:[${availableTags}])`;
        }
      }
    } else if (wireType === WireType.Fixed64) {
      data = binary.subarray(offset, offset + 8);
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
      data = binary.subarray(offset, offset + 4);
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
