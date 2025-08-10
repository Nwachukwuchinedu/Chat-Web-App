#!/usr/bin/env bash
# Build script for Render deployment

echo "🚀 Starting build process..."

# Install dependencies
echo "📦 Installing Python dependencies..."
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