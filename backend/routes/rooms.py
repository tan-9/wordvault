import random
import string
from flask import Blueprint, request, jsonify
from state import rooms, emit_full_player_list

rooms_bp = Blueprint('rooms', __name__)


@rooms_bp.route('/create-room', methods=['POST'])
def create_room():
    data = request.json
    player = data.get("player")

    def generate_room_id():
        return ''.join(random.choices(string.digits, k=5))

    roomId = generate_room_id()

    while roomId in rooms:
        roomId = generate_room_id()

    rooms[roomId] = {
        "players": [player],
        "words": {player: []},
        "scores": {player: 0},
        "grid": []
    }

    return jsonify({'roomId': roomId}), 201


@rooms_bp.route('/join-game-room', methods=['POST'])
def joinroom():
    data = request.json
    roomId = data.get("roomId")
    player = data.get("player")

    if roomId not in rooms:
        return jsonify({"error": "room not found"}), 404

    if player in rooms[roomId]["players"]:
        return jsonify({"error": "Player already in room"}), 400

    rooms[roomId]["players"].append(player)
    if player not in rooms[roomId]["words"]:
        rooms[roomId]["words"][player] = []
    if player not in rooms[roomId]["scores"]:
        rooms[roomId]["scores"][player] = 0

    emit_full_player_list(roomId)
    return jsonify({"message": f"{player} joined room {roomId}"}), 200


@rooms_bp.route('/room/<roomId>', methods=['GET'])
def get_room(roomId):
    if roomId not in rooms:
        return jsonify({"error": "Room not found"}), 404
    return jsonify(rooms[roomId]), 200


@rooms_bp.route('/game-results/<roomId>', methods=['GET'])
def get_game_results(roomId):
    if roomId not in rooms:
        print(f"Room {roomId} not found")  # Add logging
        return jsonify({"error": "Room not found"}), 404
    print(f"Fetching game results for room {roomId}")  # Add logging
    return jsonify({
        'words': rooms[roomId]["words"],
        'scores': rooms[roomId]["scores"],
        'players': rooms[roomId]["players"]
    })