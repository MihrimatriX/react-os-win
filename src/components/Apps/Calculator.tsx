import React, { useState } from "react";
import {
  backspace,
  chooseOp,
  clearEntry,
  equals,
  initialCalc,
  inputDigit,
  negate,
  percent,
  unary,
  type CalcState,
} from "./calculatorLogic";
import "./calculator.css";

export const CalculatorApp: React.FC = () => {
  const [calc, setCalc] = useState<CalcState>(initialCalc);
  const press = (step: (s: CalcState) => CalcState) => () => setCalc(step);
  const digit = (d: string) => press((s) => inputDigit(s, d));
  const display = calc.entry;
  const equation = calc.equation;

  return (
    <div className="calc-container">
      <div className="calc-menubar">
        <button type="button" className="calc-menu-btn" title="Menü">
          ☰
        </button>
        <span className="calc-mode-label">Standart</span>
        <button type="button" className="calc-history-btn" title="Geçmiş">
          🕓
        </button>
      </div>

      <div className="calc-screen">
        <div className="calc-equation">{equation || "\u00a0"}</div>
        <div className="calc-display" title={display}>
          {display}
        </div>
      </div>

      <div className="calc-keys">
        <button className="calc-btn fn-btn" onClick={press(percent)}>
          %
        </button>
        <button className="calc-btn fn-btn" onClick={press(clearEntry)}>
          CE
        </button>
        <button className="calc-btn fn-btn" onClick={() => setCalc(initialCalc)}>
          C
        </button>
        <button className="calc-btn fn-btn" onClick={press(backspace)}>
          ⌫
        </button>

        <button
          className="calc-btn fn-btn"
          onClick={press((s) => unary(s, (n) => 1 / n))}
        >
          ¹⁄ₓ
        </button>
        <button
          className="calc-btn fn-btn"
          onClick={press((s) => unary(s, (n) => n * n))}
        >
          x²
        </button>
        <button
          className="calc-btn fn-btn"
          onClick={press((s) => unary(s, Math.sqrt))}
        >
          √x
        </button>
        <button className="calc-btn op-btn" onClick={press((s) => chooseOp(s, "/"))}>
          ÷
        </button>

        <button className="calc-btn digit-btn" onClick={digit("7")}>
          7
        </button>
        <button className="calc-btn digit-btn" onClick={digit("8")}>
          8
        </button>
        <button className="calc-btn digit-btn" onClick={digit("9")}>
          9
        </button>
        <button className="calc-btn op-btn" onClick={press((s) => chooseOp(s, "*"))}>
          ×
        </button>

        <button className="calc-btn digit-btn" onClick={digit("4")}>
          4
        </button>
        <button className="calc-btn digit-btn" onClick={digit("5")}>
          5
        </button>
        <button className="calc-btn digit-btn" onClick={digit("6")}>
          6
        </button>
        <button className="calc-btn op-btn" onClick={press((s) => chooseOp(s, "-"))}>
          −
        </button>

        <button className="calc-btn digit-btn" onClick={digit("1")}>
          1
        </button>
        <button className="calc-btn digit-btn" onClick={digit("2")}>
          2
        </button>
        <button className="calc-btn digit-btn" onClick={digit("3")}>
          3
        </button>
        <button className="calc-btn op-btn" onClick={press((s) => chooseOp(s, "+"))}>
          +
        </button>

        <button className="calc-btn digit-btn" onClick={press(negate)}>
          +/−
        </button>
        <button className="calc-btn digit-btn" onClick={digit("0")}>
          0
        </button>
        <button className="calc-btn digit-btn" onClick={digit(".")}>
          ,
        </button>
        <button className="calc-btn equal-btn" onClick={press(equals)}>
          =
        </button>
      </div>
    </div>
  );
};
export default CalculatorApp;
