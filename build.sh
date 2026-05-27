#!/usr/bin/env bash
# Build script for Cloudflare Pages deployment
# Copies only production files to dist/

set -e

rm -rf dist
mkdir -p dist

# HTML pages
cp *.html dist/ 2>/dev/null || true

# Config and meta files
cp robots.txt dist/ 2>/dev/null || true
cp sitemap.xml dist/ 2>/dev/null || true
cp _redirects dist/ 2>/dev/null || true
cp CNAME dist/ 2>/dev/null || true

# Static assets
cp -r assets dist/
cp -r styles dist/

# JavaScript
cp -r scripts dist/

# Cloudflare Pages Functions (must be at root of deploy dir)
cp -r functions dist/

# Data files needed by the site
if [ -d data ]; then
  cp -r data dist/
fi

echo "Build complete: dist/"
ls -la dist/
