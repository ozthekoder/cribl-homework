/* eslint no-restricted-globals: 1 */
import { LogFetcher } from ".";
import { Log } from "../types";

// Buffer for logs before sending to the main thread
export let logBuffer: Log[] = []; // ✅ Now accessible in tests
const flushInterval = 200; // Throttle interval
const batchSize = 1000; // Logs should be sent in fixed-size chunks
let flushTimer: NodeJS.Timeout | null = null;
let isFlushing = false; // Prevent multiple flushes at the same time

export const flushLogs = () => {
  if (isFlushing || logBuffer.length === 0) return;
  isFlushing = true;

  while (logBuffer.length > 0) {
    const logsToSend = logBuffer.splice(0, batchSize);
    postMessage(logsToSend);
  }

  isFlushing = false;

  if (logBuffer.length === 0) {
    stopFlushTimer(); // ✅ Stop the timer if all logs are sent
  }
};
// Start the interval-based log sender (ensures steady pacing)
export const startFlushTimer = () => {
  if (!flushTimer) {
    flushTimer = setInterval(flushLogs, flushInterval);
  }
};

// Stop the interval when no logs remain
export const stopFlushTimer = () => {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
};

// Create a LogFetcher instance and collect logs in the buffer
export const fetcher = new LogFetcher({
  batchSize, // Ensures logs are processed in chunks
  chunkSize: 8 * 1024, // Read in chunks of 8KB
  onLogs: (logs: Log[]) => {
    logBuffer.push(...logs); // ✅ Add logs to buffer

    if (logBuffer.length >= batchSize && !flushTimer) {
      flushLogs(); // ✅ Immediately send first batch
    }

    startFlushTimer(); // ✅ Start interval for remaining logs
  },
});

// Handle incoming messages from the main thread (e.g., start fetching logs)
self.onmessage = (e) => {
  fetcher.fetch(e.data);
};

// Ensure all logs are flushed before the worker stops
self.onclose = () => {
  flushLogs(); // ✅ Send any remaining logs immediately
  stopFlushTimer();
};
