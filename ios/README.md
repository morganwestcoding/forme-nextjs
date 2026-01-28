# ForMe iOS App

Native iOS app built with Swift and SwiftUI.

## Requirements

- macOS 13.0+
- Xcode 15.0+ (download from Mac App Store)
- iOS 17.0+ deployment target

## Setup

1. **Install Xcode** from the Mac App Store (if not installed)

2. **Create Xcode Project:**
   - Open Xcode
   - File → New → Project
   - Select "App" under iOS
   - Configure:
     - Product Name: `ForMe`
     - Team: Your Apple Developer Team (or Personal Team for testing)
     - Organization Identifier: `com.yourcompany`
     - Interface: SwiftUI
     - Language: Swift
   - Save in this `ios/` directory (replace the ForMe folder or merge)

3. **Add Existing Files:**
   - In Xcode, right-click on the ForMe folder in the navigator
   - Select "Add Files to ForMe..."
   - Select all files from `ForMe/` subdirectories (App, Models, Views, ViewModels, Services)
   - Make sure "Copy items if needed" is unchecked
   - Make sure "Create groups" is selected

4. **Configure API URL:**
   - Open `Services/APIService.swift`
   - Update the `baseURL` for production when ready

## Project Structure

```
ios/
├── ForMe/
│   ├── App/                    # App entry point and state
│   │   ├── ForMeApp.swift
│   │   ├── ContentView.swift
│   │   ├── AppState.swift
│   │   └── MainTabView.swift
│   ├── Models/                 # Data models (matching web Prisma schema)
│   │   ├── User.swift
│   │   ├── Listing.swift
│   │   ├── Service.swift
│   │   ├── Reservation.swift
│   │   ├── Employee.swift
│   │   ├── Message.swift
│   │   ├── Post.swift
│   │   └── StoreHours.swift
│   ├── Views/                  # SwiftUI views
│   │   ├── Auth/
│   │   ├── Home/
│   │   ├── Listings/
│   │   ├── Booking/
│   │   ├── Messages/
│   │   └── Profile/
│   ├── ViewModels/             # View models (MVVM pattern)
│   ├── Services/               # API and utility services
│   │   ├── APIService.swift
│   │   └── KeychainService.swift
│   ├── Assets.xcassets/        # App icons and colors
│   └── Info.plist
└── README.md
```

## Features

- **Authentication**: Login, register, password reset
- **Home**: Browse categories, featured listings
- **Search**: Filter by category, search services
- **Listings**: View details, services, employees, hours
- **Booking**: Date/time selection, employee preference, notes
- **Messages**: Conversation list, real-time chat
- **Profile**: Edit profile, settings, logout

## Running the App

1. Open `ForMe.xcodeproj` in Xcode
2. Select a simulator (iPhone 15 Pro recommended)
3. Press ⌘+R or click the Play button
4. For device testing, connect your iPhone and select it as the target

## Backend Connection

The app connects to the Next.js backend. Make sure the web server is running:

```bash
# From web/ directory
npm run dev
```

For iOS Simulator, the API uses `http://localhost:3000/api`.

## Troubleshooting

**"No such module" errors:**
- Clean build: ⇧⌘K
- Rebuild: ⌘B

**Network requests failing:**
- Ensure the backend is running on port 3000
- Check Info.plist has `NSAllowsLocalNetworking` set to true

**Simulator issues:**
- Device → Erase All Content and Settings
- Restart Xcode
