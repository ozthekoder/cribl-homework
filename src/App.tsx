import { useState, useEffect } from "react";
import { Log } from "./utils/types";
import { Column } from "./components/Column";
import { Row } from "./components/Row";
import { LogsTable } from "./components/LogsTable";
import { LOGS_URL } from "./utils/constants";
import { useLogs } from "./hooks/useLogs";
import LogsHistogram from "./components/LogsHistogram";

function App() {
  const { logs } = useLogs({ url: LOGS_URL });
  const histogramHeight = 200;
  const columns: (keyof Log)[] = ["Time", "Event"];

  // State to track available height
  const [tableHeight, setTableHeight] = useState(
    window.innerHeight - (histogramHeight + 32),
  );

  useEffect(() => {
    // Function to update height dynamically
    const handleResize = () => {
      setTableHeight(window.innerHeight - (histogramHeight + 32)); // Adjust table height dynamically
    };

    window.addEventListener("resize", handleResize); // Listen to window resize
    return () => window.removeEventListener("resize", handleResize); // Cleanup on unmount
  }, []);

  return (
    <Column>
      <Row height={`${histogramHeight}px`}>
        <LogsHistogram height={`${histogramHeight}px`} logs={logs} />
      </Row>
      <Row height={`calc(100% - ${histogramHeight}px)`}>
        <LogsTable
          rows={logs}
          columns={columns}
          height={tableHeight}
          rowHeight={32}
        />
      </Row>
    </Column>
  );
}

export default App;
