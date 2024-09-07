import React from "react";

function Interface({ handleInterface, status, language }) {
  return (
    <div className="interface">
      <div className="info-interface">
        <input readOnly value={status} />
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
  );
}

export default Interface;
