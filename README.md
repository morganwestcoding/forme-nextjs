# ForMe Monorepo

A service marketplace platform with web and native iOS apps.

## Structure

```
forme/
├── web/          # Next.js web application
├── ios/          # Native iOS app (Swift/SwiftUI)
└── shared/       # Shared API specs & type definitions
    ├── api/      # API endpoint documentation
    └── models/   # Data model definitions
```

## Getting Started

### Web App

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view.

### iOS App

1. Open Xcode
2. Create new iOS project in `ios/` folder (SwiftUI, Swift)
3. Or run: `npm run ios:open`

## Scripts

From the monorepo root:

```bash
# Web development
npm run web:dev      # Start web dev server
npm run web:build    # Build web app
npm run web:start    # Start production server

# iOS
npm run ios:open     # Open Xcode project
```

## Shared Resources

The `shared/` folder contains:
- **api/endpoints.md** - API endpoint documentation
- **models/types.md** - Data model definitions

Both apps connect to the same backend API.

## Deploy

### Web (Vercel)
The web app deploys to Vercel. Update the root directory setting to `web/` in your Vercel project settings.

### iOS (App Store)
Archive and submit through Xcode.
