// heatmap.js

// Heatmap container
const heatmap = document.getElementById("heatmap")

// Key for storing activity
const STORAGE_KEY = "puzzleActivity"

// Load activity from local storage
function loadActivity() {
    const data = localStorage.getItem(STORAGE_KEY)

    if (data) {
        return JSON.parse(data)
    } else {
        return {}
    }
}

// Save activity
function saveActivity(activity) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activity))
}

// Generate today's activity (for demo)
function markTodaySolved() {

    const today = new Date().toISOString().split("T")[0]

    let activity = loadActivity()

    if (!activity[today]) {
        activity[today] = {
            solved: true,
            score: Math.floor(Math.random() * 100),
            difficulty: Math.floor(Math.random() * 4) + 1
        }

        saveActivity(activity)
    }
}

// Determine color intensity
function getLevel(entry) {

    if (!entry) return 0

    const difficulty = entry.difficulty

    if (difficulty === 1) return 1
    if (difficulty === 2) return 2
    if (difficulty === 3) return 3
    if (difficulty === 4) return 4

    return 0
}

// Generate 365 days heatmap
function generateHeatmap() {

    const activity = loadActivity()

    const start = new Date()
    start.setDate(start.getDate() - 364)

    for (let i = 0; i < 365; i++) {

        const date = new Date(start)
        date.setDate(start.getDate() + i)

        const dateKey = date.toISOString().split("T")[0]

        const cell = document.createElement("div")
        cell.classList.add("heatmap-cell")

        const entry = activity[dateKey]
        const level = getLevel(entry)

        if (level > 0) {
            cell.classList.add(`level-${level}`)
        }

        cell.title = dateKey

        heatmap.appendChild(cell)
    }
}

// Initialize
function initHeatmap() {

    if (!heatmap) {
        console.error("Heatmap container not found")
        return
    }

    markTodaySolved()
    generateHeatmap()
}

// Run when page loads
document.addEventListener("DOMContentLoaded", initHeatmap)