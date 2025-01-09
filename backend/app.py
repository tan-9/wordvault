from flask import Flask, request, jsonify
from twl06 import check
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit
import uuid

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins = "*")

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

rooms = {}

@app.route('/create-room', methods=['POST'])
def create_room():
    data = request.json
    player = data.get("player")

    roomId = str(uuid.uuid4())
    rooms[roomId] = {"players": [player]}
    print(rooms[roomId]["players"])
    return jsonify({'roomId':roomId}), 201

@app.route('/join-game-room', methods=['POST'])
def joinroom():
    data = request.json
    roomId = data.get("roomId")
    player = data.get("player") #within double quotes is the key

    if roomId not in rooms:
        return jsonify({"error": "room not found"}), 404
    
    if player in rooms[roomId]["players"]:
        return jsonify({"error": "Player already in room"}), 400
    
    rooms[roomId]["players"].append(player)
    emit_full_player_list(roomId)
    return jsonify({"message": f"{player} joined room {roomId}"}), 200

@socketio.on('join_room')
def on_join(data):
    roomId = data['roomId']
    player = data['player']

    if roomId not in rooms:
        emit('error', {'message': 'Room not found'})
        return
    
    join_room(roomId)
    if player not in rooms[roomId]["players"]:
        rooms[roomId]["players"].append(roomId)

    emit_full_player_list(roomId)
    # emit('player_joined', {'player_name': player}, room=roomId)

@socketio.on('leave_room')
def on_leave(data):
    roomId = data['roomId']
    player = data['player']

    if roomId in rooms and player in rooms[roomId]["players"]:
        leave_room(roomId)
        rooms[roomId]["players"].remove(player)
        
        if not rooms[roomId]["players"]:  # If room is empty, remove it
            del rooms[roomId]
        else:
            emit_full_player_list(roomId)

@app.route('/room/<roomId>', methods=['GET'])
def get_room(roomId):
    if roomId not in rooms:
        return jsonify({"error": "Room not found"}), 404
    return jsonify(rooms[roomId]), 200

@socketio.on('start_game')
def on_start_game(data):
    room_id = data.get('roomId')

    if room_id in rooms:
        print(f"Game started in room: {data.get('roomId')}")
        emit('game_started', {}, room=room_id)  
    else:
        emit('error', {'message': 'Room not found'})


def emit_full_player_list(room_id):
    socketio.emit('update_players', {'players': rooms[room_id]["players"]}, room=room_id)


if __name__ == '__main__':
    # app.run(debug=True)
    socketio.run(app, debug=True)