import { render } from "@testing-library/react";
import { Row } from ".";
import "@testing-library/jest-dom";

describe("Row Component", () => {
  test("should render correctly with default styles", () => {
    const { container } = render(<Row>Test Content</Row>);
    expect(container.firstChild).toHaveStyle({
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      height: "100%",
      width: "100%",
    });
  });

  test("should apply height correctly when passed as a prop", () => {
    const { container } = render(<Row height="50px">Test Content</Row>);
    expect(container.firstChild).toHaveStyle({
      height: "50px",
    });
  });

  test("should render children correctly", () => {
    const { getByText } = render(<Row>Child Element</Row>);
    expect(getByText("Child Element")).toBeInTheDocument();
  });

  test("should match snapshot", () => {
    const { container } = render(<Row height="75px">Snapshot Test</Row>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
