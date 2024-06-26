import { getStackTrace } from './getStackTrace.js';

const SYMBOLS = ['      🐁', '    🐁  ', '  🐁    ', '🐁      '];

let debugEnabled = false;

/**
 * Enables or disables debugging messages.
 *
 * @param enabled Whether debugging messages should be logged.
 */
export function setDebug(enabled: boolean) {
  debugEnabled = enabled;
}

/**
 * Gets the current status of debug logging.
 *
 * @returns Whether debugging is enabled.
 */
export function isDebugEnabled(): boolean {
  return debugEnabled;
}

/**
 * Logs a debug message to the console if debugging is enabled.
 *
 * @param msg The message.
 */
export function debug(msg: string) {
  if (debugEnabled) {
    console.log(`⚪ ${msg}`);
  }
}

/**
 * Logs an informative message to the console.
 *
 * @param msg The message.
 */
export function info(msg: string) {
  console.log(`🔵 ${msg}`);
}

/**
 * Logs a success to the console.
 *
 * @param msg The message.
 */
export function success(msg: string) {
  console.log(`✅ ${msg}`);
}

/**
 * Logs a warning message to the console.
 *
 * @param msg The message.
 */
export function warn(msg: string) {
  console.log(`🟡 ${msg}`);
}

/**
 * Logs an error message to the console.
 *
 * @param msg The message.
 */
export function error(msg: string) {
  console.log(`🔴 ${msg}`);
}

export function exitWithError(err: string | Error): never {
  let message: string;
  let stack: string | undefined;

  if (err instanceof Error) {
    message = err.message;
    stack = err.stack;
  } else {
    message = err;
    stack = getStackTrace();
  }

  error(message);
  if (debugEnabled && stack) {
    console.log(stack);
  }
  process.exit(1);
}

/**
 * Shows a loading indicator for a Promise until it resolves.
 *
 * @param comment Comment to display.
 * @param promise The promise to watch.
 * @returns The promise passed in parameter. Useful for decorating without using a buffer variable.
 */
export function loading<T>(comment: string, promise: Promise<T>): Promise<T> {
  if (!process.stdout.isTTY) {
    // Simple stdout without animations
    process.stdout.write(comment);
    promise.then(
      () => process.stdout.write(`   ✓ Success\n`),
      () => process.stdout.write(`   ✗ Failure\n`)
    );

    return promise;
  }

  let symbolPosition = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r${SYMBOLS[symbolPosition]} ${comment}`);
    symbolPosition = (symbolPosition + 1) % 4;
  }, 250);

  promise.then(
    () => {
      clearInterval(interval);
      process.stdout.write(`\r🐭✅     ${comment}\n`);
    },
    () => {
      clearInterval(interval);
      process.stdout.write(`\r🐭🔴     ${comment}\n`);
    }
  );

  return promise;
}
