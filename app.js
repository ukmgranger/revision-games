console.log("DECKS:", window.DECKS);

// app.js
// Multi-deck Memory Match + best scores (localStorage per deck+mode) + confetti + theme switcher

// ===== Timing (tweak these) =====
const MISMATCH_READ_MS = 2000;
const HINT_SHOW_MS = 2500;
const MATCH_SETTLE_MS = 300;
const EASY_MISMATCH_HOLD_MS = 600;

const $ = (id) => document.getElementById(id);

// Toggle console logging
const DEBUG = false;

// ===== Theme selection =====
function getSavedTheme() {
  return localStorage.getItem("memory_match_theme") || "standard";
}
function setSavedTheme(theme) {
  localStorage.setItem("memory_match_theme", theme);
}
function applyTheme(theme) {
  const link = document.getElementById("themeStylesheet");
  const t = (theme === "retro") ? "retro" : "standard";
  link.href = (t === "retro") ? "theme-retro.css" : "theme-standard.css";
  document.documentElement.dataset.theme = t; // optional (handy for minor tweaks)
}


// ===== Utilities =====
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setMessage(html) {
  $("message").innerHTML = html;
}

function sample(arr, n) {
  // Random sample without replacement
  if (n >= arr.length) return [...arr];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// ===== Confetti =====
function confettiBurst() {
  let canvas = document.getElementById("confetti");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "confetti";
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext("2d");
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  function resize() {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  const W = window.innerWidth;
  const H = window.innerHeight;

  const palette = ["#7c5cff", "#00d4ff", "#2be37a", "#ffcc66", "#ff5c7a", "#ffffff"];
  const pieces = [];
  const count = 170;

  for (let i = 0; i < count; i++) {
    pieces.push({
      x: W * 0.5 + (Math.random() - 0.5) * 40,
      y: H * 0.28 + (Math.random() - 0.5) * 25,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 1.25) * 15,
      g: 0.33 + Math.random() * 0.28,
      size: 4 + Math.random() * 7,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.28,
      life: 60 + Math.random() * 35,
      c: palette[Math.floor(Math.random() * palette.length)],
    });
  }

  let frame = 0;
  let raf = null;

  function tick() {
    frame++;
    ctx.clearRect(0, 0, W, H);

    for (const p of pieces) {
      p.life -= 1;
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      const wobble = Math.sin((frame + p.x) * 0.02) * 0.75;
      const w = p.size * (1.25 + wobble * 0.12);
      const h = p.size * (0.75 + wobble * 0.10);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 55));
      ctx.fillStyle = p.c;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.restore();
    }

    if (pieces.some((p) => p.life > 0) && frame < 140) {
      raf = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, W, H);
      setTimeout(() => {
        if (raf) cancelAnimationFrame(raf);
        canvas.remove();
      }, 200);
      window.removeEventListener("resize", resize);
    }
  }

  window.addEventListener("resize", resize);
  tick();
}

// ===== Modes =====
function isEasyMode(mode) {
  return mode === "easy_quick" || mode === "easy_full";
}
function labelMode(mode) {
  if (mode === "easy_quick") return "Easy (Quick)";
  if (mode === "easy_full") return "Easy (Full)";
  if (mode === "quick") return "Quick";
  if (mode === "standard") return "Standard";
  if (mode === "full") return "Full";
  return mode;
}

// ===== Deck selection =====
function getDecks() {
  return Array.isArray(window.DECKS) ? window.DECKS : [];
}

function getCurrentDeckId() {
  return localStorage.getItem("memory_match_selected_deck") || (getDecks()[0]?.id ?? "");
}

function setCurrentDeckId(id) {
  localStorage.setItem("memory_match_selected_deck", id);
}

function getDeckById(id) {
  return getDecks().find(d => d.id === id) || getDecks()[0];
}

// ===== Best scores: per deck + mode =====
function bestKey(deckId, mode) {
  return `memory_match_best_${deckId}_${mode}`;
}

function loadBest(deckId, mode) {
  try {
    return JSON.parse(localStorage.getItem(bestKey(deckId, mode)) || "null");
  } catch {
    return null;
  }
}

function saveBest(deckId, mode, data) {
  localStorage.setItem(bestKey(deckId, mode), JSON.stringify(data));
}

