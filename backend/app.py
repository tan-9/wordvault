from flask import Flask, request, jsonify
from twl06 import check
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit
import random
import string

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

def generate_grid(size=6):
    return [[random.choice(string.ascii_uppercase) for _ in range(size)] for _ in range(size)]

rooms = {}

@app.route('/check_word', methods=['POST'])
def check_word():
    global total_score
    data = request.json
    print(data)
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
    

@app.route('/create-room', methods=['POST'])
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


@app.route('/join-game-room', methods=['POST'])
def joinroom():
    data = request.json
    roomId = data.get("roomId")
    player = data.get("player") 

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
        rooms[roomId]["words"][player] = []  
        rooms[roomId]["scores"][player] = 0

    emit_full_player_list(roomId)
    emit('player_joined', {'player_name': player}, room=roomId)

@socketio.on('leave_room')
def on_leave(data):
    roomId = data['roomId']
    player = data['player']

    if roomId in rooms and player in rooms[roomId]["players"]:
        leave_room(roomId)
        rooms[roomId]["players"].remove(player)
        
        if not rooms[roomId]["players"]:  
            del rooms[roomId]
        else:
            emit_full_player_list(roomId)

@app.route('/room/<roomId>', methods=['GET'])
def get_room(roomId):
    if roomId not in rooms:
        return jsonify({"error": "Room not found"}), 404
    return jsonify(rooms[roomId]), 200

@app.route('/game-results/<roomId>', methods=['GET'])
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



@socketio.on('start_game') #had to add this to start the game for all users
def on_start_game(data):
    roomId = data.get('roomId')

    if roomId in rooms:
        grid = generate_grid()
        rooms[roomId]["grid"] = grid
        print(f"Game started in room: {data.get('roomId')}")
        emit('game_started', {'grid': grid}, room=roomId)  
    else:
        emit('error', {'message': 'Room not found'})

@socketio.on('stop_game')
def on_stop_game(data):
    roomId = data.get('roomId')

    if roomId in rooms:
        room_data = {
            'words': rooms[roomId]["words"],
            'scores': rooms[roomId]["scores"],
            'players': rooms[roomId]["players"]
        }
        print(f"Emitted 'game_stopped' to room with room id {roomId} {room_data}")
        emit('game_stopped', room_data, room=roomId, callback=lambda: print(f"game_stop delivered to room {roomId}"))  
    else:
        emit('error', {'message': 'Room not found'})


@socketio.on("connect")
def handle_connect():
    print("A user connected:", request.sid)


@socketio.on("disconnect")
def handle_disconnect():
    print("A user disconnected:", request.sid)



def emit_full_player_list(roomId):
    socketio.emit('update_players', {'players': rooms[roomId]["players"]}, room=roomId)


if __name__ == '__main__':
    # app.run(debug=True)
    socketio.run(app, debug=True)