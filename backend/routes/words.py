from flask import Blueprint, request, jsonify
from twl06 import check
from logic.scoring import calc_score
from state import rooms

words_bp = Blueprint('words', __name__)


@words_bp.route('/check_word', methods=['POST'])
def check_word():
    data = request.json
    word = data.get('word', '')
    player = data.get('player', '')
    roomId = data.get('roomId', '')

    if roomId not in rooms:
        return jsonify({'error': 'Room not found'}), 404

    isValid = check(word.lower())

    if isValid:
        score = calc_score(word)

        if player not in rooms[roomId]["words"]:
            rooms[roomId]["words"][player] = []

        if player not in rooms[roomId]["scores"]:
            rooms[roomId]["scores"][player] = 0

        if not any(w["word"] == word for w in rooms[roomId]["words"][player]):
            word_data = {"word": word, "score": score}
            rooms[roomId]["words"][player].append(word_data)
            rooms[roomId]["scores"][player] += score

        return jsonify({'word': word, 'is_Valid': isValid, 'score': score, 'total_score': rooms[roomId]["scores"][player]})

    return jsonify({
        'word': word,
        'is_Valid': isValid,
        'score': 0
    })