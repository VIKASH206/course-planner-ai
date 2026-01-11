#!/bin/bash

# Vercel Build Script - Force Clean Build
# This script ensures a completely fresh build every time

echo "🧹 Cleaning node_modules and build cache..."
rm -rf node_modules
rm -rf .angular
rm -rf dist
rm -rf .vercel

echo "📦 Installing dependencies with clean cache..."
npm ci --prefer-offline=false --no-audit

echo "🔨 Building Angular app for production..."
npm run build -- --configuration production

echo "✅ Build complete!"
