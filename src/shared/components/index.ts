/**
 * =========================================================================
 *  Shared Components
 * =========================================================================
 *
 *  Central export for all reusable UI components.
 *  Components follow the PixelReads 8-bit retro design system.
 *
 * =========================================================================
 */

// ─── Pixel UI Components ────────────────────────────────────────────────────
// These are re-exported from the legacy location during migration
export { default as PixelButtonComponent } from '../../components/PixelButton';
export { default as PixelInputComponent } from '../../components/PixelInput';
export { default as PixelCardComponent } from '../../components/PixelCard';
export { default as PixelProgressComponent } from '../../components/PixelProgress';
export { default as PixelDividerComponent } from '../../components/PixelDivider';
export { default as PixelModalComponent } from '../../components/PixelModal';

// ─── Book Components ────────────────────────────────────────────────────────
export { default as BookCoverImageComponent } from '../../components/BookCover';
export { default as BookShelfBadgeComponent } from '../../components/ShelfBadge';

// ─── Rating Components ──────────────────────────────────────────────────────
export { default as StarRatingComponent } from '../../components/StarRating';

// ─── Feedback Components ────────────────────────────────────────────────────
export { default as ToastNotificationComponent } from '../../components/Toast';
export { default as EmptyStateComponent } from '../../components/EmptyState';
export { default as LoadingSpinnerComponent } from '../../components/LoadingSpinner';

// ─── Layout Components ──────────────────────────────────────────────────────
export { default as ScreenHeaderComponent, BackButton as HeaderBackButtonComponent } from '../../components/ScreenHeader';
