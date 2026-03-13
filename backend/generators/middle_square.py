"""
Middle-Square Method

Algorithm:
  1. Take the seed and square it.
  2. Zero-pad the result to 2*d digits (where d is the number of digits in the seed).
  3. Extract the middle d digits as the next value.
  4. Repeat.

Parameters:
    seed: initial value (integer with d digits)
    iterations: number of values to generate
"""


def generate(seed: int, iterations: int) -> dict:
    """
    Generate pseudo-random numbers using the Middle-Square method.

    Returns a dict with:
      - sequence: list of generated integers
      - steps: list of dicts with intermediate calculations per iteration
      - normalized: list of floats in [0, 1)
      - digits: number of digits used (d)
    """
    if seed < 0:
        raise ValueError("Seed must be a non-negative integer.")
    if iterations <= 0:
        raise ValueError("Iterations must be a positive integer.")
    if iterations > 10000:
        raise ValueError("Iterations must not exceed 10,000.")

    # Determine number of digits d (use at least 2 digits)
    d = max(len(str(seed)), 2)
    max_val = 10 ** d

    sequence = []
    steps = []
    x = seed

    for i in range(iterations):
        x_prev = x
        squared = x_prev ** 2
        padded = str(squared).zfill(2 * d)
        mid_start = d // 2
        x_next = int(padded[mid_start: mid_start + d])
        normalized = x_next / max_val

        steps.append({
            "iteration": i + 1,
            "x_prev": x_prev,
            "squared": squared,
            "padded": padded,
            "extracted": padded[mid_start: mid_start + d],
            "x_next": x_next,
            "normalized": round(normalized, 6),
        })
        sequence.append(x_next)
        x = x_next

    return {
        "sequence": sequence,
        "steps": steps,
        "normalized": [round(v / max_val, 6) for v in sequence],
        "digits": d,
    }
