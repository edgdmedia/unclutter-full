#!/bin/bash

# Deploy script for financePWA
echo "Starting deployment process for financePWA..."

# Ensure we're on the prod-financePWA branch
git checkout prod-financePWA

# Pull latest changes
git pull origin prod-financePWA

# Install dependencies
npm install

# Update version information
CURRENT_VERSION=$(node -p "require('./package.json').version")
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Update version.json with current version and build date
cat > ./public/version.json << EOL
{
  "version": "$CURRENT_VERSION",
  "buildDate": "$BUILD_DATE",
  "notes": "Production release",
  "requiredUpdate": false,
  "features": [
    "Core financial management features",
    "Offline support",
    "Background synchronization"
  ]
}
EOL

echo "Updated version.json with version $CURRENT_VERSION and build date $BUILD_DATE"

# Build the project for production
npm run build

# If using Netlify CLI for deployment
if command -v netlify &> /dev/null; then
  echo "Deploying to Netlify..."
  netlify deploy --prod
else
  echo "Netlify CLI not found. Please install it with 'npm install -g netlify-cli' or deploy manually."
  echo "You can deploy manually by running: netlify deploy --prod"
  echo "Or by connecting your GitHub repository to Netlify and pushing to the prod-financePWA branch."
fi

echo "Deployment process completed!"
