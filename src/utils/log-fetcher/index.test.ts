import { LogFetcher } from "../log-fetcher"; // Adjust path if needed

global.fetch = jest.fn();

describe("LogFetcher", () => {
  let mockOnLogs: jest.Mock;
  let logFetcher: LogFetcher;

  beforeEach(() => {
    mockOnLogs = jest.fn();
    logFetcher = new LogFetcher({
      onLogs: mockOnLogs,
      batchSize: 3,
      chunkSize: 16, // Small chunk size for testing
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("processLine correctly extracts timestamp", () => {
    const logLine = `{"_time": 1724323576596, "level": "info", "message": "Shutdown complete"}`;
    const processedLog = LogFetcher.processLine(logLine);

    expect(processedLog).toEqual({
      Time: new Date(1724323576596).toISOString(),
      Event: logLine,
    });
  });

  it("processLine handles malformed JSON gracefully", () => {
    const invalidLine = "INVALID JSON DATA";
    const processedLog = LogFetcher.processLine(invalidLine);

    expect(processedLog.Time).toBeDefined();
    expect(processedLog.Event).toBe(invalidLine);
  });

  it("fetch processes and batches logs correctly", async () => {
    const logs = [
      '{"_time": 1724323576596, "message": "Log 1"}\n',
      '{"_time": 1724323576597, "message": "Log 2"}\n',
      '{"_time": 1724323576598, "message": "Log 3"}\n',
      '{"_time": 1724323576599, "message": "Log 4"}\n',
    ];

    const encoder = new TextEncoder();
    const logChunks = logs.map((log) => encoder.encode(log)); // Convert logs to Uint8Array chunks
    const mockReadableStream = new ReadableStream({
      start(controller) {
        logChunks.forEach((chunk) => controller.enqueue(chunk)); // Enqueue each log chunk
        controller.close(); // Close the stream
      },
    });

    const mockResponse = {
      ok: true,
      body: mockReadableStream,
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await logFetcher.fetch("https://example.com/logs");

    // Expect `onLogs` to have been called with batches of size 3 (batchSize = 3)
    expect(mockOnLogs).toHaveBeenCalledTimes(2);
    expect(mockOnLogs.mock.calls[0][0].length).toBe(3); // First batch
    expect(mockOnLogs.mock.calls[1][0].length).toBe(1); // Remaining logs
  });
  it("fetch handles network errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    await expect(logFetcher.fetch("https://example.com/logs")).rejects.toThrow(
      "Network error",
    );

    expect(mockOnLogs).not.toHaveBeenCalled();
  });

  it("flushBatch correctly sends and clears logs", () => {
    logFetcher["logBatch"] = [
      { Time: new Date().toISOString(), Event: "Test Log 1" },
      { Time: new Date().toISOString(), Event: "Test Log 2" },
    ];

    logFetcher["flushBatch"]();

    expect(mockOnLogs).toHaveBeenCalledWith([
      { Time: expect.any(String), Event: "Test Log 1" },
      { Time: expect.any(String), Event: "Test Log 2" },
    ]);
    expect(logFetcher["logBatch"]).toEqual([]); // Log batch should be cleared
  });
});
