## PRNG Bank Queue Simulator — Build Prompt

**Reference file:** Proyecto de referencia de modelos de simulación — contains the reference implementations and expected behavior for all three generators and statistical tests. Consult it for formulas, parameters, and validation data.

**Stack:** React + Three.js (3D visualization) + shadcn/ui (components)

---

### What to Build

A single-page interactive application in `/frontend-threejs/` with three integrated parts:

---

**Part 1 — Three PRNGs**

Implement these generators (reference `/backend/generators` or inline them):
- **Linear Congruential:** `Xₙ₊₁ = (a·Xₙ + c) mod m`
- **Multiplicative Congruential:** `Xₙ₊₁ = (a·Xₙ) mod m`
- **Middle Square:** extract middle digits of `Xₙ²`

Each accepts configurable seed + parameters and outputs numbers in `[0, 1)`.

---

**Part 2 — Three Statistical Tests**

Each test receives a number sequence and returns `{ statistic, criticalValue, pass/fail, details }`:

- **Chi-Square (χ²):** divide `[0,1)` into k bins, compare observed vs expected frequencies
- **Kolmogorov-Smirnov:** max deviation of empirical CDF from uniform theoretical CDF
- **Poker Test:** group into 5-digit hands, classify patterns (all diff / pair / two pair / trips / full house / quads / five of a kind), run χ² on frequencies

---

**Part 3 — Bank Queue Simulation (Discrete-Event)**

FIFO queue simulation driven by PRNG output:
- Configurable: number of servers, arrival rate λ, service rate μ, customer count
- Track per customer: arrival, wait, service start, service end, departure
- Support step-by-step (forward/back/jump) and auto-run with speed control
- Output table must keep this structure (in order): Cliente, R Llegada, T. Llegada, Llegada, Espera, Inicio Serv., R Servicio, T. Servicio, Fin Serv., Servidor

---

**Part 4 — Interface Layout**

- **Main view (center):** Three.js 3D scene — animated bank floor with server windows, waiting area, customers moving through the system. Color-coded: idle server / busy server / waiting customer / departing customer
- **Controls panel (bottom-left):** generator selector, simulation controls (step/play/pause/speed), plus a **"⚙ Configure"** button
- **Configuration dialog** (triggered from controls): full-screen expandable, with a sidebar/tabs organizing:
  - *Generator tab:* seed + params, generate N values, sequence table, run all 3 tests side-by-side with pass/fail indicators and charts
  - *Compare tab:* run all 3 generators simultaneously and compare test results
  - *Simulation tab:* configure servers/rates/customers, view full results table, summary stats (avg wait, utilization, max queue length)
  - *Equations tab:* display all mathematical formulas for generators and tests (for professional users)

---

**Global Requirements**

- All results reproducible from seed
- Works without math knowledge (clear pass/fail UI), but shows equations for experts
- Handles edge cases: empty queue, single server, degenerate params, sequences up to 10,000, simulations up to 1,000 customers
- shadcn/ui for all UI components; Three.js for the 3D bank visualization
