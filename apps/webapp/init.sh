#!/bin/bash

# docker volume mounting masks the file, but env vars are passed by compose anyway
[ -f .env ] && source .env

# Wait for database to be ready and run database operations at runtime
echo "Skipping runtime Prisma check (handled by db-init)..."
# ./node_modules/.bin/prisma db push

# Start the Next.js application
echo "Starting Next.js application in ${NODE_ENV:-production} mode..."
if [ "$NODE_ENV" = "development" ]; then
  npm run dev
else
  node server.js
fi