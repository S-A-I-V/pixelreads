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
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#api-reference">API</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat-square&logo=expo" alt="Expo SDK 54" />
  <img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
</p>

---

## Features

```
+------------------------------------------+
|  [#] Track your reading progress         |
|  [*] Rate and review books               |
|  [?] Search millions of books            |
|  [!] Beautiful 8-bit retro UI            |
|  [>] Cross-platform (iOS & Android)      |
+------------------------------------------+
```

- **Book Search** - Search Google Books API with millions of titles
- **Personal Library** - Organize books into shelves (Reading, Want to Read, Finished)
- **Reading Progress** - Track pages read with pixel progress bars
- **Ratings & Reviews** - Rate books with retro star ratings
- **8-Bit Aesthetics** - Pixel fonts, neon colors, retro animations
- **Offline Support** - Your library works without internet

---

## Screenshots

> Coming soon...

---

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pixelreads.git
cd pixelreads

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Google Books API key

# Start the development server
npx expo start
```

### Running the App

```bash
# Start Metro bundler
npx expo start

# Then:
# - Scan QR code with Expo Go (Android)
# - Scan QR code with Camera app (iOS)
# - Press 'i' for iOS Simulator
# - Press 'a' for Android Emulator
```

---

## Tech Stack

```
+-----------------------+------------------------+
|  Category             |  Technology            |
+-----------------------+------------------------+
|  Framework            |  React Native + Expo   |
|  Navigation           |  React Navigation 7    |
|  State Management     |  Zustand               |
|  API                  |  Google Books API      |
|  Styling              |  StyleSheet + 8-bit    |
|  Fonts                |  Press Start 2P        |
|  Storage              |  AsyncStorage          |
+-----------------------+------------------------+
```

---

## Project Structure

```
pixelreads/
├── src/
│   ├── api/              # API clients & config
│   │   ├── config.js     # Environment configuration
│   │   ├── googleBooks.js# Google Books API client
│   │   └── index.js      # API exports
│   ├── components/       # Reusable UI components
│   │   ├── PixelButton.js
│   │   ├── PixelCard.js
│   │   ├── StarRating.js
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # App screens
│   │   ├── HomeScreen.js
│   │   ├── SearchScreen.js
│   │   ├── LibraryScreen.js
│   │   └── ...
│   ├── store/            # Zustand state stores
│   ├── theme/            # Colors, typography, spacing
│   └── utils/            # Utility functions & logger
├── assets/               # Images, fonts, icons
├── docs/                 # Documentation
├── .env.example          # Environment template
├── app.json              # Expo configuration
└── package.json
```

---

## API Reference

### Google Books API

This app uses the [Google Books API](https://developers.google.com/books) for book data.

**Get your API key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable "Books API"
4. Create credentials (API Key)
5. Add key to `.env` file

**Rate Limits:**
- With API key: 1,000 requests/day (free tier)
- Without key: 100 requests/day

See [`docs/GOOGLE_BOOKS_API.md`](docs/GOOGLE_BOOKS_API.md) for complete API documentation.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_BOOKS_API_KEY` | No* | Google Books API key |
| `GOOGLE_BOOKS_BASE_URL` | No | API base URL (default provided) |
| `API_TIMEOUT` | No | Request timeout in ms (default: 30000) |
| `API_MAX_RETRIES` | No | Max retry attempts (default: 3) |

*App works without API key but with limited quota (100 req/day)

---

## Scripts

```bash
# Development
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator

# Building
npx expo prebuild      # Generate native projects
npx eas build          # Build with EAS

# Code Quality
npm run lint           # Run ESLint
npm run format         # Run Prettier
npm test               # Run tests
```

---

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

```bash
# Fork the repo, then:
git checkout -b feature/amazing-feature
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature
# Open a Pull Request
```

---

## Logging

PixelReads includes an OpenTelemetry-style logger for debugging API calls:

```
>>>  GET /volumes  q="harry potter"  @17:21:12  #abc123
<<<  200 [OK]  20/300 items  49.5KB  1.73s  #abc123

[?] SEARCH COMPLETE  @17:21:14  #abc123
    Query:   "harry potter"
    Results: 20/300 [##########----------]
    Time:    1.73s
```

---

## Roadmap

- [ ] Social features (friends, recommendations)
- [ ] Reading challenges & achievements
- [ ] Book clubs
- [ ] Barcode scanner for adding books
- [ ] Export/import library
- [ ] Dark/Light theme toggle
- [ ] Widgets for iOS/Android

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Google Books API](https://developers.google.com/books) for book data
- [Expo](https://expo.dev) for the amazing development platform
- [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) font by CodeMan38
- 8-bit UI inspiration from classic video games

---

<p align="center">
  <sub>Built with pixelated love by the PixelReads team</sub>
</p>

```
    ___________
   |  GAME ON  |
   |___________|
   |           |
   | SAVE YOUR |
   |  READING  |
   |  PROGRESS |
   |___________|
      |     |
    __||___||__
```
