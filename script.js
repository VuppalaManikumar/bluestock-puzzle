const puzzleText=document.getElementById("puzzle")
const timerText=document.getElementById("timer")
const streakText=document.getElementById("streak")

const startBtn=document.getElementById("startPuzzle")
const submitBtn=document.getElementById("submitScore")
const hintBtn=document.getElementById("hintBtn")

let puzzle
let startTime
let timerInterval
let hintsUsed=0
const MAX_HINTS=2

function loadPuzzle(){

puzzle=getDailyPuzzle()

puzzleText.innerText=puzzle.q

startTime=Date.now()

timerInterval=setInterval(updateTimer,1000)

}

function updateTimer(){

const now=Date.now()

const seconds=Math.floor((now-startTime)/1000)

timerText.innerText="⏱ Time:"+seconds+"s"

}

function stopTimer(){

clearInterval(timerInterval)

const end=Date.now()

return Math.floor((end-startTime)/1000)

}

function calculateScore(time){

let base=120-time

let hintPenalty=hintsUsed*10

let score=base-hintPenalty

if(score<10)score=10

return score

}

function submitPuzzle(){

const ans=prompt("Enter answer")

if(ans===puzzle.a){

const time=stopTimer()

const score=calculateScore(time)

alert("Correct! Score:"+score)

saveToday(score,time,puzzle.difficulty)

renderHeatmap()

calculateStreak()

syncData()

}else{

alert("Wrong answer")

}

}

function calculateStreak(){

getActivity(function(activity){

let streak=0

let d=new Date()

while(true){

const key=d.toISOString().split("T")[0]

if(activity[key]?.solved){

streak++

d.setDate(d.getDate()-1)

}else{
break
}

}

streakText.innerText="🔥 Current Streak:"+streak+" days"

})

}

function showHint(){

if(hintsUsed>=MAX_HINTS){

alert("No hints left today")

return

}

hintsUsed++

alert("Hint:"+puzzle.hint)

}

startBtn.onclick=loadPuzzle
submitBtn.onclick=submitPuzzle
hintBtn.onclick=showHint

calculateStreak()
