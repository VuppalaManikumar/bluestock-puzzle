const puzzleText=document.getElementById("puzzle")
const timerText=document.getElementById("timer")
const streakText=document.getElementById("streak")

const startBtn=document.getElementById("startPuzzle")
const submitBtn=document.getElementById("submitScore")
const hintBtn=document.getElementById("hintBtn")

let puzzle
let startTime

function loadPuzzle(){

puzzle=getDailyPuzzle()

puzzleText.innerText=puzzle.q

startTime=Date.now()

timerText.innerText="Timer started"

}

function stopTimer(){

const end=Date.now()
return Math.floor((end-startTime)/1000)

}

function calculateScore(time){

let score=100-time

if(score<10)score=10

return score

}

function submitPuzzle(){

const ans=prompt("Enter answer")

if(ans===puzzle.a){

const time=stopTimer()

const score=calculateScore(time)

alert("Correct! Score:"+score)

saveToday(score,time)

renderHeatmap()

calculateStreak()

syncData()

}else{

alert("Wrong answer")

}

}

function calculateStreak(){

const activity=getActivity()

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

streakText.innerText="🔥 Current Streak: "+streak+" days"

}

function showHint(){
alert(puzzle.hint)
}

startBtn.onclick=loadPuzzle
submitBtn.onclick=submitPuzzle
hintBtn.onclick=showHint

calculateStreak()
