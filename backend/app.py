from flask import Flask, request, jsonify
from twl06 import check
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

@app.route('/')
def home():
    return "working"

@app.route('/check_word', methods=['POST'])
def check_word():
    data = request.json
    word = data.get('word', '')
    if word:
        isValid = check(word.lower())
        print(word, " ", isValid )
        return jsonify({'word': word, 'is_Valid': isValid})
    
    return jsonify({'error': 'No word provided'}), 400

if __name__ == '__main__':
    app.run(debug=True)