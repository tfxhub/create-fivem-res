import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { useVisibility } from './hooks/useVisibility';

export default function App() {
    const [count, setCount] = useState(0);
    const { visible, close } = useVisibility();

    if (!visible) return null;

    return (
        <main className="relative flex flex-col items-center rounded-2xl bg-black/50 p-8 text-center">
            <div className="absolute right-4 top-4">
                <button
                    onClick={close}
                    className="rounded-2xl bg-black/50 px-2 text-[1rem] text-white/50 transition-colors hover:text-white"
                >
                    X
                </button>
            </div>

            <div className="flex flex-row items-center justify-center">
                <a href="https://vite.dev" target="_blank" rel="noreferrer">
                    <img
                        src={viteLogo}
                        className="h-[6em] p-[1.5em] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
                        alt="Vite logo"
                    />
                </a>
                <a href="https://react.dev" target="_blank" rel="noreferrer">
                    <img
                        src={reactLogo}
                        className="h-[6em] p-[1.5em] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa]"
                        alt="React logo"
                    />
                </a>
            </div>

            <h1 className="text-2xl font-bold">Vite + React + FiveM</h1>

            <div className="flex flex-col items-center gap-3 p-8">
                <button
                    onClick={() => setCount((value) => value + 1)}
                    className="rounded-xl bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
                >
                    count is {count}
                </button>
                <p className="text-white/70">
                    Edit <code className="rounded bg-black/30 px-1 py-0.5">src/App.tsx</code> and save to test HMR
                </p>
            </div>
        </main>
    );
}
