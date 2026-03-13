import { useState } from "react";
import "./App.css";
import MethodSelector from "./components/MethodSelector";
import Controls from "./components/Controls";
import FormulaPanel from "./components/FormulaPanel";
import ResultTable from "./components/ResultTable";
import SequenceChart from "./components/SequenceChart";

const API_BASE = "http://localhost:5000";

function detectCycles(sequence) {
  const seen = new Map();
  for (let i = 0; i < sequence.length; i++) {
    if (seen.has(sequence[i])) {
      return { cycleStart: seen.get(sequence[i]), cycleAt: i };
    }
    seen.set(sequence[i], i);
  }
  return null;
}

export default function App() {
  const [method, setMethod] = useState("lcg");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMethodChange = (m) => {
    setMethod(m);
    setResult(null);
    setError(null);
  };

  const handleGenerate = async (params) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/generate/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Server error");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(
        "Could not reach the backend. Make sure the Flask server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  const cycle = result ? detectCycles(result.sequence) : null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎲 PRNG Models Simulator</h1>
        <p className="subtitle">
          An educational tool for exploring Pseudo-Random Number Generators
        </p>
      </header>

      <MethodSelector selected={method} onChange={handleMethodChange} />

      <div className="main-content">
        <aside className="sidebar">
          <FormulaPanel method={method} />
          <Controls method={method} onGenerate={handleGenerate} loading={loading} />
        </aside>

        <section className="results">
          {error && (
            <div className="error-box">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && cycle && (
            <div className="cycle-warning">
              ⚠️ <strong>Cycle detected!</strong> The value{" "}
              <code>{result.sequence[cycle.cycleStart]}</code> first appeared at
              step {cycle.cycleStart + 1} and repeated at step {cycle.cycleAt + 1}.{" "}
              Period length: {cycle.cycleAt - cycle.cycleStart}.
            </div>
          )}

          {result && (
            <>
              <SequenceChart normalized={result.normalized} />
              <ResultTable steps={result.steps} method={method} />
            </>
          )}

          {!result && !error && !loading && (
            <div className="placeholder">
              <p>
                👈 Select a method, set the parameters, and click{" "}
                <strong>Generate</strong>.
              </p>
            </div>
          )}
        </section>
      </div>

      <footer className="app-footer">
        <p>PRNG Models Simulator — Educational Project</p>
      </footer>
    </div>
  );
}
