import { getJsonLineCount } from "./functions";

describe("getJsonLineCount", () => {
  it("should return correct line count for a simple object", () => {
    const obj = { name: "Alice", age: 25 };
    expect(getJsonLineCount(obj)).toBe(4); // 4 lines: {, "name": "Alice", "age": 25, }
  });

  it("should return correct line count for a deeply nested object", () => {
    const obj = {
      user: {
        id: 1,
        profile: {
          name: "Alice",
          address: {
            city: "New York",
            zip: "10001",
          },
        },
      },
    };
    expect(getJsonLineCount(obj)).toBe(12); // Correctly counts multi-line JSON
  });

  it("should return correct line count for an array of objects", () => {
    const obj = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(getJsonLineCount(obj)).toBe(11); // Includes opening/closing brackets
  });

  it("should return 1 for an empty object", () => {
    expect(getJsonLineCount({})).toBe(1);
  });

  it("should return 1 for an empty array", () => {
    expect(getJsonLineCount([])).toBe(1);
  });

  it("should return 1 for a number", () => {
    expect(getJsonLineCount(123)).toBe(1);
  });

  it("should return 1 for a boolean", () => {
    expect(getJsonLineCount(true)).toBe(1);
  });

  it("should return 1 for a null value", () => {
    expect(getJsonLineCount(null)).toBe(1);
  });

  it("should return correct line count for a long string", () => {
    const obj = { text: "This is a long string with multiple words." };
    expect(getJsonLineCount(obj)).toBe(3); // 3 lines: {, "text": "...", }
  });
});
