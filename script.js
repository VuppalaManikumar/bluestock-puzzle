const puzzleElement = document.getElementById("puzzle")
const streakElement = document.getElementById("streak")

const startBtn = document.getElementById("startPuzzle")
const submitBtn = document.getElementById("submitScore")

const puzzle = {
    question: "What comes next: 2, 4, 8, 16, ?",
    answer: "32"
}

function loadPuzzle() {

    const cached = localStorage.getItem("dailyPuzzle")

    if (cached) {

        const data = JSON.parse(cached)
        puzzleElement.innerText = data.question

    } else {

        localStorage.setItem("dailyPuzzle", JSON.stringify(puzzle))
        puzzleElement.innerText = puzzle.question

    }

}

function submitScore() {

    const answer = prompt("Enter your answer")

    if (!answer) return

    if (answer === puzzle.answer) {

        alert("Correct!")

        const score = Math.floor(Math.random() * 100) + 1

        updateTodayActivity(score)

        calculateStreak()

    } else {

        alert("Wrong Answer")

    }

}

function calculateStreak() {

    const activity = JSON.parse(localStorage.getItem("activityData") || "{}")

    let streak = 0

    let current = new Date()

    while (true) {

        const key = current.toISOString().split("T")[0]

        if (activity[key] && activity[key].solved) {

            streak++

            current.setDate(current.getDate() - 1)

        } else {

            break

        }

    }

    streakElement.innerText = "🔥 Current Streak: " + streak + " days"
}

startBtn.onclick = loadPuzzle
submitBtn.onclick = submitScore

loadPuzzle()
calculateStreak()
