# Inventory Scanner System

A complete inventory scanning solution with iOS app, Firebase backend, and web admin panel.

## Project Structure

```
inventory-scanner/
├── ios/           # SwiftUI iOS App
├── web/           # React Admin Panel
├── firebase/      # Firebase config and security rules
└── README.md
```

## Quick Start

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add an iOS app:
   - Bundle ID: `com.yourcompany.inventoryscanner`
   - Download `GoogleService-Info.plist`
4. Add a web app:
   - Copy the Firebase config object
5. Enable Firestore Database in "Database" section
6. Go to "Firestore Database" → "Rules" and paste the rules from `firebase/firestore.rules`

### 2. iOS App Setup

1. Open `ios/InventoryScanner.xcodeproj` in Xcode
2. Drag your downloaded `GoogleService-Info.plist` into the project
3. Ensure "Copy items if needed" is checked
4. Build and run on a physical device (camera requires device)

### 3. Web Admin Panel Setup

```bash
cd web
npm install
```

Create `.env` file:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

```bash
npm run dev
```

Open http://localhost:5173

## Features

### iOS App
- Barcode/QR code scanning
- Real-time item lookup from Firestore
- Session management with quantity tracking
- CSV export via share sheet
- Offline catalog caching

### Web Admin
- CRUD operations for inventory items
- Real-time sync with Firestore
- Clean, responsive UI

## Security

Default Firestore rules allow read/write for development. Update rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## License

MIT