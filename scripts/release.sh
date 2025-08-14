#!/bin/bash

# Somali ID Validator Release Script
# Usage: ./scripts/release.sh [version] [type]
# Example: ./scripts/release.sh 0.2.0 release

set -e

VERSION=${1:-"0.2.0"}
TYPE=${2:-"release"}

echo "🚀 Preparing release v$VERSION"

# Check if we're on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    echo "❌ Error: Must be on main branch to release"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Working directory is not clean"
    git status --short
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm run test:all

if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Aborting release."
    exit 1
fi

echo "✅ All tests passed!"

# Update version in package.json
echo "📝 Updating version to $VERSION..."
npm version $VERSION --no-git-tag-version

# Update CHANGELOG.md date
TODAY=$(date +%Y-%m-%d)
sed -i.bak "s/## \[${VERSION}\] - TBD/## [${VERSION}] - ${TODAY}/" CHANGELOG.md
rm CHANGELOG.md.bak 2>/dev/null || true

# Commit changes
echo "📦 Committing changes..."
git add package.json CHANGELOG.md
git commit -m "Release v$VERSION

- Updated package version to $VERSION
- Updated CHANGELOG.md with release date"

# Create and push tag
echo "🏷️  Creating tag v$VERSION..."
git tag -a "v$VERSION" -m "Release v$VERSION

$(grep -A 20 "## \[$VERSION\]" CHANGELOG.md | head -20)"

# Push changes and tag
echo "⬆️  Pushing to GitHub..."
git push origin main
git push origin "v$VERSION"

echo "✅ Release v$VERSION completed!"
echo ""
echo "🎉 Next steps:"
echo "1. Go to https://github.com/omartood/somali-id-validator/releases"
echo "2. The GitHub Action will automatically create the release"
echo "3. The package will be published to NPM automatically"
echo ""
echo "📦 NPM: https://www.npmjs.com/package/somali-id-validator"
echo "🐙 GitHub: https://github.com/omartood/somali-id-validator/releases/tag/v$VERSION"