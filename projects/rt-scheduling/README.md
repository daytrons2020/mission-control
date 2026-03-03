# RT Scheduling PWA

Simple 28-day availability entry for respiratory therapy staff.

## How It Works

1. **Enter your name** and schedule start date
2. **Fill in availability** for all 28 days:
   - Type `6` for 6am shift availability
   - Type `18` for 6pm shift availability
   - Leave blank if not available
3. **Export to Excel** — downloads a file you can copy/paste into your master sheet

## Excel Export Format

| Day | Date | Availability |
|-----|------|--------------|
| Day 1 | Mar 1 | 6 |
| Day 2 | Mar 2 | 18 |
| Day 3 | Mar 3 | |
| ... | ... | ... |

## Install as App

### iPhone (Safari)
1. Open the app in Safari
2. Tap Share button
3. Select "Add to Home Screen"

### Android (Chrome)
1. Open the app in Chrome
2. Tap menu (3 dots)
3. Select "Add to Home screen"

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The `dist` folder contains the production build.

## Data Storage

All data is stored locally on the device. Nothing is sent to any server.

## Deployment

Deploy the `dist` folder to any static hosting:
- Netlify
- Vercel
- Azure Static Web Apps
- GitHub Pages
