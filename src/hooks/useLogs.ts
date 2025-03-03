import { useEffect, useState } from "react";
import { Log } from "../utils/types";

export interface UseLogsProps {
  url: string;
}

export interface UseLogsReturn {
  logs: Log[];
}

export function useLogs(props: UseLogsProps): UseLogsReturn {
  const { url } = props;
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const worker = new Worker(
      new URL("../utils/log-fetcher/worker.ts", import.meta.url),
    );

    const handleMessage = (event: MessageEvent) => {
      setLogs((prev) => [...prev, ...event.data]);
    };

    worker.addEventListener("message", handleMessage);

    worker.postMessage(url);

    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.terminate();
    };
  }, [url, setLogs]);
  return { logs };
}

export default useLogs;
