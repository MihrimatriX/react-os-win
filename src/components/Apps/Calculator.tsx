import React, { useState } from "react";
import "./calculator.css";

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isCalculated, setIsCalculated] = useState(false);

  const handleDigit = (digit: string) => {
    if (display === "0" || isCalculated) {
      setDisplay(digit);
      setIsCalculated(false);
    } else {
      setDisplay(display + digit);
    }
    setEquation(isCalculated ? digit : equation + digit);
  };

  const handleOperator = (op: string) => {
    setIsCalculated(false);
    const lastChar = equation.trim().slice(-1);
    const operators = ["+", "-", "*", "/"];

    if (operators.includes(lastChar) && display === "0") {
      setEquation(equation.slice(0, -2) + ` ${op} `);
      return;
    }

    setEquation(equation + ` ${op} `);
    setDisplay("0");
  };

  const handleEqual = () => {
    if (!equation) return;
    try {
      const sanitized = equation.replace(/x/g, "*").replace(/÷/g, "/");
      const result = Function(`"use strict"; return (${sanitized})`)();
      const formattedResult = Number(result.toFixed(8)).toString();
      setDisplay(formattedResult);
      setEquation(equation + " = " + formattedResult);
      setIsCalculated(true);
    } catch {
      setDisplay("Hata");
      setEquation("");
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
    setIsCalculated(false);
  };

  const handleBackspace = () => {
    if (isCalculated) {
      handleClear();
      return;
    }
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
      setEquation(equation.slice(0, -1));
    } else {
      setDisplay("0");
      setEquation(equation.slice(0, -1));
    }
  };

  const handlePercent = () => {
    try {
      const val = parseFloat(display) / 100;
      setDisplay(val.toString());
      setEquation(equation + " / 100");
    } catch {
      setDisplay("Hata");
    }
  };

  const handleNegate = () => {
    if (display === "0" || display === "Hata") return;
    const next = display.startsWith("-") ? display.slice(1) : `-${display}`;
    setDisplay(next);
    if (isCalculated) setEquation(next);
  };

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
        <button className="calc-btn fn-btn" onClick={handlePercent}>
          %
        </button>
        <button className="calc-btn fn-btn" onClick={handleClear}>
          CE
        </button>
        <button className="calc-btn fn-btn" onClick={handleClear}>
          C
        </button>
        <button className="calc-btn fn-btn" onClick={handleBackspace}>
          ⌫
        </button>

        <button
          className="calc-btn fn-btn"
          onClick={() => {
            try {
              setDisplay(String(1 / parseFloat(display)));
              setIsCalculated(true);
            } catch {
              setDisplay("Hata");
            }
          }}
        >
          ¹⁄ₓ
        </button>
        <button
          className="calc-btn fn-btn"
          onClick={() => {
            const n = parseFloat(display);
            setDisplay(String(n * n));
            setIsCalculated(true);
          }}
        >
          x²
        </button>
        <button
          className="calc-btn fn-btn"
          onClick={() => {
            const n = parseFloat(display);
            setDisplay(n < 0 ? "Hata" : String(Math.sqrt(n)));
            setIsCalculated(true);
          }}
        >
          √x
        </button>
        <button className="calc-btn op-btn" onClick={() => handleOperator("/")}>
          ÷
        </button>

        <button className="calc-btn digit-btn" onClick={() => handleDigit("7")}>
          7
        </button>
        <button className="calc-btn digit-btn" onClick={() => handleDigit("8")}>
          8
        </button>
        <button className="calc-btn digit-btn" onClick={() => handleDigit("9")}>
          9
        </button>
        <button className="calc-btn op-btn" onClick={() => handleOperator("*")}>
          ×
        </button>

        <button className="calc-btn digit-btn" onClick={() => handleDigit("4")}>
          4
        </button>
        <button className="calc-btn digit-btn" onClick={() => handleDigit("5")}>
          5
        </button>
        <button className="calc-btn digit-btn" onClick={() => handleDigit("6")}>
          6
        </button>
        <button className="calc-btn op-btn" onClick={() => handleOperator("-")}>
          −
        </button>

        <button className="calc-btn digit-btn" onClick={() => handleDigit("1")}>
          1
        </button>
        <button className="calc-btn digit-btn" onClick={() => handleDigit("2")}>
          2
        </button>
        <button className="calc-btn digit-btn" onClick={() => handleDigit("3")}>
          3
        </button>
        <button className="calc-btn op-btn" onClick={() => handleOperator("+")}>
          +
        </button>

        <button className="calc-btn digit-btn" onClick={handleNegate}>
          +/−
        </button>
        <button className="calc-btn digit-btn" onClick={() => handleDigit("0")}>
          0
        </button>
        <button className="calc-btn digit-btn" onClick={() => handleDigit(".")}>
          ,
        </button>
        <button className="calc-btn equal-btn" onClick={handleEqual}>
          =
        </button>
      </div>
    </div>
  );
};
export default CalculatorApp;
