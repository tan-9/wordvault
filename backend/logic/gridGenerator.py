import random
import string
from collections import defaultdict, Counter

VOWELS = set("AEIOU")
MAX_PLACEMENT_NODES = 250

def is_vowel(ch):
    return ch in VOWELS


def build_ngram_model(word_list, n=3):
    """
    Build order-(n-1) letter transition counts from a corpus of words.
    models[k][context] -> Counter(next_letter -> count), k = 0..n-1, so
    sampling can back off to a shorter context when a longer one is
    unseen/sparse (Katz/Kneser-Ney-style backoff).
    """
    models = {k: defaultdict(Counter) for k in range(n)}
    unigram = Counter()

    for word in word_list:
        w = word.upper()
        if not w.isalpha():
            continue
        for i, ch in enumerate(w):
            unigram[ch] += 1
            for k in range(1, n):
                if i - k < 0:
                    continue
                context = w[i - k:i]
                models[k][context][ch] += 1

    models[0][""] = unigram
    return models


def _sample_from_counter(counter, rng):
    letters, weights = zip(*counter.items())
    return rng.choices(letters, weights=weights, k=1)[0]


def next_letter(models, context, max_k, rng, forced_set=None):
    for k in range(min(max_k, len(context)), -1, -1):
        ctx = context[-k:] if k else ""
        counter = models.get(k, {}).get(ctx)
        if not counter:
            continue
        if forced_set:
            filtered = Counter({c: w for c, w in counter.items() if c in forced_set})
            if filtered:
                return _sample_from_counter(filtered, rng)
            continue
        return _sample_from_counter(counter, rng)
    pool = forced_set if forced_set else string.ascii_uppercase
    return rng.choice(list(pool))


def snake_order(size):
    order = []
    for r in range(size):
        cols = range(size) if r % 2 == 0 else range(size - 1, -1, -1)
        order.extend((r, c) for c in cols)
    return order


def spiral_order(size):
    order = []
    top, bottom, left, right = 0, size - 1, 0, size - 1
    while top <= bottom and left <= right:
        order.extend((top, c) for c in range(left, right + 1))
        top += 1
        order.extend((r, right) for r in range(top, bottom + 1))
        right -= 1
        if top <= bottom:
            order.extend((bottom, c) for c in range(right, left - 1, -1))
            bottom -= 1
        if left <= right:
            order.extend((r, left) for r in range(bottom, top - 1, -1))
            left += 1
    return order


FILL_ORDERS = {"snake": snake_order, "spiral": spiral_order}


def _king_neighbors(r, c, size):
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == 0 and dc == 0:
                continue
            nr, nc = r + dr, c + dc
            if 0 <= nr < size and 0 <= nc < size:
                yield nr, nc

def try_place_word(grid, word, rng, max_starts=None, max_nodes=None):
    """
    Backtrack `word` onto a self-avoiding king-move path. Empty cells get
    the word's letter; already-filled cells must already match (a
    crossword-style intersection). Returns the path (list of (r,c)) on
    success, mutating `grid` in place, or None if no path exists.
    """
    size = len(grid)
    word = word.upper()
    starts = [(r, c) for r in range(size) for c in range(size)]
    rng.shuffle(starts)
    if max_starts:
        starts = starts[:max_starts]

    def backtrack(path, visited):
        nonlocal max_nodes
        if max_nodes is not None:
            if max_nodes == 0:
                return None
            max_nodes -= 1
        i = len(path)
        if i == len(word):
            return path
        r, c = path[-1]
        candidates = list(_king_neighbors(r, c, size))
        rng.shuffle(candidates)
        for nr, nc in candidates:
            if (nr, nc) in visited:
                continue
            cell = grid[nr][nc]
            if cell is not None and cell != word[i]:
                continue
            visited.add((nr, nc))
            path.append((nr, nc))
            result = backtrack(path, visited)
            if result:
                return result
            path.pop()
            visited.remove((nr, nc))
        return None

    for (r, c) in starts:
        cell = grid[r][c]
        if cell is not None and cell != word[0]:
            continue
        result = backtrack([(r, c)], {(r, c)})
        if result:
            for (pr, pc), ch in zip(result, word):
                grid[pr][pc] = ch
            return result
    return None


