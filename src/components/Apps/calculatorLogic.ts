/** Pure calculator state machine (Windows "Standard" mode semantics). */

export type Op = "+" | "-" | "*" | "/";

export interface CalcState {
  /** Left operand waiting for `op`. */
  acc: number | null;
  op: Op | null;
  /** Text in the big display ("0", "-12.5", "Hata"). */
  entry: string;
  /**
   * typing:  the user is typing `entry`
   * afterOp: an operator was just pressed; the next digit starts the right operand
   * result:  `entry` is a computed value (after "=", a unary key or %)
   */
  mode: "typing" | "afterOp" | "result";
  /** Small line above the display. */
  equation: string;
}

export const ERROR = "Hata";

export const initialCalc: CalcState = {
  acc: null,
  op: null,
  entry: "0",
  mode: "typing",
  equation: "",
};

const SYMBOL: Record<Op, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

const errorState: CalcState = { ...initialCalc, entry: ERROR, mode: "result" };

/** Trims float noise (0.1 + 0.2 → 0.3); non-finite results become an error. */
export const format = (n: number) =>
  Number.isFinite(n) ? String(parseFloat(n.toPrecision(12))) : ERROR;

const apply = (a: number, op: Op, b: number) =>
  op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b;

const isError = (s: CalcState) => s.entry === ERROR;

export const inputDigit = (s: CalcState, d: string): CalcState => {
  if (isError(s)) return inputDigit(initialCalc, d);
  if (s.mode !== "typing") {
    // After "=" with nothing pending, a digit starts a brand-new calculation.
    const equation = s.op ? s.equation : "";
    return { ...s, entry: d === "." ? "0." : d, mode: "typing", equation };
  }
  if (d === "." && s.entry.includes(".")) return s;
  if (d !== "." && (s.entry === "0" || s.entry === "-0")) {
    return { ...s, entry: s.entry.replace("0", d) };
  }
  return { ...s, entry: s.entry + d };
};

export const chooseOp = (s: CalcState, op: Op): CalcState => {
  if (isError(s)) return s;
  // Two operators in a row: the second one replaces the first.
  if (s.mode === "afterOp" && s.acc !== null) {
    return { ...s, op, equation: `${format(s.acc)} ${SYMBOL[op]}` };
  }
  const value = Number(s.entry);
  const acc = s.op && s.acc !== null ? apply(s.acc, s.op, value) : value;
  const shown = format(acc);
  if (shown === ERROR) return errorState;
  return {
    acc,
    op,
    entry: shown,
    mode: "afterOp",
    equation: `${shown} ${SYMBOL[op]}`,
  };
};

export const equals = (s: CalcState): CalcState => {
  if (isError(s) || s.op === null || s.acc === null) {
    return isError(s) ? s : { ...s, mode: "result" };
  }
  const b = Number(s.entry);
  const shown = format(apply(s.acc, s.op, b));
  if (shown === ERROR) return errorState;
  return {
    acc: null,
    op: null,
    entry: shown,
    mode: "result",
    equation: `${format(s.acc)} ${SYMBOL[s.op]} ${format(b)} =`,
  };
};

/** 1/x, x², √x — they replace the operand on screen, not the whole sum. */
export const unary = (
  s: CalcState,
  fn: (n: number) => number,
): CalcState => {
  if (isError(s)) return s;
  const shown = format(fn(Number(s.entry)));
  if (shown === ERROR) return errorState;
  return {
    ...s,
    entry: shown,
    mode: "result",
    equation: s.op ? s.equation : "",
  };
};

export const percent = (s: CalcState): CalcState => {
  // TODO(human)
  return s;
};

export const negate = (s: CalcState): CalcState => {
  if (isError(s) || Number(s.entry) === 0) return s;
  const entry = s.entry.startsWith("-") ? s.entry.slice(1) : `-${s.entry}`;
  return { ...s, entry, mode: s.mode === "typing" ? "typing" : "result" };
};

/** CE: clears the current entry only (an error clears everything). */
export const clearEntry = (s: CalcState): CalcState =>
  isError(s) ? initialCalc : { ...s, entry: "0", mode: "typing" };

export const backspace = (s: CalcState): CalcState => {
  if (isError(s) || (s.mode === "result" && s.op === null)) return initialCalc;
  if (s.mode !== "typing") return s;
  const entry = s.entry.slice(0, -1);
  return { ...s, entry: entry === "" || entry === "-" ? "0" : entry };
};
