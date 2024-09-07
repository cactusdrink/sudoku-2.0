import "./App.css";
import React, { useState } from "react";
import Sudoku from "./Sudoku";

function App() {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage(prevLanguage => prevLanguage === 'en' ? 'jp' : 'en');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>{language === 'en' ? '' : 'すうどく'}</h2>
        <h1>{language === 'en' ? 'Sūdoku' : '数独'}</h1>
        <button className="language-button" onClick={toggleLanguage}>
          {language === 'en' ? 'JP' : 'EN'}
        </button>
      </header>
      <Sudoku />
    </div>
  );
}

export default App;
