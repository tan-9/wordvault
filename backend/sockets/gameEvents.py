import os

from flask import request
from flask_socketio import join_room, leave_room, emit
from logic.gridGenerator import generate_grid_hybrid, build_trie
from state import rooms, set_emit_full_player_list

GRID_SIZE = 6

_WORD_LIST_PATH = os.path.join(
    os.path.dirname(__file__), "..", "logic", "word-lists", "allWords.txt"
)

with open(_WORD_LIST_PATH) as f:
    _ALL_WORDS = [line.strip().upper() for line in f if line.strip()]

_SEED_WORDS = [w for w in _ALL_WORDS if 3 <= len(w) <= GRID_SIZE]
_TRIE = build_trie(_ALL_WORDS)


def register_socket_events(socketio):
    def emit_full_player_list(roomId):
        socketio.emit('update_players', {'players': rooms[roomId]["players"]}, room=roomId)

    set_emit_full_player_list(emit_full_player_list)

    @socketio.on('start_game')
    def on_start_game(data):
        roomId = data.get('roomId')
        if roomId not in rooms:
            emit('error', {'message': 'Room not found'})
            return

        grid, _, _ = generate_grid_hybrid(
            size=GRID_SIZE,
            corpus=_ALL_WORDS,
            seed_word_bank=_SEED_WORDS,
            trie=_TRIE,
        )
        rooms[roomId]["grid"] = grid
        socketio.emit('game_started', {'grid': grid}, room=roomId)

    @socketio.on('join_room')
    def on_join(data):
        roomId = data['roomId']
        player = data['player']

        if roomId not in rooms:
            emit('error', {'message': 'Room not found'})
            return

        join_room(roomId)
        if player not in rooms[roomId]["players"]:
            rooms[roomId]["players"].append(player)
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