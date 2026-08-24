import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from config import Config
from routes.rooms import rooms_bp
from routes.words import words_bp
from sockets.gameEvents import register_socket_events

app = Flask(__name__)
CORS(app, origins=Config.ALLOWED_ORIGINS)
socketio = SocketIO(app, cors_allowed_origins=Config.ALLOWED_ORIGINS)

register_socket_events(socketio)

app.register_blueprint(rooms_bp)
app.register_blueprint(words_bp)


@app.route('/')
def index():
    return "WordVault backend is running!"


if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)