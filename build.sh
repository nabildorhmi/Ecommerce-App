#!/bin/bash

# Ensure storage directories exist
mkdir -p storage/framework/{sessions,views,cache/data}
mkdir -p storage/logs
mkdir -p bootstrap/cache

# Set permissions (won't affect Vercel but good for local)
chmod -R 775 storage bootstrap/cache

echo "Build complete - storage directories created"
