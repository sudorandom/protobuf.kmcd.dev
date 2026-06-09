web-install:
	cd web && pnpm install

web-format:
	cd web && pnpm run format

web-dev: web-format
	cd web && pnpm run dev

web-serve: web-build
	cd web && pnpm run preview

web-build: web-format wasm-build
	cd web && pnpm run build

web-fetch-stars:
	cd web && GITHUB_TOKEN=$(gh auth token 2>/dev/null || echo $GITHUB_TOKEN) pnpm run fetch-stars

wasm-build:
	@if ! command -v tinygo >/dev/null 2>&1; then \
		echo "Error: tinygo is not installed."; \
		echo "Please install tinygo by following the instructions at: https://tinygo.org/getting-started/install/"; \
		exit 1; \
	fi
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

generate:
	buf generate

pre-compute:
	cd examples-gen && go mod tidy && go run . > ../web/src/utils/static-examples.ts

web-check: web-format wasm-build
	cd web && pnpm run lint
	cd web && pnpm run build

all: web-install web-build
