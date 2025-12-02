#!/bin/bash
set -e

echo "🔍 Running TypeScript type check..."
npm run typecheck

echo "🔍 Running ESLint..."
npm run lint

echo "🔍 Running Prettier check..."
npm run format:check

echo "✅ All checks passed!"
