// ════════════════════════════════════════════════
// SCRIPT.JS — Main App Controller
// Handles: Auth, Puzzle, Timer, Streak, Animations
// ════════════════════════════════════════════════

// ── DOM refs ──
const puzzleEl     = document.getElementById("puzzle");
const timerEl      = document.getElementById("timer");
const streakEl     = document.getElementById("streak");
const feedbackEl   = document.getElementById("feedback");
const hintsLeftEl  = document.getElementById("hintsLeft");
const answerInput  = document.getElementById("answerInput");
const startBtn     = document.getElementById("startPuzzle");
const submitBtn    = document.getElementById("submitScore");
const hintBtn      = document.getElementById("hintBtn");
const solvedBanner = document.getElementById("solvedBanner");
const solvedScore  = document.getElementById("solvedScore");
const completionEl = document.getElementById("completionAnim");
const completionMsg= document.getElementById("completionMsg");
const dateDisplay  = document.getElementById("dateDisplay");
const userChip     = document.getElementById("userChip");
const mainNav      = document.getElementById("mainNav");
const mainApp      = document.getElementById("mainApp");
const mainFooter   = document.getElementById("mainFooter");
const authOverlay  = document.getElementById("auth-overlay");
const loadingScreen= document.getElementById("loading-screen");
const progressBar  = document.getElementById("progress-bar");
const guestBtn     = document.getElementById("guestBtn");
const googleBtn    = document.getElementById("googleBtn");
const logoutBtn    = document.getElementById("logoutBtn");
const usernameInput= document.getElementById("usernameInput");

let puzzle        = null;
let startTime     = null;
let timerInterval = null;
let hintsUsed     = 0;
let puzzleSolved  = false;
const MAX_HINTS   = 2;

// ── TODAY KEY ──
const TODAY = new Date().toISOString().split("T")[0];

// ════════════════════════════════════════════════
// LOADING SCREEN
// ════════════════════════════════════════════════
function runLoadingBar(cb) {
  let pct = 0;
  const iv = setInterval(() => {
    pct += Math.random() * 18;
    if (pct >= 100) { pct = 100; clearInterval(iv); }
    progressBar.style.width = pct + "%";
    if (pct >= 100) setTimeout(cb, 300);
  }, 120);
}

// ════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("bs_user") || "null"); } catch { return null; }
}

function setUser(user) {
  localStorage.setItem("bs_user", JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem("bs_user");
}

function showApp(user) {
  authOverlay.style.display = "none";
  mainNav.style.display = "flex";
  mainApp.style.display = "block";
  mainFooter.style.display = "block";
  userChip.textContent = "👤 " + (user.name || "Guest");
  // Set date
  dateDisplay.textContent = new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  initApp();
}

guestBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim() || "Guest";
  const user = { name, mode: "guest", joinedAt: TODAY };
  setUser(user);
  showApp(user);
});

googleBtn.addEventListener("click", () => {
  // Simulated Google sign-in for demo
  const name = usernameInput.value.trim() || "Player";
  const user = { name, mode: "google", joinedAt: TODAY };
  setUser(user);
  showApp(user);
  showFeedback("✅ Signed in with Google (demo mode)", "success");
});

logoutBtn.addEventListener("click", () => {
  clearUser();
  location.reload();
});

// ════════════════════════════════════════════════
// FEEDBACK HELPERS
// ════════════════════════════════════════════════
function showFeedback(msg, type) {
  feedbackEl.innerHTML = msg;
  feedbackEl.className = "feedback " + type;
}
function clearFeedback() {
  feedbackEl.className = "feedback";
  feedbackEl.textContent = "";
}

