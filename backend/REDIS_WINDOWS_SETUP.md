# Redis Setup for Windows

## Option 1: Memurai (Recommended - Native Windows Redis)

Memurai is a Redis-compatible server for Windows.

### Installation Steps:

1. **Download Memurai**:
   - Visit: https://www.memurai.com/get-memurai
   - Download Memurai Developer Edition (Free)

2. **Install**:
   - Run the installer
   - Follow installation wizard
   - Memurai will install as a Windows Service

3. **Verify Installation**:
   ```bash
   memurai-cli ping
   # Should return: PONG
   ```

4. **Start/Stop Service**:
   ```bash
   # Start
   net start Memurai
   
   # Stop
   net stop Memurai
   
   # Check status
   sc query Memurai
   ```

## Option 2: Redis via WSL (Windows Subsystem for Linux)

### Installation Steps:

1. **Enable WSL**:
   ```powershell
   wsl --install
   ```

2. **Install Redis in WSL**:
   ```bash
   sudo apt update
   sudo apt install redis-server
   ```

3. **Start Redis**:
   ```bash
   sudo service redis-server start
   ```

4. **Test Connection**:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

## Option 3: Docker (If you have Docker Desktop)

```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

## Verify Backend Connection

After installing Redis, restart your backend server:

```bash
cd backend
npm start
```

You should see:
```
✅ Redis Connected
✅ BullMQ Queues initialized
```

## Configuration

Backend is already configured in `.env`:
```
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_TTL=300
```

## Quick Test

```bash
# Test Redis connection
redis-cli ping

# Check if Redis is listening
netstat -an | findstr 6379
```
