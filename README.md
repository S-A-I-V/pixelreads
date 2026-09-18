```
██████╗ ██╗██╗  ██╗███████╗██╗     ██████╗ ███████╗ █████╗ ██████╗ ███████╗
██╔══██╗██║╚██╗██╔╝██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝
██████╔╝██║ ╚███╔╝ █████╗  ██║     ██████╔╝█████╗  ███████║██║  ██║███████╗
██╔═══╝ ██║ ██╔██╗ ██╔══╝  ██║     ██╔══██╗██╔══╝  ██╔══██║██║  ██║╚════██║
██║     ██║██╔╝ ██╗███████╗███████╗██║  ██║███████╗██║  ██║██████╔╝███████║
╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝
```

<p align="center">
  <strong>A retro 8-bit book tracking app built with React Native & Expo</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat-square&logo=expo" alt="Expo SDK 54" />
  <img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%26%20Storage-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
</p>

---

## Features

- **Book Search** — Search millions of titles via the Google Books API
- **Personal Library** — Organize books into shelves (Reading, Want to Read, Finished)
- **ePub Reader** — Read ePub books directly in the app with highlights and bookmarks
- **Reading Progress** — Track pages read with retro pixel progress bars
- **Authentication** — Sign in with Supabase auth, sync your library across devices
- **Cloud Sync** — Library data backed by Supabase for persistence
- **8-Bit Aesthetics** — Pixel fonts, neon colors, retro animations, and haptic feedback
- **Cross-Platform** — Runs on both iOS and Android

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- [Expo Go](https://expo.dev/go) on your phone, or iOS Simulator / Android Emulator

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/pixelreads.git
cd pixelreads

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Google Books API key (optional — works without one at reduced quota)

# Start the dev server
npx expo start
```

Scan the QR code with Expo Go, or press `i` / `a` to open in a simulator.

---

## Tech Stack

| Category           | Technology                          |
| ------------------ | ----------------------------------- |
| Framework          | React Native 0.81 + Expo SDK 54    |
| Navigation         | React Navigation 6 (native-stack)  |
| State Management   | Zustand                             |
| Backend / Auth     | Supabase (auth, storage, database)  |
| Book Data          | Google Books API                    |
| ePub Reader        | @epubjs-react-native                |
| Animations         | react-native-reanimated             |
| Styling            | StyleSheet + custom 8-bit theme     |
| Fonts              | Press Start 2P, VT323              |

---

## Environment Variables

| Variable                          | Required | Description                              |
| --------------------------------- | -------- | ---------------------------------------- |
| `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY`| No       | Google Books API key (100 req/day without)|

The app ships with a built-in API key for development. For production, set your own key via EAS secrets or the `EXPO_PUBLIC_` env var prefix.

See [`docs/GOOGLE_BOOKS_API.md`](docs/GOOGLE_BOOKS_API.md) for full API docs and rate limits.

---

## Scripts

```bash
npm start              # Start Expo dev server
npm run start:clear    # Start with cache cleared
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run lint           # Run ESLint
npm run lint:fix       # Auto-fix lint issues
npm run format         # Format code with Prettier
npm run clean          # Nuke node_modules and reinstall
```

---

## Contributing

Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT — see [LICENSE](LICENSE).
