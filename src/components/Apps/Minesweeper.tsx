import React, { useState, useEffect } from "react";
import "./minesweeper.css";

interface Cell {
  id: number;
  row: number;
  col: number;
  isMine: boolean;
  neighborMines: number;
  isRevealed: boolean;
  isFlagged: boolean;
}

const ROWS = 9;
const COLS = 9;
const TOTAL_MINES = 10;

// Neighbors getter helper
const getNeighbors = (cell: Cell, currentGrid: Cell[]) => {
  const list: Cell[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const target = currentGrid.find(
        (c) => c.row === cell.row + dr && c.col === cell.col + dc,
      );
      if (target) list.push(target);
    }
  }
  return list;
};

// Place mines randomly ensuring starting cell is safe
const placeMines = (startId: number, currentGrid: Cell[]) => {
  const nextGrid = [...currentGrid];
  const startCell = nextGrid.find((cell) => cell.id === startId)!;
  const startRow = startCell.row;
  const startCol = startCell.col;

  let minesPlaced = 0;
  while (minesPlaced < TOTAL_MINES) {
    const randIndex = Math.floor(Math.random() * nextGrid.length);
    const targetCell = nextGrid[randIndex];

    // Avoid placing mine on start cell or its direct neighbors for a friendly start
    const isStartArea =
      Math.abs(targetCell.row - startRow) <= 1 &&
      Math.abs(targetCell.col - startCol) <= 1;

    if (!targetCell.isMine && !isStartArea) {
      targetCell.isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbors count
  nextGrid.forEach((cell) => {
    if (cell.isMine) return;
    let count = 0;
    getNeighbors(cell, nextGrid).forEach((neighbor) => {
      if (neighbor.isMine) count++;
    });
    cell.neighborMines = count;
  });

  return nextGrid;
};

const revealCellRecursive = (cell: Cell, currentGrid: Cell[]) => {
  cell.isRevealed = true;

  if (cell.neighborMines === 0) {
    getNeighbors(cell, currentGrid).forEach((neighbor) => {
      if (!neighbor.isRevealed && !neighbor.isFlagged) {
        revealCellRecursive(neighbor, currentGrid);
      }
    });
  }
};

export const MinesweeperApp: React.FC = () => {
  const [grid, setGrid] = useState<Cell[]>(() => {
    const initialGrid: Cell[] = [];
    let id = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        initialGrid.push({
          id: id++,
          row: r,
          col: c,
          isMine: false,
          neighborMines: 0,
          isRevealed: false,
          isFlagged: false,
        });
      }
    }
    return initialGrid;
  });
  const [gameState, setGameState] = useState<
    "idle" | "playing" | "won" | "lost"
  >("idle");
  const [timer, setTimer] = useState(0);
  const [minesRemaining, setMinesRemaining] = useState(TOTAL_MINES);

  const smileyFace =
    gameState === "lost" ? "💀" : gameState === "won" ? "😎" : "😊";

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (gameState === "playing") {
      interval = setInterval(() => {
        setTimer((t) => Math.min(t + 1, 999));
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState]);

  // Initialize board
  const initBoard = () => {
    setGameState("idle");
    setTimer(0);
    setMinesRemaining(TOTAL_MINES);

    const initialGrid: Cell[] = [];
    let id = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        initialGrid.push({
          id: id++,
          row: r,
          col: c,
          isMine: false,
          neighborMines: 0,
          isRevealed: false,
          isFlagged: false,
        });
      }
    }
    setGrid(initialGrid);
  };

  // Left click Cell click reveal
  const handleCellClick = (cellId: number) => {
    if (gameState === "lost" || gameState === "won") return;

    let currentGrid = [...grid];

    // First click setup (first click safety protection)
    if (gameState === "idle") {
      currentGrid = placeMines(cellId, currentGrid);
      setGameState("playing");
    }

    const cell = currentGrid.find((c) => c.id === cellId)!;
    if (cell.isRevealed || cell.isFlagged) return;

    // Hit a mine!
    if (cell.isMine) {
      setGameState("lost");
      revealAllMines(currentGrid, cellId);
      return;
    }

    // Flood fill reveal
    revealCellRecursive(cell, currentGrid);
    setGrid(currentGrid);

    // Check if won
    checkWinCondition(currentGrid);
  };

  // Right click flag toggle
  const handleCellRightClick = (e: React.MouseEvent, cellId: number) => {
    e.preventDefault();
    if (gameState === "lost" || gameState === "won" || gameState === "idle")
      return;

    const nextGrid = [...grid];
    const cell = nextGrid.find((c) => c.id === cellId)!;
    if (cell.isRevealed) return;

    const targetFlagState = !cell.isFlagged;
    cell.isFlagged = targetFlagState;
    setGrid(nextGrid);

    setMinesRemaining((prev) => (targetFlagState ? prev - 1 : prev + 1));
  };

  const revealAllMines = (currentGrid: Cell[], explodedId: number) => {
    currentGrid.forEach((cell) => {
      if (cell.isMine) {
        cell.isRevealed = true;
      }
    });
    setGrid(currentGrid);

    // Set class trigger for exploded mine
    setTimeout(() => {
      const explodedElement = document.getElementById(`cell-${explodedId}`);
      if (explodedElement) {
        explodedElement.classList.add("exploded");
      }
    }, 50);
  };

  const checkWinCondition = (currentGrid: Cell[]) => {
    const hasUnrevealedSafeCell = currentGrid.some(
      (cell) => !cell.isMine && !cell.isRevealed,
    );
    if (!hasUnrevealedSafeCell) {
      setGameState("won");
      // Flag remaining mines automatically
      const nextGrid = currentGrid.map((cell) => {
        if (cell.isMine) {
          return { ...cell, isFlagged: true };
        }
        return cell;
      });
      setGrid(nextGrid);
      setMinesRemaining(0);
    }
  };

  return (
    <div className="mines-container">
      <div className="mines-frame">
        {/* LED Dashboard */}
        <div className="mines-dashboard">
          <div className="mines-led-display" title="Kalan Mayınlar">
            {String(minesRemaining).padStart(3, "0")}
          </div>

          <button className="mines-smiley-btn" onClick={initBoard}>
            {smileyFace}
          </button>

          <div className="mines-led-display" title="Süre (Saniye)">
            {String(timer).padStart(3, "0")}
          </div>
        </div>

        {/* Grid Cells */}
        <div className="mines-grid-box">
          <div className="mines-grid">
            {grid.map((cell) => {
              let displayContent = "";
              if (cell.isRevealed) {
                if (cell.isMine) {
                  displayContent = "💣";
                } else if (cell.neighborMines > 0) {
                  displayContent = String(cell.neighborMines);
                }
              } else if (cell.isFlagged) {
                displayContent = "🚩";
              }

              return (
                <div
                  key={cell.id}
                  id={`cell-${cell.id}`}
                  className={`mines-cell ${cell.isRevealed ? "revealed" : ""}`}
                  data-num={
                    cell.isRevealed && !cell.isMine
                      ? cell.neighborMines
                      : undefined
                  }
                  onClick={() => handleCellClick(cell.id)}
                  onContextMenu={(e) => handleCellRightClick(e, cell.id)}
                >
                  {displayContent}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinesweeperApp;
