web-install:
	cd web && mise exec -- pnpm install

web-dev:
	cd web && mise exec -- pnpm run dev

web-build: build-wasm
	cd web && mise exec -- pnpm run build

build-wasm:
	cd wasm-parser && GOOS=js GOARCH=wasm mise exec -- go build -o ../web/public/parser.wasm main.go

web-check:
	cd web && mise exec -- pnpm run lint
	cd web && mise exec -- pnpm run build

all: web-install web-build
