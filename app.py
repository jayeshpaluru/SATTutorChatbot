import os
import openai
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
openai.api_key = os.environ.get("OPENAI_API_KEY")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    question = request.form.get("question", "").strip()
    conversation_history = request.form.get("conversation_history", "").strip()

    if not question:
        return jsonify({"error": "Question is missing or empty."}), 400

    try:
        response = generate_response(question, conversation_history)
    except Exception as e:
        return jsonify({"error": f"Error calling GPT-3.5 Turbo: {str(e)}"}), 500

    return jsonify({"response": response})

def generate_response(question, conversation_history):
    prompt = f"{conversation_history}\nUser: {question}\nAI:"
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=2000,
        n=1,
        stop=None,
        temperature=0.7,
    )

    return response.choices[0].text.strip()

if __name__ == "__main__":
    app.run(debug=True)