function isBetterScore(a, b) {
  if (!b) return true;
  if (a.seconds < b.seconds) return true;
  if (a.seconds > b.seconds) return false;
  return a.moves < b.moves;
}

function bestLine(deckId, mode) {
  const best = loadBest(deckId, mode);
  if (!best) return `<span class="tiny">🏆 Best (${labelMode(mode)}): none yet</span>`;
  return `<span class="tiny">🏆 Best (${labelMode(mode)}): <strong>${best.seconds}s</strong> • <strong>${best.moves}</strong> moves</span>`;
}

// ===== Deck helpers =====
function pickPairs(deck, mode) {
  const all = deck.pairs;
  const size = deck.modeSizes?.[mode];

  if (size == null) return all; // all pairs (full / easy_full)
  return sample(all, size);     // random subset for sized modes (easy_quick/quick/standard)
}

function buildDeck(pairList) {
  const cards = [];
  pairList.forEach(([a, b], idx) => {
    cards.push({ key: `a-${idx}`, pairId: idx, text: a });
    cards.push({ key: `b-${idx}`, pairId: idx, text: b });
  });
  return shuffle(cards);
}

// ===== Game state =====
let deck = null;
let cards = [];
let flipped = [];
let matched = new Set();
let moves = 0;
let seconds = 0;
let timer = null;
let lock = false;
let hintsLeft = 3;
let lastMode = "standard";

