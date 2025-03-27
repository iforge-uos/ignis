/**
 * Function to sleep and block the execution thread for a given time.
 *
 * @param ms - The amount of milliseconds to sleep for
 * @returns A promise that resolves after the given time
 *
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function exhaustiveGuard(_value: never): never {
  throw new Error(`ERROR! Reached forbidden guard function with unexpected value: ${JSON.stringify(_value)}`);
}
