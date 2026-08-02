---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Comprehensive design rules with 84 styles, 192 color palettes, 74 font pairings, 192 product types, 98 UX guidelines, 104 icon entries, 16 GSAP motion presets, and 25 chart types. Use when designing, building, or reviewing UI."
inclusion: always
---

# UI/UX Pro Max - Design Intelligence

Comprehensive UI/UX design rules with priority-based recommendations for React Native / Expo projects.

## When to Apply

Use these guidelines when the task involves **UI structure, visual design decisions, interaction patterns, or user experience quality control**: designing new pages, creating/refactoring UI components, choosing color/typography/spacing/layout systems, reviewing UI for UX/accessibility/consistency, implementing navigation/animation/responsive behavior, or improving perceived quality and usability.

Skip for pure backend logic, API/database design, non-visual performance work, infrastructure/DevOps, or non-visual scripts — unless the task changes how something **looks, feels, moves, or is interacted with**.

## Rule Categories by Priority

*Follow priority 1→10 to decide which category to focus on first.*

| Priority | Category | Impact | Key Checks (Must Have) | Anti-Patterns (Avoid) |
|----------|----------|--------|------------------------|------------------------|
| 1 | Accessibility | CRITICAL | Contrast 4.5:1, Alt text, Keyboard nav, Aria-labels | Removing focus rings, Icon-only buttons without labels |
| 2 | Touch & Interaction | CRITICAL | Min size 44×44px, 8px+ spacing, Loading feedback | Reliance on hover only, Instant state changes (0ms) |
| 3 | Performance | HIGH | WebP/AVIF, Lazy loading, Reserve space (CLS < 0.1) | Layout thrashing, Cumulative Layout Shift |
| 4 | Style Selection | HIGH | Match product type, Consistency, SVG icons (no emoji) | Mixing flat & skeuomorphic randomly, Emoji as icons |
| 5 | Layout & Responsive | HIGH | Mobile-first breakpoints, Viewport meta, No horizontal scroll | Horizontal scroll, Fixed px container widths, Disable zoom |
| 6 | Typography & Color | MEDIUM | Base 16px, Line-height 1.5, Semantic color tokens | Text < 12px body, Gray-on-gray, Raw hex in components |
| 7 | Animation | MEDIUM | Duration 150–300ms, Motion conveys meaning, Spatial continuity | Decorative-only animation, Animating width/height, No reduced-motion |
| 8 | Forms & Feedback | MEDIUM | Visible labels, Error near field, Helper text, Progressive disclosure | Placeholder-only label, Errors only at top, Overwhelm upfront |
| 9 | Navigation Patterns | HIGH | Predictable back, Bottom nav ≤5, Deep linking | Overloaded nav, Broken back behavior, No deep links |
| 10 | Charts & Data | LOW | Legends, Tooltips, Accessible colors | Relying on color alone to convey meaning |

---

## React Native / Expo Specific Guidelines

### Touch Targets
- Minimum touch target: **44×44 points** (iOS) / **48×48 dp** (Android)
- Spacing between touchables: minimum **8px**
- Use `hitSlop` prop for small visual elements that need larger touch areas

### Safe Areas
- Always use `useSafeAreaInsets()` from `react-native-safe-area-context`
- Apply top inset to headers, bottom inset to tab bars and action buttons
- Account for notches, home indicators, and status bars

### Platform Consistency
- **Avoid emoji for UI elements** — they render differently per platform
- Use custom styled components or SVG icons for consistent cross-platform appearance
- Text characters (♥, ★, ▶) are more consistent than emoji

### Animation Best Practices
- Use `react-native-reanimated` for performant animations
- Always set `useNativeDriver: true` when possible
- Duration guidelines:
  - Micro-interactions: 150–200ms
  - Page transitions: 250–350ms
  - Complex choreography: 400–600ms
- Support `reduceMotion` accessibility setting

### Typography
- Base font size: **16px minimum** for body text
- Line height: **1.4–1.6** for readability
- Use semantic font weights from theme, not hardcoded values
- Pixel fonts: ensure `fontFamily` is loaded before rendering

### Color System
- Define colors in a central theme file
- Use semantic names (`primary`, `textMain`, `bgDark`) not raw hex in components
- Ensure **4.5:1 contrast ratio** for text
- Dark mode: increase contrast slightly, reduce pure white usage

### Layout
- Use `flex` for layouts, avoid fixed pixel widths
- `gap` property for consistent spacing (requires RN 0.71+)
- Use spacing tokens from theme (`spacing.sm`, `spacing.md`, etc.)
- ScrollView: always set `contentContainerStyle` for proper padding

### Loading States
- Always show loading feedback for async operations
- Use skeleton screens for content loading
- Minimum loading indicator display: 300ms (avoid flash)

### Error Handling
- Display errors near the relevant field/action
- Use clear, actionable error messages
- Provide retry options for network failures
- Never show raw error objects to users

---

## 8-Bit / Retro Style Specific Rules

For pixel art / retro game aesthetic projects like PixelReads:

### Visual Elements
- Use pixel fonts consistently (`PressStart2P`, `VT323`, etc.)
- Sharp edges — avoid `borderRadius` on main containers
- Use ASCII/Unicode decorations (`▓▒░`, `╔══╗`, `►`, `♥`)
- Pixel-perfect shadows: use offset shadows with `shadowRadius: 0`

### Color Palette
- Limit palette to 8-16 colors max (authentic retro feel)
- High contrast neon accents on dark backgrounds
- Consistent glow effects using `shadowColor` with blur

### Animation
- Discrete/stepped animations for authentic 8-bit feel
- Bounce/spring physics for playful interactions
- Floating/pulsing effects for ambient motion
- Typewriter text effects for reveals

### Sound & Haptics
- Use `expo-haptics` for tactile feedback on actions
- Consider 8-bit sound effects for key interactions (optional)

---

## Pre-Delivery Checklist

Before shipping any UI:

1. **Accessibility**
   - [ ] Color contrast meets 4.5:1 for text
   - [ ] All interactive elements have accessible labels
   - [ ] Touch targets are 44×44 minimum

2. **Cross-Platform**
   - [ ] Tested on both iOS and Android
   - [ ] No emoji used as functional UI elements
   - [ ] Safe areas properly handled

3. **Performance**
   - [ ] No layout thrashing (measure before animating)
   - [ ] Images optimized and lazy loaded
   - [ ] Lists use `FlatList` with proper `keyExtractor`

4. **UX Polish**
   - [ ] Loading states for all async operations
   - [ ] Error states with clear messaging
   - [ ] Haptic feedback on key interactions
   - [ ] Consistent spacing using theme tokens

5. **Animation**
   - [ ] All animations use native driver where possible
   - [ ] Duration appropriate for action type
   - [ ] Respects reduce motion preferences
