# Docker Setup for Task Manager

This guide explains how to run the Task Manager application using Docker and Docker Compose.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

## Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/prakashshahi1234/Saas-App.git
   cd saas-app
   ```

2. **Set up environment variables**:
   Create `.env` files in both `frontend/` and `backend/` directories with your configuration.

3. **Build and run the application**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Docker Commands

### Build and start all services
```bash
docker-compose up --build
```

### Start services in background
```bash
docker-compose up -d --build
```

### Stop all services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f
```

### Rebuild a specific service
```bash
docker-compose build frontend
docker-compose build backend
```

### Restart a specific service
```bash
docker-compose restart frontend
docker-compose restart backend
```

## Environment Variables

### Backend Environment Variables
for local default env variable are already in docker compose.
```


```

## Development Mode

For development with hot reloading, you can modify the docker-compose.yml:

```yaml
# For backend development
backend:
  command: npm run dev
  volumes:
    - ./backend:/app
    - /app/node_modules

# For frontend development
frontend:
  command: npm run dev
  volumes:
    - ./frontend:/app
    - /app/node_modules
    - /app/.next
```

## Troubleshooting

### Port conflicts
If ports 3000 or 5000 are already in use, modify the ports in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Frontend on port 3001
  - "5001:5000"  # Backend on port 5001
```

### Permission issues
If you encounter permission issues on Linux/Mac:
```bash
sudo docker-compose up --build
```

### Clean up Docker resources
```bash
# Remove all containers, networks, and volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a
```

### Health checks
The services include health checks. You can monitor them:
```bash
docker-compose ps
```

## Production Deployment

For production deployment, consider:

1. **Using a reverse proxy** (nginx) in front of the services
2. **Setting up SSL/TLS certificates**
3. **Using environment-specific docker-compose files**
4. **Implementing proper logging and monitoring**
5. **Setting up database persistence**

## File Structure

```
saas-app/
├── docker-compose.yml          # Main compose file
├── backend/
│   ├── Dockerfile             # Backend container definition
│   └── .dockerignore          # Backend ignore file
├── frontend/
│   ├── Dockerfile             # Frontend container definition
│   └── .dockerignore          # Frontend ignore file
└── DOCKER_README.md           # This file
```

