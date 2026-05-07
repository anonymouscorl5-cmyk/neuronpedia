#!/bin/bash

set -a
source .env
set +a

# Wait for database to be ready and run database operations at runtime
echo "Skipping runtime Prisma check (handled by db-init)..."
# ./node_modules/.bin/prisma db push

# Start the Next.js application
echo "Starting Next.js application..."
node server.js