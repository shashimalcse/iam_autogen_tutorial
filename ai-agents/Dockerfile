# Use an official Python runtime as a base image
FROM python:3.11-alpine3.22.1

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    git \
    gcc \
    musl-dev \
    libffi-dev

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install 'uvicorn[standard]'
RUN pip install poetry

# Clone and build asgardeo packages from GitHub (always fresh, no cache)
RUN rm -rf /tmp/python-sdk && \
    git clone -b sdk https://github.com/shashimalcse/python.git /tmp/python-sdk

# Uninstall any existing asgardeo packages and install fresh
RUN pip uninstall -y asgardeo asgardeo-ai || true --no-cache

# Build both packages first
WORKDIR /tmp/python-sdk/packages/asgardeo
RUN poetry build --no-cache

WORKDIR /tmp/python-sdk/packages/asgardeo-ai  
RUN poetry build --no-cache

# Install both packages together to resolve dependencies (no cache)
RUN pip install --force-reinstall --no-cache-dir --no-deps /tmp/python-sdk/packages/asgardeo/dist/*.whl /tmp/python-sdk/packages/asgardeo-ai/dist/*.whl

WORKDIR /app

RUN addgroup -g 10014 choreo && \
    adduser  --disabled-password  --no-create-home --uid 10014 --ingroup choreo choreouser


# Install remaining requirements
RUN pip install -r requirements.txt

# Copy project files
COPY . .

# Switch to the new user
USER 10014

# Expose port (change if needed)
EXPOSE 8000

# Run the application (adjust as needed)
CMD ["uvicorn", "app.service:app", "--host", "0.0.0.0", "--port", "8000"]

 
