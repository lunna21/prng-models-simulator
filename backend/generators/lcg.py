"""
Linear Congruential Generator (LCG)

Formula: X(n+1) = (a * X(n) + c) mod m

Parameters:
    seed (X0): initial value
    a: multiplier
    c: increment
    m: modulus
    count: number of values to generate
"""


def generate(seed: int, a: int, c: int, m: int, count: int) -> dict:
    """
    Generate pseudo-random numbers using the Linear Congruential Generator.

    Returns a dict with:
      - sequence: list of generated integers
      - steps: list of dicts with intermediate calculations per iteration
      - normalized: list of floats in [0, 1)
    """
    if m <= 0:
        raise ValueError("Modulus m must be a positive integer greater than 0.")
    if count <= 0:
        raise ValueError("Count must be a positive integer.")
    if count > 10000:
        raise ValueError("Count must not exceed 10,000.")

    sequence = []
    steps = []
    x = seed % m

    for i in range(count):
        x_prev = x
        x_next = (a * x_prev + c) % m
        normalized = x_next / m if m > 0 else 0.0
        steps.append({
            "iteration": i + 1,
            "x_prev": x_prev,
            "formula": f"({a} × {x_prev} + {c}) mod {m}",
            "x_next": x_next,
            "normalized": round(normalized, 6),
        })
        sequence.append(x_next)
        x = x_next

    return {
        "sequence": sequence,
        "steps": steps,
        "normalized": [round(v / m, 6) for v in sequence],
    }
