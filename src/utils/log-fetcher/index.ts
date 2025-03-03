import { Log } from "../types";

export interface LogFetcherProps {
  onLogs: (logs: Log[]) => void; // Send logs in batch
  batchSize?: number; // Configurable batch size
  chunkSize?: number; // Configurable chunk size (default: 16KB)
}

export class LogFetcher {
  public onLogs: (logs: Log[]) => void;
  private batchSize: number;
  private chunkSize: number;
  private logBatch: Log[] = [];

  public constructor(props: LogFetcherProps) {
    this.onLogs = props.onLogs;
    this.batchSize = props.batchSize ?? 10; // Default batch size
    this.chunkSize = props.chunkSize ?? 16 * 1024; // Default 16KB
  }

  public setOnLogs(onLogs: (logs: Log[]) => void) {
    this.onLogs = onLogs;
  }

  public async fetch(url: string) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    } else if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let leftover = ""; // Store partial lines between chunks
      let buffer = new Uint8Array(this.chunkSize); // Buffer to store limited chunk data
      let bufferOffset = 0; // Tracks how much of the buffer is filled

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        let start = 0;
        while (start < value.byteLength) {
          // Determine how much we can take from `value`
          let bytesToCopy = Math.min(
            this.chunkSize - bufferOffset,
            value.byteLength - start,
          );

          // Copy chunk data into buffer
          buffer.set(value.subarray(start, start + bytesToCopy), bufferOffset);
          bufferOffset += bytesToCopy;
          start += bytesToCopy;

          // If buffer is full, process the chunk
          if (bufferOffset === this.chunkSize) {
            let textChunk = decoder.decode(buffer, { stream: true });

            let combinedText = leftover + textChunk;
            let linesReceived = combinedText.split("\n");

            leftover = linesReceived.pop() || ""; // Retain last partial line
            this.processLines(linesReceived);

            bufferOffset = 0; // Reset buffer for next chunk
          }
        }
      }

      // Process remaining data in the buffer
      if (bufferOffset > 0) {
        let textChunk = decoder.decode(buffer.subarray(0, bufferOffset), {
          stream: true,
        });
        let combinedText = leftover + textChunk;
        let linesReceived = combinedText.split("\n");

        leftover = linesReceived.pop() || "";
        this.processLines(linesReceived);
      }

      // Send any final leftover lines
      if (leftover) {
        this.logBatch.push(LogFetcher.processLine(leftover));
      }

      this.flushBatch(); // Ensure last batch is sent
    }
  }

  private processLines(lines: string[]) {
    for (let line of lines) {
      this.logBatch.push(LogFetcher.processLine(line));

      // Send batch if limit is reached
      if (this.logBatch.length >= this.batchSize) {
        this.flushBatch();
      }
    }
  }

  private flushBatch() {
    if (this.logBatch.length > 0) {
      this.onLogs([...this.logBatch]); // Send batch
      this.logBatch = []; // Clear batch
    }
  }

  public static processLine(line: string): Log {
    try {
      const json = JSON.parse(line);
      return { Time: new Date(json._time).toISOString(), Event: line };
    } catch (e) {
      return { Time: new Date().toISOString(), Event: line };
    }
  }
}
