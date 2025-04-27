#!/bin/bash

# Build the application
echo "Building application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Build failed. Exiting..."
    exit 1
fi

# Deploy to Butterfly
echo "Deploying to Butterfly..."
butterfly-cli deploy \
    --config butterfly.config.json \
    --build-dir dist \
    --app-name wanderBloom \
    --env production

# Check deployment status
if [ $? -ne 0 ]; then
    echo "Deployment failed. Check logs for details."
    exit 1
fi

echo "Deployment successful!" 