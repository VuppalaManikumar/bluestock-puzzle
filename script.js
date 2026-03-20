// ════════════════════════════════════════════════
// SCRIPT.JS — Main App Controller
// ════════════════════════════════════════════════

const puzzleEl      = document.getElementById("puzzle");
const timerEl       = document.getElementById("timer");
const streakEl      = document.getElementById("streak");
const feedbackEl    = document.getElementById("feedback");
const hintsLeftEl   = document.getElementById("hintsLeft");
const answerInput   = document.getElementById("answerInput");
const startBtn      = document.getElementById("startPuzzle");
const submitBtn     = document.getElementById("submitScore");
const hintBtn       = document.getElementById("hintBtn");
const solvedBanner  = document.getElementById("solvedBanner");
const solvedScore   = document.getElementById("solvedScore");
const completionEl  = document.getElementById("completionAnim");
const completionMsg = document.getElementById("completionMsg");
const dateDisplay   = document.getElementById("dateDisplay");
const userChip      = document.getElementById("userChip");
const mainNav       = document.getElementById("mainNav");
const mainApp       = document.getElementById("mainApp");
const mainFooter    = document.getElementById("mainFooter");
const authOverlay   = document.getElementById("auth-overlay");
const loadingScreen = document.getElementById("loading-screen");
const progressBar   = document.getElementById("progress-bar");
const loadingText   = document.getElementById("loading-text");
const guestBtn      = document.getElementById("guestBtn");
const googleBtn     = document.getElementById("googleBtn");
const logoutBtn     = document.getElementById("logoutBtn");
const usernameInput = document.getElementById("usernameInput");

let puzzle        = null;
let startTime     = null;
let timerInterval = null;
let hintsUsed     = 0;
let puzzleSolved  = false;
const MAX_HINTS   = 2;
const TODAY       = new Date().toISOString().split("T")[0];

// ── LOADING SCREEN ──
function animateProgress(target, cb) {
  let current = parseFloat(progressBar.style.width) || 0;
  const iv = setInterval(() => {
    current += 3;
    if (current >= target) { current = target; clearInterval(iv); if (cb) cb(); }
    progressBar.style.width = current + "%";
  }, 30);
}

function hideLoadingScreen() {
  progressBar.style.width = "100%";
  setTimeout(() => {
    loadingScreen.style.opacity = "0";
    loadingScreen.style.transition = "opacity 0.5s";
    setTimeout(() => { loadingScreen.style.display = "none"; }, 500);
  }, 300);
}

// ── AUTH ──
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("bs_user") || "null"); } catch { return null; }
}
function setUser(user) { localStorage.setItem("bs_user", JSON.stringify(user)); }
function clearUser()   { localStorage.removeItem("bs_user"); }

function showApp(user) {
  authOverlay.style.display = "none";
  mainNav.style.display     = "flex";
  mainApp.style.display     = "block";
  mainFooter.style.display  = "block";
  userChip.textContent = "👤 " + (user.name || "Guest");
  dateDisplay.textContent = new Date().toLocaleDateString("en-IN", {
    weekday:"long", day:"numeric", month:"long", year:"numeric"
  });
  initApp();
}

guestBtn.addEventListener("click", () => {
  const name = (usernameInput.value.trim()) || "Guest";
  setUser({ name, mode:"guest", joinedAt: TODAY });
  showApp(getCurrentUser());
});

googleBtn.addEventListener("click", () => {
  const name = (usernameInput.value.trim()) || "Player";
  setUser({ name, mode:"google", joinedAt: TODAY });
  showApp(getCurrentUser());
  showFeedback("✅ Signed in (demo mode)", "success");
});

logoutBtn.addEventListener("click", () => { clearUser(); location.reload(); });

// ── FEEDBACK ──
function showFeedback(msg, type) {
  feedbackEl.innerHTML  = msg;
  feedbackEl.className  = "feedback " + type;
}
function clearFeedback() {
  feedbackEl.className  = "feedback";
  feedbackEl.textContent = "";
}

// ── TIMER ──
function startTimer() {
  startTime = Date.now();
  timerEl.textContent = "⏱ Time: 0s";
  timerInterval = setInterval(() => {
    timerEl.textContent = "⏱ Time: " + Math.floor((Date.now() - startTime) / 1000) + "s";
  }, 1000);
}
function stopTimer() {
  clearInterval(timerInterval);
  return Math.floor((Date.now() - startTime) / 1000);
}

// ── SCORE ──
function calculateScore(time) {
  return Math.max(120 - time - (hintsUsed * 10), 10);
}

// ── LOAD PUZZLE ──
async function loadPuzzle() {
  if (puzzleSolved) { showFeedback("✅ Already solved today! Come back tomorrow 🔥", "info"); return; }

  puzzle = await getDailyPuzzleAsync();
  puzzleEl.textContent = puzzle.q;

  answerInput.disabled = false;
  answerInput.value    = "";
  answerInput.focus();

  hintsUsed = 0;
  updateHintsDisplay();
  clearFeedback();
  timerEl.textContent = "";
  startTimer();
}

