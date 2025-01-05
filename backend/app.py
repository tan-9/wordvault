from flask import Flask, request, jsonify
from twl06 import check
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

LETTER_SCORES = {
    'a': 1, 'b': 3, 'c': 3, 'd': 2, 'e': 1, 'f': 4, 'g': 2, 'h': 4,
    'i': 1, 'j': 8, 'k': 5, 'l': 1, 'm': 3, 'n': 1, 'o': 1, 'p': 3,
    'q': 10, 'r': 1, 's': 1, 't': 1, 'u': 1, 'v': 4, 'w': 4, 'x': 8,
    'y': 4, 'z': 10
}

total_score = 0


def calc_score(word):
    global total_score
    score = sum(LETTER_SCORES.get(char, 0) for char in word.lower())
    return score


@app.route('/')
def home():
    return "working"

@app.route('/check_word', methods=['POST'])
def check_word():
    global total_score
    data = request.json
    print(data)
    word = data.get('word', '')
    isValid = check(word.lower())

    if isValid:
        score = calc_score(word)
        total_score += score
        print(total_score)
    
    print(word, " ", isValid, " ", score )
    return jsonify({'word': word, 'is_Valid': isValid, 'score': score, 'total_score': total_score})



if __name__ == '__main__':
    app.run(debug=True)