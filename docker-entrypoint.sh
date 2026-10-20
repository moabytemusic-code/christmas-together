#!/bin/sh
set -e

echo "🎄 Christmas Together - Starting container..."

if [ -n "$DATABASE_URL" ]; then
  # Strip query parameters (?schema=public) for pg_isready and psql libpq compatibility
  DB_URL_NO_QUERY=$(echo "$DATABASE_URL" | sed 's/\?.*//')

  echo "⏳ Checking PostgreSQL connection..."
  MAX_RETRIES=30
  RETRY_COUNT=0

  until pg_isready -d "$DB_URL_NO_QUERY" > /dev/null 2>&1 || [ $RETRY_COUNT -ge $MAX_RETRIES ]; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Database not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES). Waiting 2s..."
    sleep 2
  done

  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "⚠️ Warning: Database wait timed out after ${MAX_RETRIES} attempts. Attempting schema setup anyway..."
  else
    echo "✅ PostgreSQL is ready and accepting connections!"
  fi

  # Run idempotent schema initialization
  if [ -f "/app/prisma/init.sql" ]; then
    echo "📦 Ensuring database schema is up-to-date (prisma/init.sql)..."
    psql "$DB_URL_NO_QUERY" -f /app/prisma/init.sql || echo "⚠️ Notice: SQL init finished."
  fi

  # Run seed script (idempotent: seeds admin user & initial exchange if empty)
  if [ -f "/app/prisma/seed.js" ]; then
    echo "🌱 Running seed script..."
    node /app/prisma/seed.js || echo "⚠️ Notice: Seed script finished."
  fi
fi

echo "🚀 Launching Next.js application server..."
exec node server.js
