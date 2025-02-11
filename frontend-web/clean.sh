#!/bin/bash

# Remove node_modules
rm -rf node_modules

# Remove dist directory
rm -rf dist

# Remove npm cache
npm cache clean --force

# Remove Next.js cache
rm -rf .next

# Remove TypeScript cache
rm -rf .tsbuildinfo

# Remove Babel cache
rm -rf .babel_cache

# Remove logs
rm -rf logs

# Remove temporary files
rm -rf tmp

# Reinstall dependencies
npm install
# or if using Yarn

echo "Cleanup complete!"