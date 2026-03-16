const puzzleText = document.getElementById("puzzle")
const timerText = document.getElementById("timer")
const streakText = document.getElementById("streak")

const startBtn = document.getElementById("startPuzzle")
const submitBtn = document.getElementById("submitScore")
const hintBtn = document.getElementById("hintBtn")

let puzzle
let startTime
let timerInterval
let puzzleStarted = false
let hintsUsed = 0
const MAX_HINTS = 2

function loadPuzzle(){

if(puzzleStarted){
alert("Puzzle already started")
return
}

puzzle = getDailyPuzzle()

puzzleText.innerText = puzzle.q

startTime = Date.now()
puzzleStarted = true

timerInterval = setInterval(updateTimer,1000)

}

function updateTimer(){

if(!startTime) return

const now = Date.now()
const seconds = Math.floor((now-startTime)/1000)

timerText.innerText = "⏱ Time: "+seconds+"s"

}

function stopTimer(){

clearInterval(timerInterval)

const end = Date.now()

return Math.floor((end-startTime)/1000)

}

function calculateScore(time){

let score = 100 - time

if(score < 20) score = 20

return score

}

function submitPuzzle(){

if(!puzzleStarted){
alert("Start puzzle first")
return
}

const today = new Date().toISOString().split("T")[0]
const activity = getActivity()

if(activity[today]?.solved){
alert("Today's puzzle already completed")
return
}

const ans = prompt("Enter answer")

if(ans === puzzle.a){

const time = stopTimer()

const score = calculateScore(time)

alert("✅ Correct! Score: "+score)

saveToday(score,time)

renderHeatmap()

calculateStreak()

syncData()

}else{

alert("❌ Wrong answer")

}

}

function calculateStreak(){

const activity = getActivity()

let streak = 0

let d = new Date()

while(true){

const key = d.toISOString().split("T")[0]

if(activity[key]?.solved){

streak++

d.setDate(d.getDate()-1)

}else{

break

}

}

streakText.innerText = "🔥 Current Streak: "+streak+" days"

}

function showHint(){

if(!puzzleStarted){
alert("Start puzzle first")
return
}

if(hintsUsed >= MAX_HINTS){
alert("No hints left today")
return
}

hintsUsed++

alert("Hint: "+puzzle.hint)

}

function restoreProgress(){

const activity = getActivity()

const today = new Date().toISOString().split("T")[0]

if(activity[today]?.solved){

puzzleText.innerText = "✔ Puzzle already completed today"

timerText.innerText = "Completed"

}

}

startBtn.onclick = loadPuzzle
submitBtn.onclick = submitPuzzle
hintBtn.onclick = showHint

restoreProgress()

calculateStreak()
