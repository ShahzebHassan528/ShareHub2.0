# Quick Redis Installation for Windows

## Easiest Method: Download Memurai Installer

### Step 1: Download
1. Open browser and go to: **https://www.memurai.com/get-memurai**
2. Click "Download Memurai Developer Edition" (Free)
3. Save the installer file

### Step 2: Install
1. Run the downloaded installer (MemuraiSetup.exe)
2. Click "Next" through the installation wizard
3. Accept the license agreement
4. Click "Install"
5. Wait for installation to complete
6. Click "Finish"

### Step 3: Verify Installation
Open Command Prompt or PowerShell and run:
```bash
memurai-cli ping
```

You should see: `PONG`

### Step 4: Check Service Status
```bash
sc query Memurai
```

Should show: `STATE: 4 RUNNING`

### Step 5: Restart Backend Server
```bash
cd backend
npm start
```

You should now see:
```
✅ Redis Connected
✅ BullMQ Queues initialized
```

## Alternative: Redis via WSL

If you have Windows Subsystem for Linux (WSL):

```bash
# In WSL terminal
sudo apt update
sudo apt install redis-server -y
sudo service redis-server start
redis-cli ping
```

## Troubleshooting

### Memurai service not starting?
```bash
net start Memurai
```

### Port 6379 already in use?
```bash
netstat -ano | findstr :6379
```

### Still having issues?
The backend will work without Redis, but background jobs (email, notifications) won't process. All other features work normally.
