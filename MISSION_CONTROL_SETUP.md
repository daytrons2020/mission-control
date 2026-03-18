# Mission Control - Remote Access Setup

## Quick Start (After Tailscale Setup)

```bash
cd ~/.openclaw/workspace/mission-control-repo
./start-mission-control.sh
```

## Access URLs

| Location | URL |
|----------|-----|
| **Local** | http://localhost:8080/dashboard.html |
| **Remote (iPhone/iPad)** | http://YOUR_TAILSCALE_IP:8080/dashboard.html |

## One-Time Setup Steps

### 1. Install & Start Tailscale

```bash
# Install (already done)
brew install tailscale

# Start daemon
sudo tailscaled install

# Connect to network
sudo tailscale up
```

### 2. Get Your IP

```bash
tailscale ip -4
# Returns: 100.x.x.x
```

### 3. Install Tailscale on Your Phone

- iPhone: Download "Tailscale" app from App Store
- Sign in with same account as Mac
- Done!

## What You Get

✅ **Real-time data** - Updates every 30 seconds
✅ **Local access** - Works on your Mac instantly
✅ **Remote access** - View from iPhone/iPad anywhere
✅ **Secure** - Tailscale encryption, no port forwarding
✅ **Low resource** - ~150MB RAM, ~5% CPU

## Troubleshooting

**Can't access from phone?**
- Make sure both devices show "Connected" in Tailscale app
- Check firewall: `sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/tailscaled`

**Data not updating?**
- Check: `ps aux | grep real-tracker`
- Restart: `./start-mission-control.sh`