// ════════════════════════════════════════════════
// TIMER
// ════════════════════════════════════════════════
function startTimer() {
  startTime = Date.now();
  timerEl.textContent = "⏱ Time: 0s";
  timerInterval = setInterval(() => {
    const s = Math.floor((Date.now() - startTime) / 1000);
    timerEl.textContent = "⏱ Time: " + s + "s";
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  return Math.floor((Date.now() - startTime) / 1000);
}

// ════════════════════════════════════════════════
// SCORE
// ════════════════════════════════════════════════
function calculateScore(time) {
  let score = 120 - time - (hintsUsed * 10);
  return Math.max(score, 10);
}

// ════════════════════════════════════════════════
// LOAD PUZZLE (with progress restore)
// ════════════════════════════════════════════════
async function loadPuzzle() {
  if (puzzleSolved) {
    showFeedback("✅ Already solved today! Come back tomorrow. 🔥", "info");
    return;
  }

  // Use async SHA256-seeded puzzle
  puzzle = await getDailyPuzzleAsync();
  puzzleEl.textContent = puzzle.q;

  answerInput.disabled = false;
  answerInput.value = "";
  answerInput.focus();
  answerInput.classList.add("pulse");
  setTimeout(() => answerInput.classList.remove("pulse"), 3000);

  hintsUsed = 0;
  updateHintsDisplay();
  clearFeedback();
  timerEl.textContent = "";
  startTimer();
}

// ════════════════════════════════════════════════
// SUBMIT
// ════════════════════════════════════════════════
function submitPuzzle() {
  if (!puzzle) { showFeedback("⚠️ Press Start Puzzle first!", "error"); return; }
  if (puzzleSolved) { showFeedback("✅ Already solved today!", "info"); return; }

  const userAnswer = answerInput.value;
  if (!userAnswer.trim()) { showFeedback("⚠️ Please enter an answer!", "error"); return; }

  if (checkAnswer(userAnswer, puzzle.a)) {
    const time  = stopTimer();
    const score = calculateScore(time);
    puzzleSolved = true;
    answerInput.disabled = true;

    // Show completion animation
    completionMsg.textContent = "🎉 Correct! Amazing work!";
    completionEl.style.display = "block";

    // Show score in feedback
    feedbackEl.innerHTML = '🎉 Correct! <span class="score-badge">Score: ' + score + '</span>';
    feedbackEl.className = "feedback success";

    // Save + update UI
    saveToday(score, time, puzzle.difficulty);
    setTimeout(() => {
      renderHeatmap();
      updateStreak();
      syncData();
      // Show solved banner
      solvedScore.textContent = "Score: " + score;
      solvedBanner.style.display = "flex";
    }, 600);

  } else {
    showFeedback('<i class="bi bi-x-circle me-2"></i>Wrong answer! Try again or use a hint.', "error");
    answerInput.select();
    // Shake animation
    answerInput.style.animation = "none";
    answerInput.offsetHeight;
    answerInput.style.animation = "shake 0.4s ease";
  }
}

// ════════════════════════════════════════════════
// HINT
// ════════════════════════════════════════════════
function showHint() {
  if (!puzzle) { showFeedback("⚠️ Start the puzzle first!", "error"); return; }
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

// ════════════════════════════════════════════════
// STREAK
// ════════════════════════════════════════════════
function updateStreak() {
  getActivity(function (activity) {
    let streak = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().split("T")[0];
      if (activity[key]?.solved) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    if (streak > 0) {
      const fire = streak >= 7 ? "🔥🔥" : "🔥";
      streakEl.textContent = fire + " Streak: " + streak + " day" + (streak > 1 ? "s" : "");
    } else {
      streakEl.textContent = "Start your streak today!";
    }
  });
}

// ════════════════════════════════════════════════
// CHECK IF ALREADY SOLVED TODAY (restore state)
// ════════════════════════════════════════════════
function checkTodaySolved() {
  getActivity(function (activity) {
    const entry = activity[TODAY];
    if (entry && entry.solved) {
      puzzleSolved = true;
      solvedScore.textContent = "Score: " + entry.score;
      solvedBanner.style.display = "flex";
      // Still show the puzzle question
      getDailyPuzzleAsync().then(p => {
        puzzle = p;
        puzzleEl.textContent = p.q;
        answerInput.disabled = true;
        timerEl.textContent = "⏱ Time: " + entry.timeTaken + "s (completed)";
      });
    }
  });
}

// ════════════════════════════════════════════════
// INIT APP (after login)
// ════════════════════════════════════════════════
function initApp() {
  updateStreak();
  renderHeatmap();
  checkTodaySolved();
  // Show puzzle type hint
  getDailyPuzzleAsync().then(p => {
    const typeLabels = { sequence:"🔢 Sequence", math:"➗ Math", logic:"🧠 Logic", word:"📝 Word" };
    const label = typeLabels[p.type] || "🧩 Puzzle";
    dateDisplay.textContent += "  ·  Today: " + label;
  });
}

// ════════════════════════════════════════════════
// KEYBOARD + BUTTON EVENTS
// ════════════════════════════════════════════════
answerInput.addEventListener("keydown", e => { if (e.key === "Enter") submitPuzzle(); });
startBtn.onclick  = loadPuzzle;
submitBtn.onclick = submitPuzzle;
hintBtn.onclick   = showHint;

// ════════════════════════════════════════════════
// BOOT SEQUENCE
// ════════════════════════════════════════════════
runLoadingBar(() => {
  loadingScreen.classList.add("fade-out");
  setTimeout(() => {
    loadingScreen.style.display = "none";
    const user = getCurrentUser();
    if (user) {
      showApp(user);
    } else {
      authOverlay.style.display = "flex";
    }
  }, 500);
});
