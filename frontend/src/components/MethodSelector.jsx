const METHODS = [
  { id: "lcg", label: "Linear Congruential Generator (LCG)" },
  { id: "mcg", label: "Multiplicative Congruential Generator (MCG)" },
  { id: "middle-square", label: "Middle-Square Method" },
];

export default function MethodSelector({ selected, onChange }) {
  return (
    <div className="method-selector">
      <h2>Select Generator</h2>
      <div className="method-buttons">
        {METHODS.map((m) => (
          <button
            key={m.id}
            className={`method-btn ${selected === m.id ? "active" : ""}`}
            onClick={() => onChange(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
