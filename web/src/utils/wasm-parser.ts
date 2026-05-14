
import './wasm_exec.js';

declare global {
  interface Window {
    Go: { new(): { importObject: WebAssembly.Imports; run(instance: WebAssembly.Instance): void } };
    parseProto: (input: string) => { error?: string; compilationErrors?: string; fileDescriptorSet?: Uint8Array };
    generateFakeData: (messageName: string, fileDescriptorSet: Uint8Array, maxDepth?: number) => string | { error: string };
    formatPrototext: (messageName: string, fileDescriptorSet: Uint8Array, jsonString: string) => string | { error: string };
    formatProtoscope: (binaryData: Uint8Array) => string | { error: string };
  }
}

export interface CompilationError {
  file: string;
  line: number;
  col: number;
  offset: number;
  message: string;
}

let wasmPromise: Promise<void> | null = null;

export async function initWasm() {
  if (wasmPromise) return wasmPromise;

  wasmPromise = (async () => {
    if (typeof window === 'undefined') {
      // Node.js environment (for tests)
      const fs = await import('node:fs');
      const path = await import('node:path');
      const { TextEncoder, TextDecoder } = await import('node:util');

      global.TextEncoder = TextEncoder;
      // @ts-expect-error global.TextDecoder is not defined in all environments
      global.TextDecoder = TextDecoder;

      const crypto = await import('node:crypto');
      Object.defineProperty(global, 'crypto', {
        value: crypto.webcrypto,
        configurable: true,
        enumerable: true,
        writable: true
      });

      // Load wasm_exec.js
      const wasmExecPath = path.resolve(process.cwd(), 'src/utils/wasm_exec.js');
      const wasmExecCode = fs.readFileSync(wasmExecPath, 'utf8');

      // Execute wasm_exec.js in global context
      const vm = await import('node:vm');
      const context = { global, process, console, require, WebAssembly, setTimeout, clearTimeout, setInterval, clearInterval, crypto: crypto.webcrypto, performance, TextEncoder, TextDecoder };
      vm.runInNewContext(wasmExecCode, context);
      
      // @ts-expect-error Go is defined in the VM context
      const go = new context.Go();
      const wasmPath = path.resolve(process.cwd(), 'public/parser.wasm');
      let wasmBuffer = fs.readFileSync(wasmPath);

      // Check for gzip magic number (0x1f 0x8b)
      if (wasmBuffer.length >= 2 && wasmBuffer[0] === 0x1f && wasmBuffer[1] === 0x8b) {
        const zlib = await import('node:zlib');
        wasmBuffer = zlib.gunzipSync(wasmBuffer);
      }

      const result = await WebAssembly.instantiate(wasmBuffer, go.importObject);
      go.run(result.instance);

      // @ts-expect-error these are defined in the VM context
      global.parseProto = context.parseProto;
      // @ts-expect-error these are defined in the VM context
      global.generateFakeData = context.generateFakeData;
      // @ts-expect-error these are defined in the VM context
      global.formatPrototext = context.formatPrototext;
      // @ts-expect-error these are defined in the VM context
      global.formatProtoscope = context.formatProtoscope;
      return;
    }

    const go = new window.Go();
    const response = await fetch("/parser.wasm?v=1");

    let wasmResponse: Response;
    
    // Even if the content type isn't set, we can check the body if we want to be sure,
    // but pipeThrough(new DecompressionStream("gzip")) is generally what we want if we know it's gzipped.
    // Since we control the build, we know it's gzipped.
    // To be safe and support both gzipped and non-gzipped (e.g. during dev if not using just build-wasm),
    // we can peek at the first few bytes.

    const reader = response.body!.getReader();
    const { value, done } = await reader.read();

    if (!done && value && value.length >= 2 && value[0] === 0x1f && value[1] === 0x8b) {
      const ds = new DecompressionStream("gzip");
      const decompressedStream = new ReadableStream({
        start(controller) {
          controller.enqueue(value);
          const push = async () => {
            while (true) {
              const { value, done } = await reader.read();
              if (done) {
                controller.close();
                break;
              }
              controller.enqueue(value);
            }
          };
          push();
        }
      }).pipeThrough(ds);

      wasmResponse = new Response(decompressedStream, {
        headers: { "Content-Type": "application/wasm" }
      });
    } else {
      // Not gzipped, put the first chunk back and continue
      const fullStream = new ReadableStream({
        start(controller) {
          if (value) controller.enqueue(value);
          const push = async () => {
            while (true) {
              const { value, done } = await reader.read();
              if (done) {
                controller.close();
                break;
              }
              controller.enqueue(value);
            }
          };
          push();
        }
      });
      wasmResponse = new Response(fullStream, {
        headers: { "Content-Type": "application/wasm" }
      });
    }

    const result = await WebAssembly.instantiateStreaming(
      wasmResponse,
      go.importObject
    );
    go.run(result.instance);
  })();

  return wasmPromise;
}

export async function parseWithWasm(files: Record<string, string>) {
  await initWasm();
  const g = typeof window !== 'undefined' ? (window as unknown as Window) : (globalThis as unknown as Window);
  const result = g.parseProto(JSON.stringify(files));
  if (result.error) {
    throw new Error(result.error);
  }
  if (result.compilationErrors) {
    return { compilationErrors: JSON.parse(result.compilationErrors) as CompilationError[] };
  }
  return { fileDescriptorSet: result.fileDescriptorSet! };
}

export async function generateFake(messageName: string, fileDescriptorSet: Uint8Array, maxDepth?: number): Promise<string> {
  await initWasm();
  const g = typeof window !== 'undefined' ? (window as unknown as Window) : (globalThis as unknown as Window);
  const result = g.generateFakeData(messageName, fileDescriptorSet, maxDepth);
  if (typeof result === 'object' && result.error) {
    throw new Error(result.error);
  }
  return result as string;
}

export async function convertToPrototext(messageName: string, fileDescriptorSet: Uint8Array, jsonString: string): Promise<string> {
  await initWasm();
  const g = typeof window !== 'undefined' ? (window as unknown as Window) : (globalThis as unknown as Window);
  const result = g.formatPrototext(messageName, fileDescriptorSet, jsonString);
  if (typeof result === 'object' && result.error) {
    throw new Error(result.error);
  }
  return result as string;
}

export async function convertToProtoscope(binaryData: Uint8Array): Promise<string> {
  await initWasm();
  const g = typeof window !== 'undefined' ? (window as unknown as Window) : (globalThis as unknown as Window);
  const result = g.formatProtoscope(binaryData);
  if (typeof result === 'object' && result.error) {
    throw new Error(result.error);
  }
  return result as string;
}
