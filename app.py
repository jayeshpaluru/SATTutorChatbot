import openai
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
openai.api_key = "your_api_key"

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
        return jsonify({"error": f"Error calling Tutor: {str(e)}"}), 500

    return jsonify({"response": response})

def generate_response(question, conversation_history):
    # Format conversation history and current question as messages
    messages = [{"role": "system", "content": "You are a helpful SAT/ACT tutor."}]
    if conversation_history:
        messages.append({"role": "user", "content": conversation_history})
    messages.append({"role": "user", "content": question})

    # Use the gpt-3.5-turbo model for the response
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=2000
    )

    # Extract and return the assistant's reply
    return response['choices'][0]['message']['content'].strip()

if __name__ == "__main__":
    app.run(debug=True)
