# prueba

A modern SaaS application built with NextSpark

## Project Structure

This is a monorepo containing both web and mobile applications:

```
prueba/
├── web/                    # Next.js web application
│   ├── app/                # Next.js App Router
│   ├── contents/           # Themes and plugins
│   └── package.json
├── mobile/                 # Expo mobile application
│   ├── app/                # Expo Router screens
│   ├── src/                # Mobile-specific code
│   └── package.json
├── package.json            # Root monorepo
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- For mobile: Expo CLI (`npm install -g expo-cli`)

### Installation

```bash
# Install all dependencies
pnpm install

# Set up environment variables
cp web/.env.example web/.env
# Edit web/.env with your configuration
```

### Development

**Web Application:**
```bash
# From root directory
pnpm dev

# Or from web directory
cd web && pnpm dev
```

**Mobile Application:**
```bash
# From root directory
pnpm dev:mobile

# Or from mobile directory
cd mobile && pnpm start
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run web tests only
pnpm --filter web test

# Run mobile tests only
pnpm --filter mobile test
```

## Mobile App Configuration

The mobile app connects to your web API. Configure the API URL:

- **Development:** The mobile app will auto-detect your local server
- **Production:** Set `EXPO_PUBLIC_API_URL` in your EAS environment

## Building for Production

**Web:**
```bash
pnpm build
```

**Mobile:**
```bash
cd mobile
eas build --platform ios
eas build --platform android
```

## Learn More

- [NextSpark Documentation](https://nextspark.dev/docs)
- [Expo Documentation](https://docs.expo.dev)
- [Next.js Documentation](https://nextjs.org/docs)
