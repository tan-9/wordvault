import logging
import os
import random

from flask import request
from flask_socketio import join_room, leave_room, emit
from logic.gridGenerator import build_ngram_model, generate_grid, seed_tiles
from state import rooms, set_emit_full_player_list
from twl06 import check

GRID_SIZE = 6

_WORD_LIST_PATH = os.path.join(
    os.path.dirname(__file__), "..", "logic", "word-lists", "allWords.txt"
)

with open(_WORD_LIST_PATH) as f:
    _LETTER_MODEL = build_ngram_model(line.strip() for line in f)


def _load_seed_words():
    path = os.path.join(os.path.dirname(_WORD_LIST_PATH), "seedWords.txt")
    with open(path, encoding="utf-8-sig") as source:
        words = dict.fromkeys(line.strip().upper() for line in source if line.strip())
    eligible = []
    for word in words:
        # Any two eligible words must fit even if they share no tiles.
        if 0 < len(seed_tiles(word)) <= GRID_SIZE ** 2 // 2 and check(word.lower()):
            eligible.append(word)
        else:
            logging.getLogger(__name__).warning("Skipping unplayable seed word %s", word)
    return tuple(eligible)

_SEED_WORDS = _load_seed_words()

def _draw_words(room):
    deck = room.setdefault("_seed_deck", [])
    drawn = []
    for _ in range(min(2, len(_SEED_WORDS))):
        if not deck:
            deck.extend(_SEED_WORDS)
            random.shuffle(deck)
            # With an odd-sized pool the new cycle can start mid-draw.
            if deck[-1] in drawn:
                deck[0], deck[-1] = deck[-1], deck[0]
        drawn.append(deck.pop())
    return drawn


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

        grid, _, _ = generate_grid(size=GRID_SIZE, models=_LETTER_MODEL,
                                   drawn_words=_draw_words(rooms[roomId]))
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
