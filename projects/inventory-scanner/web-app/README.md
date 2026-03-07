# Inventory Scanner - Web App

A Progressive Web App (PWA) for scanning inventory items with barcode/QR support. Works on iPhone Safari and all modern mobile browsers.

## Features

- **Barcode/QR Scanning** - Uses device camera to scan codes
- **Session Management** - Start named scanning sessions
- **Quantity Tracking** - Set quantities for each scanned item
- **CSV Export** - Download inventory as Excel-compatible CSV
- **Item Catalog** - Built-in admin panel to manage items
- **Offline Support** - Works without internet (data stored locally)
- **Add to Home Screen** - Install as a native-like app on iPhone

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/daytrons/.openclaw/workspace/projects/inventory-scanner/web-app
npm install
```

### 2. Run the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Access on Your iPhone

Since the app needs camera access, you have two options:

**Option A: Same WiFi Network**
1. Make sure your iPhone and Mac are on the same WiFi
2. Find your Mac's IP address: `System Settings > Network`
3. On your iPhone, open Safari and go to `http://YOUR-MAC-IP:5173`

**Option B: Localhost Tunnel (ngrok)**
```bash
# Install ngrok if you don't have it
brew install ngrok

# Create a tunnel
ngrok http 5173

# Open the https URL on your iPhone
```

### 4. Add to Home Screen (iPhone)

1. Open the app in Safari
2. Tap the **Share** button
3. Scroll down and tap **"Add to Home Screen"**
4. The app now opens full-screen like a native app

## How to Use

### Scanning Items
1. Tap **"Start New Session"** and name it (e.g., "Warehouse A - Jan 15")
2. Tap the **blue barcode button** (bottom right)
3. Allow camera access when prompted
4. Point camera at a barcode or QR code
5. Enter quantity and tap **"Add to Session"**
6. Repeat for more items

### Managing the Session
- View all scanned items in the list
- Tap **edit** (pencil) to change name or quantity
- Tap **trash** to remove an item
- Tap **"Export CSV"** to download for Excel

### Managing Items (Admin)
1. Tap the **"Admin"** tab
2. Add new items with SKU, name, and category
3. Search and edit existing items
4. Items are saved locally and persist between sessions

## Data Storage

- **Sessions** - Stored in browser localStorage
- **Item Catalog** - Stored in browser localStorage
- **No cloud required** - Everything works offline

To connect to Firebase (optional, for cloud sync), see the iOS app README in the parent directory.

## Building for Production

```bash
npm run build
```

The `dist/` folder will contain the production build. You can deploy this to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting

## Camera Permissions

The app requires camera access for scanning. On iPhone:
- Safari will prompt for permission on first scan
- If denied, go to **Settings > Safari > Camera** and allow

## Troubleshooting

**Camera not working?**
- Make sure you're using HTTPS or localhost (required for camera access)
- Check Safari camera permissions in iPhone Settings
- Try refreshing the page

**App not installing to home screen?**
- Must be served over HTTPS (not HTTP)
- Use ngrok or deploy to get HTTPS

**Items not saving?**
- Check that localStorage isn't disabled in browser settings
- Safari Private Mode may block localStorage
