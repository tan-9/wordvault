import random
import string
from collections import defaultdict, Counter

VOWELS = set("AEIOU")


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

def try_place_word(grid, word, rng, max_starts=None):
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


def seed_words(grid, word_bank, rng, target_count=8, max_len=None):
    """
    Try to place `target_count` words from word_bank as guaranteed finds.
    Returns [(word, path), ...] for the ones that landed; their cells
    should be locked before you fill/refine the rest of the grid.
    """
    size = len(grid)
    max_len = max_len or size
    candidates = [w for w in word_bank if 3 <= len(w) <= max_len]
    rng.shuffle(candidates)

    placed, locked = [], set()
    for w in candidates:
        if len(placed) >= target_count:
            break
        path = try_place_word(grid, w, rng)
        if path:
            placed.append((w.upper(), path))
            locked.update(path)
    return placed, locked


def generate_grid(size=6, corpus=None, seed_word_bank=None, target_seed_words=0,
                   n=3, fill_pattern="snake", max_consonant_run=2, max_vowel_run=2,
                   seed=None):
    """
    corpus: word list used to build the n-gram filler model.
    seed_word_bank: word list to draw guaranteed placements from (place-
                    then-fill). Leave target_seed_words=0 to skip this and
                    get pure n-gram generation, as in v1.
    Returns (grid, placed_seeds) where placed_seeds is [(word, path), ...].
    """
    rng = random.Random(seed)
    grid = [[None] * size for _ in range(size)]
    locked = set()
    placed_seeds = []

    if seed_word_bank and target_seed_words:
        placed_seeds, locked = seed_words(grid, seed_word_bank, rng, target_seed_words, max_len=size)

    models = build_ngram_model(corpus, n=n) if corpus else None
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


# ---------------------------------------------------------------------------
# 5. Fitness: findable words via trie DFS  (unchanged from v1)
# ---------------------------------------------------------------------------

class _TrieNode:
    __slots__ = ("children", "is_word")

    def __init__(self):
        self.children = {}
        self.is_word = False


def build_trie(word_list):
    root = _TrieNode()
    for w in word_list:
        node = root
        for ch in w.upper():
            node = node.children.setdefault(ch, _TrieNode())
        node.is_word = True
    return root


def count_words_in_grid(grid, trie, min_len=3):
    size = len(grid)
    found = set()

    def dfs(r, c, node, path, visited):
        node = node.children.get(grid[r][c])
        if node is None:
            return
        path = path + grid[r][c]
        if node.is_word and len(path) >= min_len:
            found.add(path)
        for nr, nc in _king_neighbors(r, c, size):
            if (nr, nc) not in visited:
                dfs(nr, nc, node, path, visited | {(nr, nc)})

    for r in range(size):
        for c in range(size):
            dfs(r, c, trie, "", {(r, c)})
    return found


# ---------------------------------------------------------------------------
# 6. Simulated annealing refinement over the free cells only
#    (replaces k-random-restart best-of-k with real local search)
# ---------------------------------------------------------------------------

def local_search_refine(grid, trie, rng, locked_cells=None, iterations=800,
                         start_temp=1.0, min_temp=0.02):
    """
    Single-cell mutation hill-climbing/SA. `locked_cells` (the seeded-word
    cells) are never touched, so the guarantee from place-then-fill holds
    throughout. Returns (best_grid, best_score).
    """
    size = len(grid)
    locked_cells = locked_cells or set()
    free_cells = [(r, c) for r in range(size) for c in range(size) if (r, c) not in locked_cells]
    if not free_cells:
        return grid, len(count_words_in_grid(grid, trie))

    current_score = len(count_words_in_grid(grid, trie))
    best_grid = [row[:] for row in grid]
    best_score = current_score

    for step in range(iterations):
        temp = max(min_temp, start_temp * (1 - step / iterations))
        r, c = rng.choice(free_cells)
        old_letter = grid[r][c]
        new_letter = rng.choice(string.ascii_uppercase)
        if new_letter == old_letter:
            continue

        grid[r][c] = new_letter
        new_score = len(count_words_in_grid(grid, trie))
        delta = new_score - current_score

        if delta >= 0 or rng.random() < pow(2.718281828, delta / temp):
            current_score = new_score
            if current_score > best_score:
                best_score = current_score
                best_grid = [row[:] for row in grid]
        else:
            grid[r][c] = old_letter  # reject, revert

    return best_grid, best_score

def generate_grid_hybrid(size=6, corpus=None, seed_word_bank=None, target_seed_words=6,
                          n=3, fill_pattern="snake", refine_iterations=800,
                          trie=None, seed=None):
    rng_seed = seed
    grid, placed_seeds, locked = generate_grid(
        size=size, corpus=corpus, seed_word_bank=seed_word_bank,
        target_seed_words=target_seed_words, n=n, fill_pattern=fill_pattern,
        seed=rng_seed,
    )
    if trie:
        rng = random.Random(seed)
        grid, score = local_search_refine(grid, trie, rng, locked_cells=locked,
                                           iterations=refine_iterations)
    else:
        score = None
    return grid, placed_seeds, score