export default function ResultTable({ steps, method }) {
  if (!steps || steps.length === 0) return null;

  const isMiddleSquare = method === "middle-square";

  return (
    <div className="result-table-wrapper">
      <h2>Step-by-Step Results</h2>
      <div className="table-scroll">
        <table className="result-table">
          <thead>
            <tr>
              <th>Step</th>
              <th>Xₙ (prev)</th>
              {isMiddleSquare ? (
                <>
                  <th>Xₙ²</th>
                  <th>Padded</th>
                  <th>Extracted</th>
                </>
              ) : (
                <th>Formula</th>
              )}
              <th>Xₙ₊₁</th>
              <th>Uₙ [0,1)</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s) => (
              <tr key={s.iteration} className={s.x_next === 0 ? "zero-row" : ""}>
                <td>{s.iteration}</td>
                <td>{s.x_prev}</td>
                {isMiddleSquare ? (
                  <>
                    <td>{s.squared}</td>
                    <td>
                      <code>{s.padded}</code>
                    </td>
                    <td>
                      <code className="highlight">{s.extracted}</code>
                    </td>
                  </>
                ) : (
                  <td>
                    <code>{s.formula}</code>
                  </td>
                )}
                <td>
                  <strong>{s.x_next}</strong>
                </td>
                <td>{s.normalized.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
