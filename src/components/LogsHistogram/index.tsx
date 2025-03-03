import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Log } from "../../utils/types";

interface LogsHistogramProps {
  height: string;
  logs: Log[];
}

export const LogsHistogram: React.FC<LogsHistogramProps> = ({ logs, height }) => {
  // Process logs into a histogram data format
  const histogramData = useMemo(() => {
    const timeBuckets: Record<string, number> = {};

    logs.forEach((log) => {
      const timeBucket = log.Time.slice(0, 10); // Group by day (YYYY-MM-DD)

      timeBuckets[timeBucket] = (timeBuckets[timeBucket] || 0) + 1;
    });

    // Convert the object into arrays sorted by time
    return Object.entries(timeBuckets).map(([time, count]) => ({
      time,
      count,
    }));
  }, [logs]);

  // Define ECharts options
  const options = useMemo(() => {
    return {
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: histogramData.map((d) => d.time),
        axisLabel: {
          rotate: 45,
          formatter: (value: string) => value.replace("T", " "),
        }, // Format time for readability
      },
      yAxis: { type: "value" },
      series: [
        {
          name: "Log Count",
          type: "bar",
          data: histogramData.map((d) => d.count),
          barWidth: "90%",
        },
      ],
      grid: {
        left: "1%",
        right: "1%",
        bottom: "1%",
        top: "5%",
        containLabel: true,
      },
    };
  }, [histogramData]);

  return (
    <ReactECharts option={options} style={{ height, width: "100%" }} />
  );
};

export default LogsHistogram;
