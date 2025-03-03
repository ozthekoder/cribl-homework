import { render, fireEvent, screen, act } from "@testing-library/react";
import { VirtualizedList } from ".";
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

const RowComponent = ({
  index,
  data,
  expanded,
  rowHeight,
}: {
  index: number;
  data: Log;
  expanded: boolean;
  rowHeight: number;
}) => (
  <div
    data-testid={`row-${index}`}
    data-index={index}
    data-expanded={expanded}
    style={{ height: rowHeight }}
  >
    {data.Time}
  </div>
);

describe("VirtualizedList Component", () => {
  it("should render only the visible rows", async () => {
    render(
      <VirtualizedList
        height={500}
        itemCount={logs.length}
        itemSize={32}
        itemData={logs}
      >
        {RowComponent}
      </VirtualizedList>,
    );

    const renderedRows = await screen.findAllByTestId(/^row-/);
    expect(renderedRows.length).toBeGreaterThan(0);
    expect(renderedRows.length).toBeLessThan(logs.length);
  });

  it("should update visible rows when scrolled", async () => {
    const { getByTestId } = render(
      <VirtualizedList
        height={320}
        itemCount={logs.length}
        itemSize={32}
        itemData={logs}
      >
        {RowComponent}
      </VirtualizedList>,
    );

    const container = getByTestId("virtualized-container");

    let initialRows = screen
      .getAllByTestId(/^row-/)
      .map((row) => row.dataset.index);
    expect(initialRows.length).toBeGreaterThan(0);

    fireEvent.scroll(container, { target: { scrollTop: 64 } });

    let updatedRows = screen
      .getAllByTestId(/^row-/)
      .map((row) => row.dataset.index);

    expect(updatedRows).not.toEqual(initialRows);
    expect(updatedRows.length).toBe(initialRows.length);
  });

  it("should increase height when row is expanded", async () => {
    render(
      <VirtualizedList
        height={500}
        itemCount={logs.length}
        itemSize={32}
        itemData={logs}
      >
        {RowComponent}
      </VirtualizedList>,
    );

    let row = await screen.findByTestId("row-1");

    const initialHeight = parseInt(row.style.height, 10);
    expect(initialHeight).toBe(32);

    fireEvent(
      row,
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      }),
    );

    row = await screen.findByTestId("row-1");

    const expandedHeight = parseInt(row.style.height, 10);
    expect(expandedHeight).toBeGreaterThan(32);
  });

  it("should collapse row when clicked again", async () => {
    render(
      <VirtualizedList
        height={500}
        itemCount={logs.length}
        itemSize={32}
        itemData={logs}
      >
        {RowComponent}
      </VirtualizedList>,
    );

    const row = await screen.findByTestId("row-0");

    fireEvent(
      row,
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      }),
    );

    fireEvent(
      row,
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(row).toHaveAttribute("data-expanded", "false");
    expect(parseInt(row.style.height, 10)).toBe(32);
  });

  it("should match snapshot", () => {
    const { container } = render(
      <VirtualizedList
        height={500}
        itemCount={logs.length}
        itemSize={32}
        itemData={logs}
      >
        {RowComponent}
      </VirtualizedList>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
