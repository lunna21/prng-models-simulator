# PRNG Models Simulator

An educational web application that demonstrates how pseudo-random numbers are generated using three classical algorithms:

- **Linear Congruential Generator (LCG)**
- **Multiplicative Congruential Generator (MCG)**
- **Middle-Square Method**

---

## 📐 Algorithms

### Linear Congruential Generator (LCG)

```
X(n+1) = (a × X(n) + c) mod m
```

Parameters: seed `X₀`, multiplier `a`, increment `c`, modulus `m`.
Produces a sequence with period up to `m`. For maximum period, Hull–Dobell conditions must hold.

### Multiplicative Congruential Generator (MCG)

```
X(n+1) = (a × X(n)) mod m
```

Special case of LCG with `c = 0`. The seed must be non-zero and co-prime with `m`.
When `m = 2³¹ − 1` (Mersenne prime) and `a` is a primitive root mod `m`, the period is `m − 1`.

### Middle-Square Method

1. Start with a `d`-digit seed.
2. Square it and zero-pad to `2d` digits.
3. Extract the middle `d` digits as the next value.
4. Repeat.

Proposed by John von Neumann (1946). Historically significant but prone to degenerating sequences.

---

## 🗂️ Project Structure

```
prng-models-simulator/
├── backend/
│   ├── app.py                  # Flask application + REST API
│   ├── requirements.txt
│   ├── tests.py                # Pytest test suite
│   └── generators/
│       ├── __init__.py
│       ├── lcg.py              # LCG algorithm
│       ├── mcg.py              # MCG algorithm
│       └── middle_square.py    # Middle-Square algorithm
└── frontend/
    ├── src/
    │   ├── App.jsx             # Main application component
    │   ├── App.css
    │   └── components/
    │       ├── MethodSelector.jsx   # Choose generator
    │       ├── Controls.jsx         # Parameter inputs
    │       ├── FormulaPanel.jsx     # Formula & explanation
    │       ├── ResultTable.jsx      # Step-by-step table
    │       └── SequenceChart.jsx    # Visualizations (Recharts)
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+

---

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The Flask server starts at **http://localhost:5000**.

#### Run tests

```bash
cd backend
pip install pytest
pytest tests.py -v
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The React app starts at **http://localhost:5173**.

> Make sure the backend is running first so the API calls succeed.

---

## 🔌 API Endpoints

All endpoints accept `POST` with a JSON body and return JSON.

### `POST /generate/lcg`

```json
{ "seed": 7, "a": 5, "c": 3, "m": 16, "count": 10 }
```

### `POST /generate/mcg`

```json
{ "seed": 7, "a": 5, "m": 16, "count": 10 }
```

### `POST /generate/middle-square`

```json
{ "seed": 1234, "iterations": 10 }
```

### Response shape (all endpoints)

```json
{
  "sequence":   [6, 1, 8, 11, 10],
  "normalized": [0.375, 0.0625, 0.5, 0.6875, 0.625],
  "steps": [
    {
      "iteration": 1,
      "x_prev": 7,
      "formula": "(5 × 7 + 3) mod 16",
      "x_next": 6,
      "normalized": 0.375
    }
  ]
}
```

---

## 📊 Example Inputs

| Generator | Parameters | Expected first 5 values |
|-----------|-----------|------------------------|
| LCG | X₀=7, a=5, c=3, m=16 | 6, 1, 8, 11, 10 |
| MCG | X₀=7, a=5, m=16 | 3, 15, 11, 7, 3 ← cycle! |
| Middle-Square | seed=1234 | 5227, 3215, 3362, 3030, 1809 |

---

## ✨ Features

- **Step-by-step table** — shows each iteration with intermediate calculations
- **Sequence plot** — visualizes Uₙ over iterations
- **Correlation plot** — plots Uₙ vs Uₙ₊₁ to reveal patterns
- **Cycle detection** — warns when a value repeats (period discovered)
- **Formula panel** — explains the selected algorithm with parameters and examples

