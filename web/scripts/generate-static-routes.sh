#!/bin/bash
set -e

# Base directory for the built files
DIST_DIR="dist"

echo "Applying GitHub Pages 404 fix..."

# Copy index.html to 404.html to handle client-side routing on GitHub Pages
cp "$DIST_DIR/index.html" "$DIST_DIR/404.html"

# Routes that need static index.html files for direct access
ROUTES=("intro" "basics" "advanced" "efficiency" "binary" "ecosystem" "conclusion")

for path in "${ROUTES[@]}"; do
  echo "Generating static route for: /$path"
  mkdir -p "$DIST_DIR/$path"
  cp "$DIST_DIR/index.html" "$DIST_DIR/$path/index.html"
done

echo "GitHub Pages fix applied successfully."
