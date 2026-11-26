rooms = {}

_emit_full_player_list = None


def set_emit_full_player_list(fn):
    global _emit_full_player_list
    _emit_full_player_list = fn


def emit_full_player_list(roomId):
    if _emit_full_player_list is not None:
        _emit_full_player_list(roomId)
