from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
import uuid
import os

app = Flask(__name__)
CORS(app)

# Load knowledge base
with open('knowledge_base.json', 'r') as f:
    raw_data = json.load(f)

# Clean duplicate keys
faq_data = {}
for key, value in raw_data.items():
    clean_key = re.sub(r'\s+\d+$', '', key).strip().lower()
    if clean_key not in faq_data:
        faq_data[clean_key] = value

faq_questions = list(faq_data.keys())

FEEDBACK_FILE = "feedback_log.json"
TICKETS_FILE = "tickets.json"

# Build TF-IDF vectors once at startup
vectorizer = TfidfVectorizer(stop_words='english')
faq_vectors = vectorizer.fit_transform(faq_questions)


def find_best_match(user_query):
    user_query_clean = user_query.lower().strip()
    user_vector = vectorizer.transform([user_query_clean])
    similarities = cosine_similarity(user_vector, faq_vectors)[0]

    best_index = int(np.argmax(similarities))
    best_score = similarities[best_index]
    matched_question = faq_questions[best_index]

    if best_score >= 0.80:
        return faq_data[matched_question], round(float(best_score), 2)
    elif 0.5 <= best_score < 0.80:
        return f"Did you mean '{matched_question}'?", round(float(best_score), 2)
    else:
        return "Sorry, I couldn't understand clearly. Please describe the issue in more detail.", 0.0


@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '').strip()

    if not user_message:
        return jsonify({'response': 'Please enter a message.', 'confidence': 0})

    response, confidence = find_best_match(user_message)

    user_vector = vectorizer.transform([user_message.lower().strip()])
    similarities = cosine_similarity(user_vector, faq_vectors)[0]
    best_index = int(np.argmax(similarities))
    matched_question = faq_questions[best_index] if confidence > 0 else None

    return jsonify({
        "response": response,
        "confidence": confidence,
        "matched_question": matched_question
    })


@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.get_json()

    entry = {
        "query": data.get("query"),
        "matched_question": data.get("matched_question"),
        "confidence": data.get("confidence"),
        "feedback": data.get("feedback"),
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    with open(FEEDBACK_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")

    return jsonify({"status": "success"})


@app.route('/analytics', methods=['GET'])
def analytics():
    total_queries = 0
    positive = 0
    negative = 0
    confidence_sum = 0

    try:
        with open(FEEDBACK_FILE, "r") as f:
            for line in f:
                entry = json.loads(line)
                total_queries += 1
                confidence_sum += entry.get("confidence", 0)
                if entry.get("feedback") == "positive":
                    positive += 1
                elif entry.get("feedback") == "negative":
                    negative += 1

        avg_confidence = round((confidence_sum / total_queries), 2) if total_queries > 0 else 0

        return jsonify({
            "total_queries": total_queries,
            "positive_feedback": positive,
            "negative_feedback": negative,
            "average_confidence": avg_confidence
        })

    except FileNotFoundError:
        return jsonify({
            "total_queries": 0,
            "positive_feedback": 0,
            "negative_feedback": 0,
            "average_confidence": 0
        })


@app.route('/suggest', methods=['GET'])
def suggest():
    query = request.args.get("q", "").lower().strip()

    if not query:
        return jsonify([])

    suggestions = [
        question for question in faq_questions
        if query in question
    ]

    return jsonify(suggestions[:5])


@app.route('/ticket', methods=['POST'])
def create_ticket():
    data = request.get_json()

    print("TICKET REQUEST RECEIVED")
    print(data)

    try:
        with open(TICKETS_FILE, 'r') as f:
            tickets = json.load(f)
    except FileNotFoundError:
        tickets = []

    ticket_number = f"TKT-{datetime.datetime.now().strftime('%Y%m%d')}-{str(len(tickets) + 1).zfill(4)}"

    ticket = {
        "ticket_id": ticket_number,
        "query": data.get("query"),
        "matched_question": data.get("matched_question"),
        "confidence": data.get("confidence"),
        "status": "Open",
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    tickets.append(ticket)

    print("Saving ticket:", ticket)

    with open(TICKETS_FILE, 'w') as f:
        json.dump(tickets, f, indent=2)c

    return jsonify({"ticket_id": ticket_number, "status": "Open"})


@app.route('/tickets', methods=['GET'])
def get_tickets():
    try:
        with open(TICKETS_FILE, 'r') as f:
            tickets = json.load(f)
        return jsonify(tickets)
    except FileNotFoundError:
        return jsonify([])


@app.route('/ticket/close', methods=['POST'])
def close_ticket():
    data = request.get_json()
    ticket_id = data.get("ticket_id")

    try:
        with open(TICKETS_FILE, 'r') as f:
            tickets = json.load(f)

        for t in tickets:
            if t["ticket_id"] == ticket_id:
                t["status"] = "Closed"

        with open(TICKETS_FILE, 'w') as f:
            json.dump(tickets, f, indent=2)

        return jsonify({"status": "success"})
    except FileNotFoundError:
        return jsonify({"status": "error"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
