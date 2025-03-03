import { render } from "@testing-library/react";
import { Container } from ".";
import "@testing-library/jest-dom";

describe("Container Component", () => {
  test("should render correctly with default styles", () => {
    const { container } = render(<Container>Test Content</Container>);

    expect(container.firstChild).toHaveStyle({
      height: "100%",
      width: "100%",
      overflowY: "auto",
      position: "relative",
    });
  });

  test("should render children correctly", () => {
    const { getByText } = render(<Container>Child Element</Container>);

    expect(getByText("Child Element")).toBeInTheDocument();
  });

  test("should match snapshot", () => {
    const { container } = render(<Container>Snapshot Test</Container>);

    expect(container.firstChild).toMatchSnapshot();
  });
});
