FROM python:3.11-slim

WORKDIR /app

# Copy requirements from the backend/api directory
COPY backend/api/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend/api directory into the container
COPY backend/api .

# Expose the port (Render provides the PORT environment variable)
EXPOSE 8000

# Start FastAPI using Uvicorn
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
