const FORMULAS = {
  lcg: {
    title: "Linear Congruential Generator",
    formula: "Xₙ₊₁ = (a · Xₙ + c) mod m",
    description:
      "One of the oldest and best-known pseudo-random number generator algorithms. It generates a sequence using a linear equation modulo m.",
    params: [
      { key: "X₀", desc: "Seed (initial value)" },
      { key: "a", desc: "Multiplier" },
      { key: "c", desc: "Increment (c ≥ 0)" },
      { key: "m", desc: "Modulus (m > 0)" },
    ],
    note: "For full-period generation: gcd(c, m) = 1; a ≡ 1 (mod p) for every prime p dividing m.",
    example: "X₀=7, a=5, c=3, m=16 → 6, 1, 8, 11, 10, …",
  },
  mcg: {
    title: "Multiplicative Congruential Generator",
    formula: "Xₙ₊₁ = (a · Xₙ) mod m",
    description:
      "A special case of the LCG where c=0. The seed must be non-zero and co-prime with m for a long period.",
    params: [
      { key: "X₀", desc: "Seed (must be non-zero)" },
      { key: "a", desc: "Multiplier" },
      { key: "m", desc: "Modulus (m > 0)" },
    ],
    note: "When m = 2³¹ − 1 (a Mersenne prime) and a is a primitive root mod m, the period is m−1.",
    example: "X₀=7, a=5, m=16 → 3, 15, 11, 7, 3, … (cycle detected!)",
  },
  "middle-square": {
    title: "Middle-Square Method",
    formula: "Xₙ₊₁ = middle d digits of Xₙ²",
    description:
      "Proposed by John von Neumann in 1946. Square the current value, zero-pad to 2d digits, then extract the middle d digits.",
    params: [
      { key: "X₀", desc: "Seed (d-digit integer)" },
      { key: "d", desc: "Digits = len(seed) (auto-computed)" },
    ],
    note: "Warning: this method can degenerate quickly — some seeds lead to a fixed-point (e.g. 0000²=00000000, middle=0000).",
    example: "Seed=1234 → 5227 → 3215 → 3362 → …",
  },
};

export default function FormulaPanel({ method }) {
  const info = FORMULAS[method];
  if (!info) return null;

  return (
    <div className="formula-panel">
      <h3>📐 {info.title}</h3>
      <div className="formula-box">{info.formula}</div>
      <p className="formula-desc">{info.description}</p>
      <table className="param-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {info.params.map((p) => (
            <tr key={p.key}>
              <td>
                <code>{p.key}</code>
              </td>
              <td>{p.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="formula-note">
        <strong>Note:</strong> {info.note}
      </p>
      <p className="formula-example">
        <strong>Example:</strong> {info.example}
      </p>
    </div>
  );
}
