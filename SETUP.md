# Hotel Booking Application Setup Guide

This guide provides instructions for setting up and running the Hotel Booking Application using either Docker or native installation scripts.

## Architecture

The application consists of three main services:
- **API Service** (Port 8001): FastAPI backend for hotel bookings
- **Agent Service** (Port 8000): AI agent service for chat functionality  
- **Frontend** (Port 3000): React application with Asgardeo authentication

## Prerequisites

### For Docker Setup
- Docker
- Docker Compose

### For Native Setup
- Python 3.11+
- Node.js 16+
- npm
- git
- pip3

## Option 1: Docker Setup (Recommended)

### Quick Start
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Individual Service Management
```bash
# Start specific service
docker-compose up api

# Rebuild and start
docker-compose up --build

# View service logs
docker-compose logs api
docker-compose logs agent
docker-compose logs frontend
```

## Option 2: Native Setup (Without Docker)

### Quick Start
```bash
# Make scripts executable (first time only)
chmod +x start-services.sh stop-services.sh

# Start all services
./start-services.sh

# Stop all services
./stop-services.sh
```

### What the Script Does

The `start-services.sh` script will:

1. **Check Prerequisites**: Verifies Python 3, Node.js, npm, and git are installed
2. **Port Management**: Kills any existing processes on ports 3000, 8000, 8001
3. **API Service Setup**:
   - Creates Python virtual environment in `api/venv`
   - Installs uvicorn and poetry
   - Installs Python dependencies from `requirements.txt`
   - Starts FastAPI server on port 8001
4. **Agent Service Setup**:
   - Creates Python virtual environment in `agent/venv`
   - Installs uvicorn and poetry
   - Clones and builds Asgardeo packages from GitHub
   - Installs Python dependencies from `requirements.txt`
   - Starts FastAPI server on port 8000
5. **Frontend Setup**:
   - Installs npm dependencies
   - Starts React development server on port 3000

### Manual Service Management

#### API Service
```bash
cd api
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install 'uvicorn[standard]' poetry
pip install -r requirements.txt
export PYTHONPATH=$(pwd)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

#### Agent Service
```bash
cd agent
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install 'uvicorn[standard]' poetry

# Install Asgardeo packages
git clone -b sdk https://github.com/shashimalcse/python.git /tmp/python-sdk
cd /tmp/python-sdk/packages/asgardeo
poetry build
cd ../asgardeo-ai
poetry build
pip install --force-reinstall --no-deps /tmp/python-sdk/packages/asgardeo/dist/*.whl /tmp/python-sdk/packages/asgardeo-ai/dist/*.whl

# Return to agent directory and install requirements
cd /path/to/your/project/agent
pip install -r requirements.txt
export PYTHONPATH=$(pwd)
uvicorn app.service:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Accessing the Application

Once services are running, access:
- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8001/docs
- **Agent Service**: http://localhost:8000/docs

## Logs and Monitoring

### Docker
```bash
# View all logs
docker-compose logs

# Follow logs for specific service
docker-compose logs -f api
docker-compose logs -f agent
docker-compose logs -f frontend

# View container status
docker-compose ps
```

### Native Script
```bash
# View logs (created by start-services.sh)
tail -f logs/api.log
tail -f logs/agent.log
tail -f logs/frontend.log

# View all logs
tail -f logs/*.log

# Check running processes
ps aux | grep uvicorn
ps aux | grep node
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :8000
lsof -i :8001

# Kill process on port
kill -9 $(lsof -ti:3000)
```

#### Python Virtual Environment Issues
```bash
# Remove and recreate venv
rm -rf api/venv agent/venv
# Run start-services.sh again
```

#### Asgardeo Package Installation Fails
```bash
# Clear pip cache
pip cache purge

# Remove temp directory
rm -rf /tmp/python-sdk

# Re-run the script
```

#### Frontend Build Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Service Health Checks

#### API Service
```bash
curl http://localhost:8001/docs
```

#### Agent Service  
```bash
curl http://localhost:8000/docs
```

#### Frontend
```bash
curl http://localhost:3000
```

## Development Tips

### Hot Reloading
- All services support hot reloading in development mode
- API and Agent services use `--reload` flag
- Frontend uses React's built-in hot reloading

### Environment Variables
- API service uses `PYTHONPATH` for module resolution
- Frontend uses `REACT_APP_API_URL=http://localhost:8001`
- Customize in the respective startup commands

### Adding New Dependencies

#### Python Services
Add to `requirements.txt` and restart the service

#### Frontend
```bash
cd frontend
npm install <package-name>
# Restart frontend service
```

## Production Considerations

For production deployment:
1. Use Docker with proper environment variables
2. Set up reverse proxy (nginx)
3. Use production-grade WSGI server
4. Configure proper logging
5. Set up monitoring and health checks
6. Use environment-specific configuration files

## Support

If you encounter issues:
1. Check the logs in `logs/` directory (native setup) or docker logs
2. Verify all prerequisites are installed
3. Ensure ports 3000, 8000, 8001 are available
4. Check network connectivity for GitHub cloning (agent service)