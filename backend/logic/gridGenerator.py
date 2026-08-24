import random
import string

def generate_grid(size=6):
    return [[random.choice(string.ascii_uppercase) for _ in range(size)] for _ in range(size)]