/**
 * =========================================================================
 *  Auth Feature Constants
 * =========================================================================
 *
 *  Authentication-specific constants including validation rules,
 *  allowed users, and form configuration.
 *
 * =========================================================================
 */

/**
 * Allowed email for demo/development authentication
 * In production, this would be replaced with proper authentication
 */
export const AUTH_ALLOWED_USER_EMAIL = 'saideep.verma01@gmail.com';

/**
 * Regex pattern for basic email validation
 */
export const AUTH_EMAIL_VALIDATION_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Error message for invalid email format
 */
export const AUTH_ERROR_MESSAGE_INVALID_EMAIL = 'Please enter a valid email';

/**
 * Error message for unauthorized user
 */
export const AUTH_ERROR_MESSAGE_UNAUTHORIZED_USER = 'Email not authorized for access';

/**
 * Placeholder text for email input
 */
export const AUTH_INPUT_PLACEHOLDER_EMAIL = 'you@example.com';

/**
 * Label text for email input
 */
export const AUTH_INPUT_LABEL_EMAIL = 'Email';

/**
 * Text for login button
 */
export const AUTH_BUTTON_LABEL_LOGIN = 'Login';

/**
 * Text for logout button
 */
export const AUTH_BUTTON_LABEL_LOGOUT = 'Logout';

/**
 * App name displayed on login screen
 */
export const AUTH_SCREEN_TITLE_APP_NAME = 'PixelReads';

/**
 * Tagline displayed on login screen
 */
export const AUTH_SCREEN_TAGLINE = 'Track your reading journey';

/**
 * Confirm dialog title for logout
 */
export const AUTH_DIALOG_TITLE_LOGOUT_CONFIRM = 'Logout?';

/**
 * Confirm dialog message for logout
 */
export const AUTH_DIALOG_MESSAGE_LOGOUT_CONFIRM = 'Your library is saved locally.';

/**
 * Cancel button text in dialogs
 */
export const AUTH_DIALOG_BUTTON_CANCEL = 'Cancel';

/**
 * Confirm logout button text
 */
export const AUTH_DIALOG_BUTTON_CONFIRM_LOGOUT = 'Logout';
