import { render } from "@testing-library/react";
import { Column } from ".";
import "@testing-library/jest-dom";

describe("Column Component", () => {
  test("should render correctly with default styles", () => {
    const { container } = render(<Column>Test Content</Column>);
    expect(container.firstChild).toHaveStyle({
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      width: "100%",
    });
  });

  test("should apply width correctly when passed as a prop", () => {
    const { container } = render(<Column width="200px">Test Content</Column>);
    expect(container.firstChild).toHaveStyle({
      width: "200px",
    });
  });

  test("should render children correctly", () => {
    const { getByText } = render(<Column>Child Element</Column>);
    expect(getByText("Child Element")).toBeInTheDocument();
  });

  test("should match snapshot", () => {
    const { container } = render(<Column width="300px">Snapshot Test</Column>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
