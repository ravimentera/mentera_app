import { render, screen } from "@testing-library/react";

describe("Sample Test", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });

  it("should render a component", () => {
    const TestComponent = () => <div>Test Component</div>;
    render(<TestComponent />);

    const element = screen.getByText("Test Component");
    expect(element).toBeInTheDocument();
  });
});
