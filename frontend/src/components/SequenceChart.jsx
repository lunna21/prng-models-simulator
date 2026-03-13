import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ScatterChart,
  Scatter,
} from "recharts";

export default function SequenceChart({ normalized }) {
  if (!normalized || normalized.length === 0) return null;

  const lineData = normalized.map((v, i) => ({ index: i + 1, value: v }));

  // Scatter: plot (U_n, U_{n+1}) pairs to reveal correlations
  const scatterData = normalized
    .slice(0, -1)
    .map((v, i) => ({ x: v, y: normalized[i + 1] }));

  return (
    <div className="charts-section">
      <h2>Visualization</h2>

      <div className="chart-block">
        <h3>Sequence Plot (Uₙ vs iteration)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="index"
              label={{ value: "Iteration", position: "insideBottom", offset: -2 }}
            />
            <YAxis domain={[0, 1]} label={{ value: "Uₙ", angle: -90, position: "insideLeft" }} />
            <Tooltip formatter={(v) => v.toFixed(4)} />
            <ReferenceLine y={0.5} stroke="#aaa" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4f8ef7"
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {scatterData.length > 1 && (
        <div className="chart-block">
          <h3>Correlation Plot (Uₙ vs Uₙ₊₁)</h3>
          <p className="chart-note">
            A random sequence should show no pattern. Structured patterns indicate correlation.
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[0, 1]}
                label={{ value: "Uₙ", position: "insideBottom", offset: -2 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[0, 1]}
                label={{ value: "Uₙ₊₁", angle: -90, position: "insideLeft" }}
              />
              <Tooltip formatter={(v) => v.toFixed(4)} />
              <Scatter data={scatterData} fill="#e67e22" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
