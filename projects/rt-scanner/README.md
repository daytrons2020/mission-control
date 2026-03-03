# RT Scanner PWA

QR code scanner for respiratory therapy inventory management.

## QR Code Format

QR codes must follow this format:
```
RTINV|LAWSON_NUMBER|ITEM_NAME|CATEGORY|PAR_LEVEL
```

Example:
```
RTINV|12345|Ventilator Circuit|Respiratory|10
```

## How It Works

1. **Tap "Start Scanning"** — camera opens
2. **Point at QR code** — auto-detects and scans
3. **Select action:**
   - **Add Stock** — receiving inventory
   - **Remove Stock** — used/consumed
   - **Physical Count** — actual inventory count
   - **Add to Order** — needs to be ordered
4. **Enter quantity** when prompted
5. **Export to Excel** — downloads transactions + order list

## Excel Export Format

### Sheet 1: Transactions
| Lawson Number | Item Name | Category | PAR Level | Action | Quantity | Date/Time | Notes |

### Sheet 2: Order List
| Lawson Number | Item Name | Category | PAR Level | Quantity to Order | Date Added |

## Install as App

### iPhone (Safari)
1. Open the app in Safari
2. Tap Share button
3. Select "Add to Home Screen"

### Android (Chrome)
1. Open the app in Chrome
2. Tap menu (3 dots)
3. Select "Add to Home screen"

## Camera Permissions

The app requires camera access to scan QR codes.

**If denied:**
- iPhone: Settings → Safari → Camera → Allow
- Android: Chrome → Settings → Site Settings → Camera → Allow

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

Deploy the `dist` folder to:
- Netlify
- Vercel
- Azure Static Web Apps
- GitHub Pages
- **SharePoint** (upload files to document library)

## Data Storage

All scan records are stored locally on the device. Nothing is sent to any server.

## SharePoint Deployment

1. Build: `npm run build`
2. Upload contents of `dist/` folder to SharePoint document library
3. Share the link to `index.html`
4. Staff can add to home screen for app-like experience
