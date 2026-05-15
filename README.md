# protobuf.kmcd.dev

An interactive, deep-dive explainer for Protocol Buffers (Protobuf). This project aims to demystify the Protobuf wire format, varint encoding, and the relationship between schemas and binary data.

## Project Structure

- `wasm-parser/`: A Go-based tool compiled to WebAssembly that handles Protobuf compilation, fake data generation, and wire format disassembly (using Protoscope).
- `web/`: A React + Vite frontend that provides the interactive UI, hex stream analysis, and visual explainers.

## Prerequisites

- **Go**: 1.26+ (for building the WASM parser)
- **Node.js**: 20+ (for the React frontend)
- **pnpm**: Fast, disk space efficient package manager
- **just**: Command runner (optional, but recommended for orchestrating builds)
- **mise**: (Optional) Used in the `justfile` for environment management

## Local Development

The project uses a `justfile` to manage common tasks.

### 1. Initial Setup

Install dependencies for the web frontend:

```bash
just web-install
```

### 2. Start Development Server

This will start the Vite dev server. The first run will automatically build the WASM parser if it's missing or out of date.

```bash
just web-dev
```

The site will be available at `http://localhost:5173`.

### 3. Manual WASM Build

If you make changes to the Go code in `wasm-parser/`, you can rebuild the WASM binary manually:

```bash
just wasm-build
```

## Building for Production

To create a production build of both the WASM parser and the frontend:

```bash
just web-build
```

The output will be in `web/dist/`.

## Deployment

The project is configured for deployment via GitHub Actions (see `.github/workflows/`). It builds the WASM parser and frontend before deploying to the target environment.

## License

MIT
