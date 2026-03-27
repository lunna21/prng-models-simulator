from flask import Flask, request, jsonify
from flask_cors import CORS

from generators import lcg, mcg, middle_square

app = Flask(__name__)
CORS(app)


@app.route("/generate/lcg", methods=["POST"])
def generate_lcg():
    data = request.get_json(force=True)
    try:
        seed = int(data["seed"])
        a = int(data["a"])
        c = int(data["c"])
        m = int(data["m"])
        count = int(data["count"])
    except (KeyError, ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid or missing parameter: {e}"}), 400

    try:
        result = lcg.generate(seed=seed, a=a, c=c, m=m, count=count)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(result)


@app.route("/generate/mcg", methods=["POST"])
def generate_mcg():
    data = request.get_json(force=True)
    try:
        seed = int(data["seed"])
        a = int(data["a"])
        m = int(data["m"])
        count = int(data["count"])
    except (KeyError, ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid or missing parameter: {e}"}), 400

    try:
        result = mcg.generate(seed=seed, a=a, m=m, count=count)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(result)


@app.route("/generate/middle-square", methods=["POST"])
def generate_middle_square():
    data = request.get_json(force=True)
    try:
        seed = int(data["seed"])
        iterations = int(data["iterations"])
    except (KeyError, ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid or missing parameter: {e}"}), 400

    try:
        result = middle_square.generate(seed=seed, iterations=iterations)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=False, port=5000)
