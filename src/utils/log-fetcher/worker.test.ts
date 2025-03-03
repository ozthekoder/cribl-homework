/* eslint no-restricted-globals: 1 */

import { logBuffer, flushLogs, fetcher } from "./worker";
import { Log } from "../types";

const mockPostMessage = jest.fn();
global.postMessage = mockPostMessage;

describe("Web Worker - LogFetcher", () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode(
              `{"_time": 1724323576596, "message": "Log 1"}\n`,
            ),
          );
          controller.enqueue(
            new TextEncoder().encode(
              `{"_time": 1724323576597, "message": "Log 2"}\n`,
            ),
          );
          controller.close();
        },
      }),
    });

    global.fetch = mockFetch;
    mockPostMessage.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should batch logs before posting to main thread", async () => {
    const testLogs: Log[] = Array.from({ length: 1500 }, (_, i) => ({
      Time: new Date().toISOString(),
      Event: `Log ${i}`,
    }));

    // Simulate logs arriving
    testLogs.forEach((log) => fetcher.onLogs([log]));

    expect(logBuffer.length).toBe(1500); // Logs are buffered, not yet posted
    expect(mockPostMessage).not.toHaveBeenCalled(); // Logs are waiting in buffer

    // Manually trigger flush
    flushLogs();

    expect(mockPostMessage).toHaveBeenCalledTimes(2); // Now correctly called twice
    expect(mockPostMessage.mock.calls[0][0].length).toBe(1000); // First batch
    expect(mockPostMessage.mock.calls[1][0].length).toBe(500); // Second batch
  });

  test("should flush remaining logs when worker stops", async () => {
    const testLogs: Log[] = Array.from({ length: 500 }, (_, i) => ({
      Time: new Date().toISOString(),
      Event: `Log ${i}`,
    }));

    testLogs.forEach((log) => fetcher.onLogs([log]));

    expect(logBuffer.length).toBe(500); // Logs are stored in buffer
    expect(mockPostMessage).not.toHaveBeenCalled();

    // Simulate worker closing
    self.onclose!(new CloseEvent("close"));

    expect(mockPostMessage).toHaveBeenCalledTimes(1);
    expect(mockPostMessage.mock.calls[0][0].length).toBe(500); // All logs sent
  });
});
