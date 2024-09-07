import React from "react";

function Board({ puzzle, grid, errors, handleChange }) {
  return (
    <div className="board">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isInitial = puzzle[rowIndex][colIndex] !== 0;
          const isError = errors.some(
            (error) => error.row === rowIndex && error.col === colIndex
          );

          return (
            <input
              key={`${rowIndex}-${colIndex}`}
              type="text"
              className={`tile ${isInitial ? "initial" : ""} ${isError ? "error" : ""}`}
              value={cell === 0 ? "" : cell}
              onChange={(e) => handleChange(rowIndex, colIndex, e)}
              readOnly={isInitial}
            />
          );
        })
      )}
    </div>
  );
}

export default Board;
