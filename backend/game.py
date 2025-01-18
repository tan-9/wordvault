import sqlite3

def initialise_db():
    conn = sqlite3.connect('gameData.db')
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        data TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roomId TEXT,
        name TEXT,
        words TEXT DEFAULT '[]',
        total_score INTEGER DEFAULT 0,
        FOREIGN KEY(room_id) REFERENCES rooms(id)
    )
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    initialise_db()
    print("Database initialised successfully")
