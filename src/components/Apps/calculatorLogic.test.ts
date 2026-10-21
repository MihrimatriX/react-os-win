import { describe, expect, it } from "vitest";
import {
  backspace,
  chooseOp,
  clearEntry,
  equals,
  ERROR,
  initialCalc,
  inputDigit,
  negate,
  unary,
  type CalcState,
  type Op,
} from "./calculatorLogic";

/** Presses keys like a user: "2 + 3 =", "9 sqrt + 1 =", "5 neg". */
const run = (keys: string, start: CalcState = initialCalc) =>
  keys.split(" ").reduce((s, key) => {
    if (/^[0-9.]+$/.test(key)) return [...key].reduce(inputDigit, s);
    if (key === "=") return equals(s);
    if (key === "sqrt") return unary(s, Math.sqrt);
    if (key === "inv") return unary(s, (n) => 1 / n);
    if (key === "neg") return negate(s);
    if (key === "CE") return clearEntry(s);
    if (key === "back") return backspace(s);
    return chooseOp(s, key as Op);
  }, start).entry;

describe("calculatorLogic", () => {
  it("does basic and chained arithmetic", () => {
    expect(run("2 + 3 =")).toBe("5");
    expect(run("2 + 3 * 4 =")).toBe("20"); // immediate execution, like Windows
    expect(run("2 + 3 = + 1 =")).toBe("6");
    expect(run("- 5 =")).toBe("-5");
  });

  it("applies unary keys and negate to the current operand only", () => {
    expect(run("9 sqrt + 1 =")).toBe("4");
    expect(run("1 + 9 sqrt =")).toBe("4");
    expect(run("5 neg + 3 =")).toBe("-2");
    expect(run("4 inv * 8 =")).toBe("2");
  });

  it("handles leading zeros, dots and float noise", () => {
    expect(run("0 7 =")).toBe("7");
    expect(run("5 + 0 7 =")).toBe("12");
    expect(run("1 . . 2")).toBe("1.2");
    expect(run("0.1 + 0.2 =")).toBe("0.3");
  });

  it("reports errors and recovers on the next digit", () => {
    expect(run("5 / 0 =")).toBe(ERROR);
    expect(run("0 / 0 =")).toBe(ERROR);
    expect(run("4 neg sqrt")).toBe(ERROR);
    expect(run("5 / 0 = 7")).toBe("7");
  });

  it("swaps a repeated operator and edits the entry", () => {
    expect(run("8 + * 2 =")).toBe("16");
    expect(run("12 back")).toBe("1");
    expect(run("7 + 5 CE 2 =")).toBe("9");
  });
});
