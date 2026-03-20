// ============================================================
// Heatmap System — Production Approach
// GitHub-style 365-day activity grid
// Client-first, offline-capable, brand-compliant
// ============================================================

// Intensity based on score/difficulty
function intensity(entry) {
  if (!entry || !entry.solved) return 0;
  if (entry.score > 90)  return 4; // Perfect
  if (entry.score > 70)  return 3; // Hard
  if (entry.score > 40)  return 2; // Medium
  return 1;                         // Easy / low score
}

// Memoized processed activity map
let _cachedActivity = null;
let _cacheKey = null;

function processActivityData(activity) {
  const key = JSON.stringify(Object.keys(activity).sort());
  if (key === _cacheKey) return _cachedActivity;
  _cacheKey = key;
  _cachedActivity = activity;
  return activity;
}

// Calculate streak from activity map
function calculateStreak(activity) {
  let streak = 0;
  const d = new Date();

  while (true) {
    const key = d.toISOString().split("T")[0];
    if (activity[key] && activity[key].solved) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// Render the full 365-day heatmap
function renderHeatmap() {
  const heatmap = document.getElementById("heatmap");
  if (!heatmap) return;

  getActivity(function (rawActivity) {
    const activity = processActivityData(rawActivity);

    heatmap.innerHTML = "";

    const today = new Date();
    const todayKey = today.toISOString().split("T")[0];

    // Check if it's a leap year for correct day count
    const year = today.getFullYear();
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInYear = isLeapYear ? 366 : 365;

    // Start from (daysInYear - 1) days ago, then align back to Sunday
    const start = new Date(today);
    start.setDate(today.getDate() - (daysInYear - 1));
    const dayOfWeek = start.getDay(); // 0 = Sunday
    start.setDate(start.getDate() - dayOfWeek);

    // Total cells = full weeks from aligned start to today
    const totalDays = Math.ceil((daysInYear + dayOfWeek) / 7) * 7;

    // Document fragment for performance
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const key = d.toISOString().split("T")[0];
      const cell = document.createElement("div");
      cell.classList.add("heatmap-cell");

      const entry = activity[key];
      const level = intensity(entry);

      if (level > 0) {
        cell.classList.add("level-" + level);
        cell.classList.add("active");
      }

      // Highlight today
      if (key === todayKey) {
        cell.classList.add("today");
      }

      // Tooltip (hover)
      if (entry && entry.solved) {
        const diff = ["", "Easy", "Medium", "Hard", "Perfect"][entry.difficulty] || entry.difficulty;
        cell.title =
          "📅 " + key +
          "\n🏆 Score: " + entry.score +
          "\n⏱ Time: " + entry.timeTaken + "s" +
          "\n🎯 Difficulty: " + diff;
      } else {
        cell.title = "📅 " + key + "\n— No puzzle solved";
      }

      fragment.appendChild(cell);
    }

    heatmap.appendChild(fragment);
  });
}