function startTimerIfNeeded() {
  if (!timer) {
    timer = setInterval(() => {
      seconds += 1;
      $("time").textContent = seconds;
    }, 1000);
  }
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

// ===== Render =====
function render() {
  const grid = $("grid");
  grid.innerHTML = "";

  const modeNow = $("mode").value;
  const easy = isEasyMode(modeNow);

  cards.forEach((c, i) => {
    const isUp = easy || flipped.includes(i) || matched.has(c.pairId);
    const isSelected = flipped.includes(i) && !matched.has(c.pairId);

    const btn = document.createElement("button");
    btn.className =
      "card" +
      (isUp ? " up" : "") +
      (matched.has(c.pairId) ? " matched" : "") +
      (isSelected ? " selected" : "");
    btn.setAttribute("aria-label", "card");
    btn.addEventListener("click", () => flipCard(i));

    btn.innerHTML = `
      <span class="matchedBadge">✓ matched</span>
      <div class="inner">
        <div class="face front">?</div>
        <div class="face back">${escapeHtml(c.text)}</div>
      </div>
    `;
    grid.appendChild(btn);
  });
}

// ===== Game flow =====
function finishGame() {
  stopTimer();
  confettiBurst();

  const mode = lastMode;
  const current = { seconds, moves };
  const prevBest = loadBest(deck.id, mode);

  const newBest = isBetterScore(current, prevBest);
  if (newBest) saveBest(deck.id, mode, current);

  setMessage(`
    <div>
      ✅ Finished! Time: <strong>${seconds}s</strong> • Moves: <strong>${moves}</strong>
      ${newBest ? ` • <span style="color:var(--good)"><strong>New best!</strong></span>` : ""}
    </div>
    <div>${bestLine(deck.id, mode)}</div>
    <div class="tiny">Try again and beat your score — or switch deck/mode.</div>
  `);
}

function flipCard(i) {
  if (lock) return;
  if (matched.has(cards[i].pairId)) return;
  if (flipped.includes(i)) return;
  if (flipped.length === 2) return;

  startTimerIfNeeded();

  flipped.push(i);
  render();

  if (flipped.length === 2) {
    moves += 1;
    $("moves").textContent = moves;

    const [i1, i2] = flipped;
    const match = cards[i1].pairId === cards[i2].pairId;

    lock = true;

    setTimeout(() => {
      if (match) {
        matched.add(cards[i1].pairId);
        flipped = [];
        lock = false;
        render();

        const totalPairs = pickPairs(deck, lastMode).length;
        if (matched.size === totalPairs) finishGame();
      } else {
        const modeNow = $("mode").value;
        const delay = isEasyMode(modeNow) ? EASY_MISMATCH_HOLD_MS : MISMATCH_READ_MS;

        const buttons = $("grid").querySelectorAll(".card");
        buttons[i1]?.classList.add("shake");
        buttons[i2]?.classList.add("shake");

        setTimeout(() => {
          flipped = [];
          lock = false;
          render();
        }, delay);
      }
    }, match ? MATCH_SETTLE_MS : 0);
  }
}

function hint() {
  const modeNow = $("mode").value;

  if (isEasyMode(modeNow)) {
    setMessage(
      `<div><strong>${labelMode(modeNow)}:</strong> all answers are visible — no hint needed 🙂</div>` +
      `<div class="tiny">Switch modes for a challenge.</div>` +
      `<div>${bestLine(deck.id, modeNow)}</div>`
    );
    return;
  }

  if (hintsLeft <= 0) return;

  const remainingPairIds = [...new Set(cards.filter(c => !matched.has(c.pairId)).map(c => c.pairId))];
  if (remainingPairIds.length === 0) return;

  const pairId = remainingPairIds[Math.floor(Math.random() * remainingPairIds.length)];
  const idxs = cards.map((c, idx) => (c.pairId === pairId ? idx : -1)).filter(x => x !== -1);

  hintsLeft -= 1;
  $("hint").textContent = `Hint (${hintsLeft})`;

  const prevFlipped = [...flipped];
  lock = true;

  flipped = Array.from(new Set([...flipped, ...idxs]));
  render();

  setTimeout(() => {
    flipped = prevFlipped.filter(idx => !idxs.includes(idx));
    lock = false;
    render();
  }, HINT_SHOW_MS);
}

function applyDeckToUI(deckObj) {
  $("title").textContent = deckObj.title || "Memory Match";
  $("subtitle").innerHTML = deckObj.subtitle || "Match each term with the correct definition / fact.";
  $("footerNote").textContent = deckObj.footerNote || "";
}

function reset(mode) {
  lastMode = mode;
  stopTimer();
  seconds = 0;
  moves = 0;
  hintsLeft = 3;

  $("time").textContent = "0";
  $("moves").textContent = "0";
  $("hint").textContent = `Hint (${hintsLeft})`;

  const pairList = pickPairs(deck, mode);

  if (DEBUG) {
    console.log(
      `[${deck.id}] mode=${mode} picked ${pairList.length} pairs:`,
      pairList.map(p => p[0])
    );
  }

  cards = buildDeck(pairList);
  flipped = [];
  matched = new Set();
  lock = false;

  render();

  if (isEasyMode(mode)) {
    setMessage(
      `<div><strong>${labelMode(mode)}:</strong> all text stays visible. Click two cards to match the pair.</div>` +
      `<div>${bestLine(deck.id, mode)}</div>` +
      `<div class="tiny">Tip: read the definition out loud when you match it.</div>`
    );
  } else {
    setMessage(
      `<div>Flip two cards. Match term ↔ definition/fact.</div>` +
      `<div>${bestLine(deck.id, mode)}</div>` +
      `<div class="tiny">Tip: read the definition out loud when you match it.</div>`
    );
  }
}

// ===== Init =====
(function init() {
  const decks = getDecks();
  if (!decks.length) {
    setMessage(`<div><strong>Error:</strong> No decks registered. Check deck files load after deck-registry.js.</div>`);
    return;
  }

  // Apply saved theme on load (even before UI wiring)
  applyTheme(getSavedTheme());

  // Populate deck selector
  const deckSelect = $("deckSelect");
  deckSelect.innerHTML = "";
  decks.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.footerNote || d.title || d.id;
    deckSelect.appendChild(opt);
  });

  // Restore deck selection
  const savedDeckId = getCurrentDeckId();
  deckSelect.value = getDeckById(savedDeckId)?.id ?? decks[0].id;

  // Load selected deck
  deck = getDeckById(deckSelect.value);
  applyDeckToUI(deck);

  // Theme dropdown
  const themeSelect = $("themeSelect");
  if (themeSelect) {
    const savedTheme = getSavedTheme();
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);

    themeSelect.addEventListener("change", (e) => {
      setSavedTheme(e.target.value);
      applyTheme(e.target.value);
    });
  }

  // Wire events
  $("newGame").addEventListener("click", () => reset($("mode").value));
  $("mode").addEventListener("change", (e) => reset(e.target.value));
  $("hint").addEventListener("click", hint);

  deckSelect.addEventListener("change", (e) => {
    setCurrentDeckId(e.target.value);
    deck = getDeckById(e.target.value);
    applyDeckToUI(deck);
    reset($("mode").value);
  });

  // Start game
  reset($("mode").value);
})();

