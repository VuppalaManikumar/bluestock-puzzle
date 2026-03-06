const puzzleElement = document.getElementById("puzzle")

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

loadPuzzle()