def seed_words(grid, word_bank, rng, target_count=8):
    """
    Try to place `target_count` words from word_bank as guaranteed finds.
    Returns [(word, path), ...] for the ones that landed; their cells
    should be locked before you fill/refine the rest of the grid.
    """
    capacity = len(grid) ** 2
    candidates = [w for w in word_bank if 3 <= len(w) <= capacity]
    rng.shuffle(candidates)

    placed, locked = [], set()
    for w in candidates:
        if len(placed) >= target_count:
            break
        path = try_place_word(grid, w, rng, max_nodes=MAX_PLACEMENT_NODES)
        if path:
            placed.append((w.upper(), path))
            locked.update(path)
    return placed, locked


def seed_tiles(word):
    """A Q tile spells QU on the client. A standalone Q cannot be traced."""
    word = word.upper()
    tiles = word.replace("QU", "Q")
    return tiles if tiles.replace("Q", "QU") == word else ""


def place_drawn_words(grid, words, rng):
    """Place a room's draw on an empty grid, with a bounded random search."""
    size = len(grid)
    targets = sorted(((w, seed_tiles(w)) for w in words),
                     key=lambda target: len(target[1]), reverse=True)
    if any(not tiles for _, tiles in targets) or sum(len(t) for _, t in targets) > size * size:
        raise ValueError("Drawn words must fit on separate paths")

    placed = []
    for word, tiles in targets:
        path = try_place_word(grid, tiles, rng, max_nodes=MAX_PLACEMENT_NODES)
        if path is None:
            break
        placed.append((word, path))
    else:
        return placed

    # Restart on disjoint segments of one continuous path so placement always finishes.
    for row in grid:
        row[:] = [None] * size
    order = snake_order(size)
    if rng.choice((True, False)):
        order = [(c, r) for r, c in order]
    if rng.choice((True, False)):
        order.reverse()
    offset = rng.randint(0, len(order) - sum(len(t) for _, t in targets))
    placed = []
    for word, tiles in targets:
        path = order[offset:offset + len(tiles)]
        for (r, c), tile in zip(path, tiles):
            grid[r][c] = tile
        placed.append((word, path))
        offset += len(tiles)
    return placed


def generate_grid(size=6, corpus=None, seed_word_bank=None, target_seed_words=0,
                   n=3, fill_pattern="snake", max_consonant_run=2, max_vowel_run=2,
                   seed=None, *, models=None, drawn_words=()):
    """
    corpus: word list used to build the n-gram filler model when no
            prebuilt models are supplied.
    seed_word_bank: word list to draw guaranteed placements from (place-
                    then-fill). Leave target_seed_words=0 to skip this and
                    get pure n-gram generation, as in v1.
    Returns (grid, placed_seeds, locked) where placed_seeds is [(word, path), ...].
    """
    rng = random.Random(seed)
    grid = [[None] * size for _ in range(size)]
    locked = set()
    placed_seeds = []

    if drawn_words:
        placed_seeds = place_drawn_words(grid, drawn_words, rng)
        locked = {cell for _, path in placed_seeds for cell in path}
    elif seed_word_bank and target_seed_words:
        placed_seeds, locked = seed_words(grid, seed_word_bank, rng, target_seed_words)

    if models is None and corpus:
        models = build_ngram_model(corpus, n=n)
    order = FILL_ORDERS[fill_pattern](size)
    context = ""
    consonant_run = vowel_run = 0

    for (r, c) in order:
        if grid[r][c] is not None:
            letter = grid[r][c]
        else:
            forced = None
            if consonant_run >= max_consonant_run:
                forced = VOWELS
            elif vowel_run >= max_vowel_run:
                forced = set(string.ascii_uppercase) - VOWELS

            if models:
                letter = next_letter(models, context, n - 1, rng, forced_set=forced)
            else:
                pool = forced if forced else string.ascii_uppercase
                letter = rng.choice(list(pool))
            grid[r][c] = letter

        context = (context + letter)[-(n - 1):]
        if is_vowel(letter):
            vowel_run, consonant_run = vowel_run + 1, 0
        else:
            consonant_run, vowel_run = consonant_run + 1, 0

    return grid, placed_seeds, locked

