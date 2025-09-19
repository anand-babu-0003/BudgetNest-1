/**
 * Console utilities to suppress common warnings during development
 */

// Store original console methods
const originalWarn = console.warn;
const originalError = console.error;

// List of warnings to suppress
const suppressedWarnings = [
  'shadow*" style props are deprecated',
  'props.pointerEvents is deprecated',
  'Cannot record touch end without a touch start',
  'Download the React DevTools',
];

/**
 * Initialize console filtering to suppress known non-critical warnings
 */
export const initConsoleFiltering = () => {
  // Filter console.warn
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    const shouldSuppress = suppressedWarnings.some(warning => 
      message.includes(warning)
    );
    
    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };

  // Keep errors as they are - don't suppress actual errors
  console.error = (...args: any[]) => {
    originalError.apply(console, args);
  };
};

/**
 * Restore original console methods
 */
export const restoreConsole = () => {
  console.warn = originalWarn;
  console.error = originalError;
};