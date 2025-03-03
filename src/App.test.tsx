/* eslint import/first: 0 */

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("./hooks/useLogs", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    logs: [
      {
        Time: "2024-03-01 12:00:00",
        Event: JSON.stringify({ message: "Log 0" }),
      },
      {
        Time: "2024-03-01 12:01:00",
        Event: JSON.stringify({ message: "Log 1" }),
      },
    ],
  })),
  useLogs: () => ({
    logs: [
      {
        Time: "2024-03-01 12:00:00",
        Event: JSON.stringify({ message: "Log 0" }),
      },
      {
        Time: "2024-03-01 12:01:00",
        Event: JSON.stringify({ message: "Log 1" }),
      },
    ],
  }),
}));

jest.mock("echarts-for-react", () => () => <div data-testid="mock-echarts" />);

import App from "./App";

describe("App Component", () => {
  test("should render without crashing", async () => {
    render(<App />);

    // Ensure the table headers are displayed
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Event")).toBeInTheDocument();

    // Ensure logs are rendered
    expect(screen.getByText("2024-03-01 12:00:00")).toBeInTheDocument();
    expect(screen.getByText("2024-03-01 12:01:00")).toBeInTheDocument();
  });

  test("should update table height on window resize", async () => {
    render(<App />);

    const table = screen.getByTestId("virtualized-container");

    window.innerHeight = 800;

    fireEvent(window, new Event("resize"));

    // Wait for re-render
    await screen.findByRole("table");

    // Ensure table height has been updated
    const computedStyle = window.getComputedStyle(table);
    expect(computedStyle.height).toBe("568px"); // 800 - (200 + 32 from useEffect calculation
  });

  test("should match snapshot", () => {
    const { container } = render(<App />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
