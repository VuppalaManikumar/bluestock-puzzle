// Puzzle cache key
const PUZZLE_CACHE = "dailyPuzzle";

// Load puzzle (cache first)
function loadPuzzle() {

    const cached = localStorage.getItem(PUZZLE_CACHE);

    if (cached) {
        console.log("Loaded puzzle from cache");
        showPuzzle(JSON.parse(cached));
    } else {

        console.log("Fetching puzzle from API");

        // simulated API request
        const puzzle = {
            question: "What comes next: 2, 4, 8, 16, ?",
            answer: "32"
        };

        localStorage.setItem(PUZZLE_CACHE, JSON.stringify(puzzle));
        showPuzzle(puzzle);
    }
}

// Display puzzle
function showPuzzle(puzzle) {

    const container = document.querySelector(".card");

    const puzzleBox = document.createElement("p");
    puzzleBox.innerText = puzzle.question;

    container.appendChild(puzzleBox);
}

// Batch syncing every 5 puzzles
let completedPuzzles = 0;

function completePuzzle() {

    completedPuzzles++;

    if (completedPuzzles % 5 === 0) {
        syncProgress();
    }
}

// Simulated server sync
function syncProgress() {
    console.log("Syncing puzzle progress to server...");
}

// Lazy loading example
function loadUpcomingPuzzles() {

    const days = 7;

    console.log("Loading puzzles for next", days, "days only");
}

// Run on page load
loadPuzzle();
loadUpcomingPuzzles();