import { renderHook, act } from "@testing-library/react";
import { useLogs } from "./useLogs";

let originalWorker: typeof Worker;
let mockWorkerInstance: any;

class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(stringUrl: string) {
    mockWorkerInstance = this;
  }

  postMessage(message: any) {
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({
          data: [{ Time: new Date().toISOString(), Event: "Test Log" }],
        } as MessageEvent);
      }
    }, 100);
  }

  addEventListener(event: string, callback: (event: MessageEvent) => void) {
    if (event === "message") {
      this.onmessage = callback;
    }
  }

  removeEventListener() {
    this.onmessage = null;
  }

  terminate() {}
}

describe("useLogs Hook", () => {
  beforeEach(() => {
    originalWorker = global.Worker;
    global.Worker = MockWorker as any;
  });

  afterEach(() => {
    global.Worker = originalWorker;
  });

  test("should initialize with an empty logs array", () => {
    const { result } = renderHook(() => useLogs({ url: "https://example.com/logs" }));
    expect(result.current.logs).toEqual([]);
  });

  test("should update logs when worker sends messages", async () => {
    const { result } = renderHook(() => useLogs({ url: "https://example.com/logs" }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    expect(result.current.logs.length).toBe(1);
    expect(result.current.logs[0].Event).toBe("Test Log");
  });

  test("should update logs when new messages arrive", async () => {
    const { result } = renderHook(() => useLogs({ url: "https://example.com/logs" }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    await act(async () => {
      mockWorkerInstance.onmessage!({
        data: [{ Time: new Date().toISOString(), Event: "Another Log" }],
      } as MessageEvent);
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    expect(result.current.logs.length).toBe(2);
    expect(result.current.logs[1].Event).toBe("Another Log");
  });

  test("should terminate worker on unmount", async () => {
    const mockTerminate = jest.spyOn(MockWorker.prototype, "terminate");

    const { unmount } = renderHook(() => useLogs({ url: "https://example.com/logs" }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    unmount();

    expect(mockTerminate).toHaveBeenCalled();
  });
});
