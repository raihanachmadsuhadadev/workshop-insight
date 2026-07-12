from flask import Flask, jsonify, request
from flask_cors import CORS
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

app = Flask(__name__)
CORS(app)


def round_metric(value):
    return round(float(value), 4)


def percentage(value):
    return round(float(value) * 100, 2)


def normalize_transactions(raw_transactions):
    cleaned = []

    for transaction in raw_transactions:
        code = str(transaction.get("transaction_code") or "").strip()
        raw_items = transaction.get("items") or []
        items = []

        for item in raw_items:
            if item is None:
                continue

            item_name = str(item).strip()
            if item_name and item_name not in items:
                items.append(item_name)

        if items:
            cleaned.append({
                "transaction_code": code,
                "items": items,
            })

    return cleaned


def build_interpretation(antecedents, consequents):
    left = ", ".join(antecedents)
    right = ", ".join(consequents)
    return f"Jika pelanggan memilih {left}, maka pelanggan cenderung memilih {right}."


def build_recommendation(rule):
    items = rule["antecedents"] + rule["consequents"]
    title = "Paket " + " + ".join(items)

    return {
        "title": title,
        "description": "Item ini sering muncul bersama dalam transaksi bengkel.",
        "items": items,
        "confidence_percentage": rule["confidence_percentage"],
        "support_percentage": rule["support_percentage"],
        "suggestion": "Pertimbangkan membuat paket servis atau promosi gabungan.",
    }


@app.get("/")
def index():
    return jsonify({
        "success": True,
        "service": "Workshop Insight Pattern Analysis Service",
        "message": "Pattern analysis service is running",
        "port": 5002,
    })


@app.post("/analyze")
def analyze():
    payload = request.get_json() or {}
    transactions = normalize_transactions(payload.get("transactions") or [])
    minimum_support = float(payload.get("minimum_support") or 0.2)
    minimum_confidence = float(payload.get("minimum_confidence") or 0.5)

    if minimum_support < 0.01 or minimum_support > 1:
        return jsonify({"success": False, "message": "minimum_support harus berada pada range 0.01 - 1."}), 422

    if minimum_confidence < 0.01 or minimum_confidence > 1:
        return jsonify({"success": False, "message": "minimum_confidence harus berada pada range 0.01 - 1."}), 422

    if len(transactions) < 3:
        return jsonify({"success": False, "message": "Minimal 3 transaksi diperlukan untuk analisis pola."}), 422

    item_lists = [transaction["items"] for transaction in transactions]
    unique_items = sorted({item for items in item_lists for item in items})

    if not unique_items:
        return jsonify({"success": False, "message": "Dataset transaksi tidak memiliki item yang dapat dianalisis."}), 422

    encoder = TransactionEncoder()
    encoded = encoder.fit(item_lists).transform(item_lists)

    import pandas as pd

    dataframe = pd.DataFrame(encoded, columns=encoder.columns_)
    frequent_df = apriori(dataframe, min_support=minimum_support, use_colnames=True)

    frequent_itemsets = []
    for _, row in frequent_df.sort_values("support", ascending=False).iterrows():
        items = sorted(list(row["itemsets"]))
        frequent_itemsets.append({
            "items": items,
            "support": round_metric(row["support"]),
            "support_percentage": percentage(row["support"]),
        })

    rules = []
    if not frequent_df.empty:
        try:
            rules_df = association_rules(frequent_df, metric="confidence", min_threshold=minimum_confidence)
        except TypeError:
            rules_df = association_rules(
                frequent_df,
                metric="confidence",
                min_threshold=minimum_confidence,
                num_itemsets=len(frequent_df),
            )

        if not rules_df.empty:
            rules_df = rules_df.sort_values(["confidence", "lift", "support"], ascending=False)

            for _, row in rules_df.iterrows():
                antecedents = sorted(list(row["antecedents"]))
                consequents = sorted(list(row["consequents"]))
                support = round_metric(row["support"])
                confidence = round_metric(row["confidence"])
                lift = round_metric(row["lift"])

                rules.append({
                    "antecedents": antecedents,
                    "consequents": consequents,
                    "support": support,
                    "confidence": confidence,
                    "lift": lift,
                    "support_percentage": percentage(row["support"]),
                    "confidence_percentage": percentage(row["confidence"]),
                    "interpretation": build_interpretation(antecedents, consequents),
                })

    recommendations = [build_recommendation(rule) for rule in rules[:10]]
    message = "Analisis pola transaksi selesai" if rules else "Analisis selesai, tetapi belum ada aturan kombinasi yang memenuhi parameter."

    return jsonify({
        "success": True,
        "message": message,
        "summary": {
            "total_transactions": len(transactions),
            "total_unique_items": len(unique_items),
            "minimum_support": minimum_support,
            "minimum_confidence": minimum_confidence,
            "total_frequent_itemsets": len(frequent_itemsets),
            "total_rules": len(rules),
        },
        "frequent_itemsets": frequent_itemsets,
        "rules": rules,
        "recommendations": recommendations,
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5002, debug=True)
