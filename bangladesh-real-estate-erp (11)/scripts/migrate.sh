#!/bin/bash
# PostgreSQL migration script for Al Kaswa ERP

set -e

echo "========================================="
echo "   PostgreSQL Migration & Seeding Tool   "
echo "========================================="

# Check environment variables
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set."
  exit 1
fi

echo "Connecting to PostgreSQL instance..."

# Run migrations
echo "Applying core schema definition..."
psql "$DATABASE_URL" -f ./sql/schema.sql

echo "Applying migration scripts..."
for f in ./migrations/*.sql; do
  if [ -f "$f" ]; then
    echo "Applying migration: $f"
    psql "$DATABASE_URL" -f "$f"
  fi
done

echo "✅ PostgreSQL migration completed successfully!"
