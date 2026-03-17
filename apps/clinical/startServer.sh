#!/bin/bash

set -e

# Run the migrations
echo "Running: npm run migrate:latest -- --knexfile migrationsKnexfile.ts" &&
npm run migrate:latest -- --knexfile migrationsKnexfile.ts &&

# Start the server
echo "Running: npm run start" &&
npm run start