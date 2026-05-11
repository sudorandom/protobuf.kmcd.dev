web-install:
	cd web && mise exec -- pnpm install

web-dev:
	cd web && mise exec -- pnpm run dev

web-build: build-wasm
	cd web && mise exec -- pnpm run build

build-wasm:
	@if [ -f web/public/parser.wasm ] && [ -z "$(find wasm-parser -type f -newer web/public/parser.wasm)" ]; then \
		echo "WASM is up to date."; \
	else \
		echo "Building WASM..."; \
		rm -f web/public/parser.wasm; \
		GOOS=js GOARCH=wasm go build -C wasm-parser -ldflags="-s -w" -o ../web/public/parser.wasm main.go; \
		if command -v wasm-opt >/dev/null 2>&1; then \
			wasm-opt -Oz --all-features web/public/parser.wasm -o web/public/parser.wasm; \
		fi; \
		gzip -9 -f web/public/parser.wasm; \
		mv web/public/parser.wasm.gz web/public/parser.wasm; \
	fi

web-check:
	cd web && mise exec -- pnpm run lint
	cd web && mise exec -- pnpm run build

all: web-install web-build
