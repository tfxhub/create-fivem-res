import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useVisibility } from "./hooks/useVisibility";

export default function App() {
  const [count, setCount] = useState(0);
  const { visible, close } = useVisibility();

  if (!visible) return null;

  return (
    <main className="main-container">
      <div className="close-button-container">
        <button onClick={close} className="close-button">
          X
        </button>
      </div>

      <div className="logo-container">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo vite-logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react-logo" alt="React logo" />
        </a>
      </div>

      <h1 className="title">Vite + React + FiveM</h1>

      <div className="card">
        <button
          onClick={() => setCount((value) => value + 1)}
          className="count-button"
        >
          count is {count}
        </button>
        <p className="instruction-text">
          Edit <code className="code-text">src/App.tsx</code> and save to test
          HMR
        </p>
      </div>
    </main>
  );
}
