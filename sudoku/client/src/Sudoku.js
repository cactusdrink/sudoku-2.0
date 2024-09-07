import "./App.css";
import React, { useState, useRef } from "react";
import Board from "./ui/Board";
import { REST } from "./services/api.js";

function getGrid() {
  const grid = [];
  for (let i = 0; i < 9; i++) {
    grid[i] = Array(9).fill(0);
  }
  return grid;
}

function copy2DArray(from, to) {
  if (!from || !from.length) {
    console.error("Invalid array passed to copy2DArray");
    return;
  }
  for (let i = 0; i < from.length; i++) {
    to[i] = [...from[i]];
  }
}

function Sudoku() {
  const [grid, setGrid] = useState(getGrid);
  const [puzzleStatus, setPuzzleStatus] = useState("");
  const [language, setLanguage] = useState('en');
  const [errors, setErrors] = useState([]); // Array to track error positions
  const initialGrid = useRef(getGrid());
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  function handleChange(row, col, e) {
    const re = /^[0-9\b]+$/;
    if (e.target.value === "" || re.test(e.target.value)) {
      if (Number(e.target.value) < 10 && initialGrid.current[row][col] === 0) {
        const newGrid = [...grid];
        newGrid[row][col] = Number(e.target.value);
        setGrid(newGrid);
        checkErrors(newGrid); // Check for errors after input
      }
    }
  }

  function checkErrors(grid) {
    const newErrors = [];

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col];
        if (value !== 0 && !isValid(value, row, col, grid)) {
          newErrors.push({ row, col });
        }
      }
    }

    setErrors(newErrors);
  }

  function isValid(value, row, col, grid) {
    // Check row and column
    for (let i = 0; i < 9; i++) {
      if (i !== col && grid[row][i] === value) return false;
      if (i !== row && grid[i][col] === value) return false;
    }

    // Check 3x3 sub-grid
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if ((startRow + i !== row || startCol + j !== col) && grid[startRow + i][startCol + j] === value) {
          return false;
        }
      }
    }

    return true;
  }

  async function handleCreate() {
    try {
      const response = await REST.getBoard();
      const data = await response.json();
      if (data && data.game && Array.isArray(data.game) && data.game.length === 9) {
        return data.game;
      } else {
        throw new Error("Invalid board data received");
      }
    } catch (error) {
      console.error("Error in handleCreate:", error);
      return getGrid(); // fallback to empty grid on error
    }
  }

  async function handleValidate() {
    try {
      const response = await REST.validateBoard(grid);
      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error("Error in handleValidate:", error);
      return false; // fallback to unsolved status on error
    }
  }

  async function handleSolve() {
    try {
      const response = await REST.solveBoard(grid);
      const data = await response.json();
      if (data.status) {
        setPuzzleStatus(language === 'en' ? "SOLVED" : "解決済み");
        return data.solution;
      } else {
        setPuzzleStatus(language === 'en' ? "UNSOLVABLE" : "解決不可");
        return grid;
      }
    } catch (error) {
      console.error("Error in handleSolve:", error);
      return grid; // fallback to the current grid on error
    }
  }

  function startTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetTimer() {
    setTimer(0);
  }

  async function handleInterface(action) {
    let newGrid;
    try {
      switch (action) {
        case "create":
          newGrid = await handleCreate();
          if (newGrid) {
            copy2DArray(newGrid, initialGrid.current);
            setPuzzleStatus("");
            setGrid(newGrid);
            startTimer(); // Start the timer when a new puzzle is created
          }
          break;
        case "solve":
          newGrid = await handleSolve();
          if (newGrid) {
            setGrid(newGrid);
            stopTimer(); // Stop the timer when the puzzle is solved
          }
          break;
        case "clear":
          newGrid = getGrid();
          copy2DArray(newGrid, initialGrid.current);
          setGrid(newGrid);
          setPuzzleStatus("");
          stopTimer(); // Stop the timer when the puzzle is cleared
          resetTimer(); // Reset the timer
          break;
        case "validate":
          const status = await handleValidate();
          const puzzStats = status ? (language === 'en' ? "SOLVED" : "解決済み") : (language === 'en' ? "UNSOLVED" : "解決不可");
          setPuzzleStatus(puzzStats);
          if (status) {
            stopTimer(); // Stop the timer if the puzzle is validated as solved
          }
          break;
        default:
          throw new Error("Invalid action");
      }
    } catch (error) {
      console.error("Error handling interface action:", error);
    }
  }

  // Toggle between languages
  const toggleLanguage = () => {
    setLanguage(prevLanguage => prevLanguage === 'en' ? 'jp' : 'en');
  };

  return (
    <div className="Sudoku">
      <header className="App-header">
        <h2>{language === 'en' ? '' : 'すうどく'}</h2>
        <h1>{language === 'en' ? 'Sūdoku' : '数独'}</h1>
        <button className="language-button" onClick={toggleLanguage}>
          {language === 'en' ? 'JP' : 'EN'}
        </button>
        <div className="timer">
          {Math.floor(timer / 60).toString().padStart(2, '0')}:
          {Math.floor(timer % 60).toString().padStart(2, '0')}
        </div>
      </header>
      
      <div className="sudoku-container">
        <Board
          puzzle={initialGrid.current}
          grid={grid}
          errors={errors} // Pass errors to the Board component
          handleChange={handleChange}
        />
        <div className="interface">
          <div className="info-interface">
            <input readOnly value={puzzleStatus} />
          </div>
          <div className="action-interface">
            <button
              className="generator-btn btn"
              onClick={() => handleInterface("create")}
            >
              {language === 'en' ? 'Create' : '作成'}
            </button>
            <button
              className="validate-btn btn"
              onClick={() => handleInterface("validate")}
            >
              {language === 'en' ? 'Validate' : '検証'}
            </button>
            <button
              className="solve-btn btn"
              onClick={() => handleInterface("solve")}
            >
              {language === 'en' ? 'Solve' : '解決'}
            </button>
            <button
              className="clear-btn btn"
              onClick={() => handleInterface("clear")}
            >
              {language === 'en' ? 'Clear' : 'クリア'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sudoku;
