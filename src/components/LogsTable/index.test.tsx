import { render, fireEvent, screen } from "@testing-library/react";
import { LogsTable } from ".";
import { Log } from "../../utils/types";
import "@testing-library/jest-dom";

beforeAll(() => {
  jest.doMock("../../utils/functions", () => ({
    getJsonLineCount: jest.fn(() => 10),
  }));
});

const logs: Log[] = Array.from({ length: 100 }, (_, i) => ({
  Time: `2024-03-01 12:${String(i).padStart(2, "0")}:00`,
  Event: JSON.stringify({ message: `Log ${i}` }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("LogsTable Component", () => {
  test("should render table headers correctly", async () => {
    render(<LogsTable rows={logs} columns={["Time", "Event"]} />);

    // Ensure table headers are displayed
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Event")).toBeInTheDocument();
  });

  test("should render only the visible rows", async () => {
    render(
      <LogsTable
        rows={logs}
        columns={["Time", "Event"]}
        height={320}
        rowHeight={32}
      />,
    );

    // Wait for rows to render
    const renderedRows = await screen.findAllByRole("row");
    expect(renderedRows.length).toBeGreaterThan(0);
    expect(renderedRows.length).toBeLessThan(logs.length); // Not all rows should render
  });

  test("should update visible rows when scrolled", async () => {
    const { getByTestId } = render(
      <LogsTable
        rows={logs}
        columns={["Time", "Event"]}
        height={320}
        rowHeight={32}
      />,
    );

    const container = getByTestId("virtualized-container");

    // Capture the initial set of rendered rows
    let initialRows = screen
      .getAllByRole("row")
      .map((row) => row.dataset.index);
    expect(initialRows.length).toBeGreaterThan(0);

    // Scroll down to trigger row update
    fireEvent.scroll(container, { target: { scrollTop: 100 } });

    // Capture the new set of rendered row indices after scrolling
    let updatedRows = screen
      .getAllByRole("row")
      .map((row) => row.dataset.index);

    // Ensure row indices have changed
    expect(updatedRows).not.toEqual(initialRows);
    expect(updatedRows.length).toBe(initialRows.length); // Number of rows should be the same
  });

  test("should maintain odd/even row coloring when scrolling", async () => {
    render(
      <LogsTable
        rows={logs}
        columns={["Time", "Event"]}
        height={320}
        rowHeight={32}
      />,
    );

    const rowsBeforeScroll = screen.getAllByRole("row");
    const colorsBeforeScroll = rowsBeforeScroll.map(
      (row) => window.getComputedStyle(row).backgroundColor,
    );

    // Scroll down
    fireEvent.scroll(screen.getByTestId("virtualized-container"), {
      target: { scrollTop: 128 },
    });

    const rowsAfterScroll = screen.getAllByRole("row");
    const colorsAfterScroll = rowsAfterScroll.map(
      (row) => window.getComputedStyle(row).backgroundColor,
    );

    // Ensure odd/even colors remain stable
    expect(colorsBeforeScroll).toEqual(colorsAfterScroll);
  });

  test("should match snapshot", () => {
    const { container } = render(
      <LogsTable
        rows={logs}
        columns={["Time", "Event"]}
        height={320}
        rowHeight={32}
      />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
