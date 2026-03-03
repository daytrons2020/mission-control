# RT Admin PWA

A Progressive Web App for respiratory therapy administrators to manage staff, generate schedules, and analyze staffing metrics.

## Features

- **Staff Roster Management**: Add, edit, activate/deactivate staff members
- **Schedule Builder**: Manual schedule creation and editing
- **Auto-Balancer**: Weighted constraint satisfaction for schedule optimization
- **Availability Import**: Import availability from Scheduling PWA exports
- **Excel Export**: Export schedules to Excel format
- **Dashboard**: Staffing metrics and visualizations
- **Offline Support**: Works offline with local storage
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- React 18
- TypeScript
- Vite
- PWA (Vite Plugin PWA)
- ExcelJS
- date-fns
- Lucide React

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

The `dist` folder contains the production build. Deploy to any static hosting service.

## PWA Installation

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (3 dots)
3. Select "Add to Home screen"

### iPhone (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

## Import/Export

### Import Availability
Import JSON files exported from the RT Scheduling PWA to see staff availability when building schedules.

### Export to Excel
Export the complete schedule, staff list, and availability data to an Excel workbook with multiple sheets.

## Schedule Constraints

Configure scheduling constraints:
- Minimum staff per shift
- Maximum consecutive days
- Minimum rest between shifts
- Weekend rotation
- Holiday rotation

## Balancer Weights

Adjust the auto-balancer algorithm weights:
- Availability Weight (0.4): Prioritize staff availability
- Preference Weight (0.3): Respect shift preferences
- Fairness Weight (0.2): Distribute shifts evenly
- Seniority Weight (0.1): Consider staff seniority

## Dashboard Metrics

- Total/Active Staff
- Shifts This Week
- Coverage Percentage
- Overtime Alerts
- Shift Distribution
- Staff Hours

## License

MIT
