from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.get("/")
def index():
    return jsonify({
        "success": True,
        "service": "Star Motor Apriori Service",
        "message": "Apriori service is running",
        "port": 5002
    })

@app.post("/analyze")
def analyze():
    payload = request.get_json() or {}

    return jsonify({
        "success": True,
        "message": "Apriori analysis endpoint is ready",
        "input": payload,
        "frequent_itemsets": [],
        "rules": [],
        "recommendations": []
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5002, debug=True)