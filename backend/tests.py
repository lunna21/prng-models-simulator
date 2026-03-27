"""
Tests for the PRNG backend — generators and Flask API endpoints.
Run with: pytest tests.py -v  (from the backend/ directory)
"""
import sys
import os
import pytest

sys.path.insert(0, os.path.dirname(__file__))

from generators import lcg, mcg, middle_square
from app import app


# ---------------------------------------------------------------------------
# LCG tests
# ---------------------------------------------------------------------------

class TestLCG:
    def test_basic_sequence(self):
        result = lcg.generate(seed=7, a=5, c=3, m=16, count=5)
        assert result["sequence"] == [6, 1, 8, 11, 10]

    def test_normalized_range(self):
        result = lcg.generate(seed=7, a=5, c=3, m=16, count=10)
        for v in result["normalized"]:
            assert 0.0 <= v < 1.0

    def test_step_count(self):
        result = lcg.generate(seed=0, a=1664525, c=1013904223, m=2**32, count=20)
        assert len(result["steps"]) == 20
        assert len(result["sequence"]) == 20

    def test_step_formula_string(self):
        result = lcg.generate(seed=7, a=5, c=3, m=16, count=1)
        assert result["steps"][0]["formula"] == "(5 × 7 + 3) mod 16"

    def test_invalid_modulus(self):
        with pytest.raises(ValueError, match="Modulus"):
            lcg.generate(seed=7, a=5, c=3, m=0, count=5)

    def test_invalid_count(self):
        with pytest.raises(ValueError):
            lcg.generate(seed=7, a=5, c=3, m=16, count=0)

    def test_count_too_large(self):
        with pytest.raises(ValueError):
            lcg.generate(seed=7, a=5, c=3, m=16, count=10001)

    def test_c_zero_is_mcg_behavior(self):
        """LCG with c=0 should behave like MCG."""
        result = lcg.generate(seed=7, a=5, c=0, m=16, count=3)
        assert result["sequence"] == [3, 15, 11]


# ---------------------------------------------------------------------------
# MCG tests
# ---------------------------------------------------------------------------

class TestMCG:
    def test_basic_sequence(self):
        result = mcg.generate(seed=7, a=5, m=16, count=5)
        assert result["sequence"] == [3, 15, 11, 7, 3]

    def test_normalized_range(self):
        result = mcg.generate(seed=7, a=5, m=16, count=5)
        for v in result["normalized"]:
            assert 0.0 <= v < 1.0

    def test_zero_seed_raises(self):
        with pytest.raises(ValueError, match="non-zero"):
            mcg.generate(seed=0, a=5, m=16, count=5)

    def test_invalid_modulus(self):
        with pytest.raises(ValueError, match="Modulus"):
            mcg.generate(seed=7, a=5, m=0, count=5)

    def test_step_formula_string(self):
        result = mcg.generate(seed=7, a=5, m=16, count=1)
        assert result["steps"][0]["formula"] == "(5 × 7) mod 16"

    def test_count_too_large(self):
        with pytest.raises(ValueError):
            mcg.generate(seed=7, a=5, m=16, count=10001)


# ---------------------------------------------------------------------------
# Middle-Square tests
# ---------------------------------------------------------------------------

class TestMiddleSquare:
    def test_basic_sequence(self):
        result = middle_square.generate(seed=1234, iterations=3)
        assert result["sequence"][0] == 5227

    def test_digits_computed(self):
        result = middle_square.generate(seed=1234, iterations=1)
        assert result["digits"] == 4

    def test_normalized_range(self):
        result = middle_square.generate(seed=1234, iterations=5)
        for v in result["normalized"]:
            assert 0.0 <= v <= 1.0

    def test_negative_seed_raises(self):
        with pytest.raises(ValueError, match="non-negative"):
            middle_square.generate(seed=-1, iterations=5)

    def test_invalid_iterations(self):
        with pytest.raises(ValueError):
            middle_square.generate(seed=1234, iterations=0)

    def test_iterations_too_large(self):
        with pytest.raises(ValueError):
            middle_square.generate(seed=1234, iterations=10001)

    def test_step_has_expected_keys(self):
        result = middle_square.generate(seed=1234, iterations=1)
        step = result["steps"][0]
        for key in ("iteration", "x_prev", "squared", "padded", "extracted", "x_next", "normalized"):
            assert key in step, f"Missing key: {key}"


# ---------------------------------------------------------------------------
# Flask API endpoint tests
# ---------------------------------------------------------------------------

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


class TestAPI:
    def test_lcg_endpoint(self, client):
        r = client.post("/generate/lcg", json={"seed": 7, "a": 5, "c": 3, "m": 16, "count": 5})
        assert r.status_code == 200
        data = r.get_json()
        assert data["sequence"] == [6, 1, 8, 11, 10]

    def test_mcg_endpoint(self, client):
        r = client.post("/generate/mcg", json={"seed": 7, "a": 5, "m": 16, "count": 5})
        assert r.status_code == 200
        data = r.get_json()
        assert data["sequence"] == [3, 15, 11, 7, 3]

    def test_middle_square_endpoint(self, client):
        r = client.post("/generate/middle-square", json={"seed": 1234, "iterations": 5})
        assert r.status_code == 200
        data = r.get_json()
        assert len(data["sequence"]) == 5

    def test_missing_param_returns_400(self, client):
        r = client.post("/generate/lcg", json={"seed": 7, "a": 5, "c": 3})
        assert r.status_code == 400
        assert "error" in r.get_json()

    def test_invalid_modulus_returns_400(self, client):
        r = client.post("/generate/lcg", json={"seed": 7, "a": 5, "c": 3, "m": 0, "count": 5})
        assert r.status_code == 400

    def test_mcg_zero_seed_returns_400(self, client):
        r = client.post("/generate/mcg", json={"seed": 0, "a": 5, "m": 16, "count": 5})
        assert r.status_code == 400

    def test_middle_square_negative_seed_returns_400(self, client):
        r = client.post("/generate/middle-square", json={"seed": -1, "iterations": 5})
        assert r.status_code == 400

    def test_response_has_all_keys(self, client):
        r = client.post("/generate/lcg", json={"seed": 7, "a": 5, "c": 3, "m": 16, "count": 3})
        data = r.get_json()
        for key in ("sequence", "steps", "normalized"):
            assert key in data

    def test_get_method_not_allowed(self, client):
        r = client.get("/generate/lcg")
        assert r.status_code == 405
