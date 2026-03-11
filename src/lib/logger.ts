/**
 * Development-only logger that no-ops in production builds.
 * Use this instead of raw console.log/warn/error throughout the app.
 */

/* eslint-disable no-console */
export const logger = {
  debug(...args: unknown[]) {
    if (__DEV__) console.log(...args);
  },
  info(...args: unknown[]) {
    if (__DEV__) console.info(...args);
  },
  warn(...args: unknown[]) {
    if (__DEV__) console.warn(...args);
  },
  error(...args: unknown[]) {
    // Errors are always logged — they're critical for debugging
    console.error(...args);
  },
};
