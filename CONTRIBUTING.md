# Contributing to PixelReads

```
 ██████╗ ██████╗ ███╗   ██╗████████╗██████╗ ██╗██████╗ ██╗   ██╗████████╗███████╗
██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔══██╗██║██╔══██╗██║   ██║╚══██╔══╝██╔════╝
██║     ██║   ██║██╔██╗ ██║   ██║   ██████╔╝██║██████╔╝██║   ██║   ██║   █████╗  
██║     ██║   ██║██║╚██╗██║   ██║   ██╔══██╗██║██╔══██╗██║   ██║   ██║   ██╔══╝  
╚██████╗╚██████╔╝██║ ╚████║   ██║   ██║  ██║██║██████╔╝╚██████╔╝   ██║   ███████╗
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝    ╚═╝   ╚══════╝
```

First off, thank you for considering contributing to PixelReads! Every contribution helps make this retro book tracker even better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to:

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

```
+------------------------------------------+
|  Bug Report Checklist                    |
+------------------------------------------+
|  [ ] Clear, descriptive title            |
|  [ ] Steps to reproduce                  |
|  [ ] Expected vs actual behavior         |
|  [ ] Screenshots (if applicable)         |
|  [ ] Device/OS information               |
|  [ ] Expo/React Native versions          |
+------------------------------------------+
```

### Suggesting Features

Feature requests are welcome! Please include:

- Clear description of the feature
- Why it would be useful
- Any implementation ideas you have
- Mockups or examples (if applicable)

### Code Contributions

1. Check open issues for tasks labeled `good first issue` or `help wanted`
2. Comment on the issue to claim it
3. Fork and create a feature branch
4. Make your changes
5. Submit a pull request

---

## Development Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/pixelreads.git
cd pixelreads

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/pixelreads.git

# 4. Install dependencies
npm install

# 5. Set up environment
cp .env.example .env
# Add your Google Books API key to .env

# 6. Start development server
npx expo start
```

---

## Style Guidelines

### JavaScript/React Native

```javascript
// Use functional components with hooks
const MyComponent = ({ title, onPress }) => {
  const [state, setState] = useState(null);
  
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

// Use descriptive variable names
const isBookInLibrary = library.some(b => b.id === book.id);

// Prefer const over let
const MAX_RESULTS = 20;

// Use async/await over .then()
const fetchBooks = async (query) => {
  const results = await searchBooks(query);
  return results;
};
```

### File Organization

```
src/
├── components/     # Reusable components (PascalCase)
│   └── PixelButton.js
├── screens/        # Screen components (PascalCase + Screen suffix)
│   └── HomeScreen.js
├── hooks/          # Custom hooks (camelCase with use prefix)
│   └── useDebounce.js
├── utils/          # Utility functions (camelCase)
│   └── logger.js
└── store/          # State management (camelCase + Store suffix)
    └── bookStore.js
```

### 8-Bit UI Guidelines

When adding UI components, follow the retro aesthetic:

```
+------------------------------------------+
|  8-Bit Design Principles                 |
+------------------------------------------+
|  - Use pixel fonts (Press Start 2P)      |
|  - Sharp edges (minimal borderRadius)    |
|  - Neon colors on dark backgrounds       |
|  - ASCII/Unicode decorations             |
|  - Discrete/stepped animations           |
+------------------------------------------+
```

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Format
<type>(<scope>): <description>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Formatting, missing semicolons, etc.
refactor: Code change that neither fixes a bug nor adds a feature
perf:     Performance improvement
test:     Adding tests
chore:    Maintenance tasks

# Examples
feat(search): add author filter to book search
fix(library): resolve duplicate books bug
docs(readme): update installation instructions
style(components): format PixelButton styles
refactor(api): simplify googleBooks error handling
```

---

## Pull Request Process

### Before Submitting

1. **Update your fork:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run checks:**
   ```bash
   npm run lint
   npm test
   ```

3. **Test on both platforms:**
   - iOS Simulator or device
   - Android Emulator or device

### PR Template

When opening a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Added/updated tests

## Screenshots (if applicable)
Before | After
--- | ---
img | img

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
```

### Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Celebrate! You're now a contributor!

---

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

```
+------------------------------------------+
|       Thank you for contributing!        |
|                                          |
|    Every pixel counts in PixelReads!     |
+------------------------------------------+
```