// ── SUBMIT ──
function submitPuzzle() {
  if (!puzzle)       { showFeedback("⚠️ Press Start Puzzle first!", "error"); return; }
  if (puzzleSolved)  { showFeedback("✅ Already solved today!", "info"); return; }

  const userAnswer = answerInput.value;
  if (!userAnswer.trim()) { showFeedback("⚠️ Please enter an answer!", "error"); return; }

  if (checkAnswer(userAnswer, puzzle.a)) {
    const time  = stopTimer();
    const score = calculateScore(time);
    puzzleSolved = true;
    answerInput.disabled = true;

    completionMsg.textContent = "🎉 Correct! Amazing work!";
    completionEl.style.display = "block";

    feedbackEl.innerHTML  = '🎉 Correct! <span class="score-badge">Score: ' + score + '</span>';
    feedbackEl.className  = "feedback success";

    saveToday(score, time, puzzle.difficulty);

    setTimeout(() => {
      renderHeatmap();
      updateStreak();
      syncData();
      solvedScore.textContent  = "Score: " + score;
      solvedBanner.style.display = "flex";
    }, 600);

  } else {
    showFeedback('<i class="bi bi-x-circle me-2"></i>Wrong answer! Try again or use a hint.', "error");
    answerInput.select();
  }
}

// ── HINT ──
function showHint() {
  if (!puzzle)             { showFeedback("⚠️ Start the puzzle first!", "error"); return; }
  if (hintsUsed >= MAX_HINTS) { showFeedback("❌ No hints left for today!", "error"); return; }
  hintsUsed++;
  updateHintsDisplay();
  showFeedback('<i class="bi bi-lightbulb-fill me-2"></i>Hint: ' + puzzle.hint, "info");
}
function updateHintsDisplay() {
  const left = MAX_HINTS - hintsUsed;
  hintsLeftEl.innerHTML = '<i class="bi bi-info-circle me-1"></i>Hints remaining: ' + left;
  if (left === 0) hintsLeftEl.style.color = "var(--accent)";
}

// ── STREAK ──
function updateStreak() {
  getActivity(function (activity) {
    let streak = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().split("T")[0];
      if (activity[key]?.solved) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    streakEl.textContent = streak > 0
      ? (streak >= 7 ? "🔥🔥" : "🔥") + " Streak: " + streak + " day" + (streak > 1 ? "s" : "")
      : "Start your streak today!";
  });
}

// ── RESTORE STATE (if already solved today) ──
function checkTodaySolved() {
  getActivity(function (activity) {
    const entry = activity[TODAY];
    if (entry && entry.solved) {
      puzzleSolved = true;
      solvedScore.textContent    = "Score: " + entry.score;
      solvedBanner.style.display = "flex";
      answerInput.disabled       = true;
      timerEl.textContent        = "⏱ Completed in " + entry.timeTaken + "s";
      getDailyPuzzleAsync().then(p => {
        puzzle = p;
        puzzleEl.textContent = p.q;
      });
    }
  });
}

// ── INIT ──
function initApp() {
  updateStreak();
  renderHeatmap();
  checkTodaySolved();
  getDailyPuzzleAsync().then(p => {
    const labels = { sequence:"🔢 Sequence", math:"➗ Math", logic:"🧠 Logic", word:"📝 Word" };
    dateDisplay.textContent += "  ·  Today: " + (labels[p.type] || "🧩 Puzzle");
  });
}

// ── EVENTS ──
answerInput.addEventListener("keydown", e => { if (e.key === "Enter") submitPuzzle(); });
startBtn.onclick  = loadPuzzle;
submitBtn.onclick = submitPuzzle;
hintBtn.onclick   = showHint;

// ════════════════════════════════════════════════
// BOOT — waits for IndexedDB before showing UI
// ════════════════════════════════════════════════
async function boot() {
  // Step 1: animate to 40% immediately
  animateProgress(40, null);
  loadingText.textContent = "Loading puzzle engine...";

  // Step 2: wait for IndexedDB to be ready (dbReadyPromise from storage.js)
  try {
    await Promise.race([
      dbReadyPromise,
      new Promise(res => setTimeout(res, 3000)) // 3s max timeout
    ]);
  } catch(e) { /* continue regardless */ }

  // Step 3: animate to 100%
  loadingText.textContent = "Almost ready...";
  animateProgress(100, null);

  // Step 4: hide loading, show auth or app
  setTimeout(() => {
    hideLoadingScreen();
    const user = getCurrentUser();
    if (user) {
      showApp(user);
    } else {
      authOverlay.style.display = "flex";
    }
  }, 600);
}

boot();
