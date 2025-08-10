#!/usr/bin/env bash
# Build script for Render deployment

echo "🚀 Starting build process..."

# Install system dependencies for psycopg
echo "🔧 Installing system dependencies..."
apt-get update -qq && apt-get install -y \
    libpq-dev \
    gcc \
    python3-dev

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py makemigrations users chat
python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if needed (optional)
# echo "👤 Creating superuser..."
# python manage.py createsuperuser --noinput

echo "✅ Build completed successfully!" 