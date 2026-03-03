# RT QR Generator

Generate QR codes for respiratory therapy inventory items.

## QR Code Format

```
RTINV|LAWSON_NUMBER|ITEM_NAME|CATEGORY|PAR_LEVEL
```

Example:
```
RTINV|12345|Ventilator Circuit|Respiratory|10
```

## How to Use

1. **Add items** manually or import from Excel
2. **Generate QR codes** for all items
3. **Print or download** individual QR codes
4. **Attach to inventory** items for scanning

## Excel Import Format

| Lawson Number | Item Name | Category | PAR Level |
|---------------|-----------|----------|-----------|
| 12345 | Ventilator Circuit | Respiratory | 10 |
| 12346 | Nebulizer Tubing | Respiratory | 50 |

## Features

- ✅ Import existing inventory from Excel
- ✅ Generate QR codes in batch
- ✅ Print-friendly layout (2 per page)
- ✅ Download individual QR images
- ✅ Export item list with QR data

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

Deploy the `dist` folder to any static hosting or SharePoint.
