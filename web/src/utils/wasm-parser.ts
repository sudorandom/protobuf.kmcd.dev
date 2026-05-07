
declare global {
  interface Window {
    Go: { new(): { importObject: WebAssembly.Imports; run(instance: WebAssembly.Instance): void } };
    parseProto: (input: string) => { error?: string; compilationErrors?: string; fileDescriptorSet?: Uint8Array };
    generateFakeData: (messageName: string, fileDescriptorSet: Uint8Array) => string | { error: string };
    formatPrototext: (messageName: string, fileDescriptorSet: Uint8Array, jsonString: string) => string | { error: string };
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
      const wasmExecPath = path.resolve(process.cwd(), 'public/wasm_exec.js');
      const wasmExecCode = fs.readFileSync(wasmExecPath, 'utf8');
      
      // Execute wasm_exec.js in global context
      const vm = await import('node:vm');
      const context = { global, process, console, require, WebAssembly, setTimeout, clearTimeout, setInterval, clearInterval, crypto: crypto.webcrypto, performance, TextEncoder, TextDecoder };
      vm.runInNewContext(wasmExecCode, context);
      
      // @ts-expect-error Go is defined in the VM context
      const go = new context.Go();
      const wasmPath = path.resolve(process.cwd(), 'public/parser.wasm');
      const wasmBuffer = fs.readFileSync(wasmPath);
      const result = await WebAssembly.instantiate(wasmBuffer, go.importObject);
      go.run(result.instance);
      
      // @ts-expect-error these are defined in the VM context
      global.parseProto = context.parseProto;
      // @ts-expect-error these are defined in the VM context
      global.generateFakeData = context.generateFakeData;
      // @ts-expect-error these are defined in the VM context
      global.formatPrototext = context.formatPrototext;
      return;
    }

    if (typeof window.Go === 'undefined') {
      // Try to wait a brief moment for the script to load if it's deferred
      await new Promise(resolve => setTimeout(resolve, 100));
      if (typeof window.Go === 'undefined') {
        throw new Error("Go wasm_exec.js not loaded. Ensure <script src=\"/wasm_exec.js\"></script> is in your index.html");
      }
    }
    const go = new window.Go();
    const result = await WebAssembly.instantiateStreaming(
      fetch("/parser.wasm"),
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

export async function generateFake(messageName: string, fileDescriptorSet: Uint8Array): Promise<string> {
  await initWasm();
  const g = typeof window !== 'undefined' ? (window as unknown as Window) : (globalThis as unknown as Window);
  const result = g.generateFakeData(messageName, fileDescriptorSet);
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
