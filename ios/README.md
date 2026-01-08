# ForMe iOS App

Native iOS app built with Swift and SwiftUI.

## Setup

1. Open Xcode
2. Create a new iOS App project:
   - Product Name: `ForMe`
   - Team: Your Apple Developer Team
   - Organization Identifier: `com.yourcompany`
   - Interface: SwiftUI
   - Language: Swift
3. Save the project in this `ios/` directory

## Project Structure

```
ios/
├── ForMe/
│   ├── App/
│   │   └── ForMeApp.swift
│   ├── Models/
│   ├── Views/
│   ├── ViewModels/
│   ├── Services/
│   │   └── APIService.swift
│   └── Utils/
├── ForMe.xcodeproj
└── README.md
```

## API Integration

The app connects to the same backend API as the web app. See `../shared/api/` for API specifications.

## Running the App

```bash
# From monorepo root
npm run ios:open

# Or directly
open ForMe.xcodeproj
```
