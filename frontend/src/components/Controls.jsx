import { useState } from "react";

const DEFAULTS = {
  lcg: { seed: 7, a: 5, c: 3, m: 16, count: 10 },
  mcg: { seed: 7, a: 5, m: 16, count: 10 },
  "middle-square": { seed: 1234, iterations: 10 },
};

const FIELDS = {
  lcg: [
    { key: "seed", label: "Seed (X₀)", min: 0 },
    { key: "a", label: "Multiplier (a)", min: 1 },
    { key: "c", label: "Increment (c)", min: 0 },
    { key: "m", label: "Modulus (m)", min: 2 },
    { key: "count", label: "Number of values", min: 1, max: 10000 },
  ],
  mcg: [
    { key: "seed", label: "Seed (X₀)", min: 1 },
    { key: "a", label: "Multiplier (a)", min: 1 },
    { key: "m", label: "Modulus (m)", min: 2 },
    { key: "count", label: "Number of values", min: 1, max: 10000 },
  ],
  "middle-square": [
    { key: "seed", label: "Seed (X₀)", min: 0 },
    { key: "iterations", label: "Iterations", min: 1, max: 10000 },
  ],
};

export default function Controls({ method, onGenerate, loading }) {
  // Sync when method changes from parent
  const fields = FIELDS[method] || [];

  const [localParams, setLocalParams] = useState(DEFAULTS[method] || {});
  const [prevMethod, setPrevMethod] = useState(method);

  if (prevMethod !== method) {
    setPrevMethod(method);
    setLocalParams(DEFAULTS[method] || {});
  }

  const handleChange = (key, value) => {
    setLocalParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = {};
    for (const f of fields) {
      parsed[f.key] = parseInt(localParams[f.key], 10);
    }
    onGenerate(parsed);
  };

  return (
    <form className="controls-form" onSubmit={handleSubmit}>
      <h2>Parameters</h2>
      {fields.map((f) => (
        <div className="field-group" key={f.key}>
          <label htmlFor={f.key}>{f.label}</label>
          <input
            id={f.key}
            type="number"
            min={f.min}
            max={f.max}
            value={localParams[f.key] ?? ""}
            onChange={(e) => handleChange(f.key, e.target.value)}
            required
          />
        </div>
      ))}
      <button type="submit" disabled={loading} className="generate-btn">
        {loading ? "Generating…" : "Generate"}
      </button>
    </form>
  );
}
