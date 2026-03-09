const PUZZLES=[
{q:"2,4,8,16, ?",a:"32",hint:"Numbers double each step"},
{q:"3,9,27, ?",a:"81",hint:"Multiply by 3"},
{q:"5,10,20, ?",a:"40",hint:"Multiply by 2"},
{q:"7,14,28, ?",a:"56",hint:"Multiply by 2"}
]

function generateSeed(){
const today=new Date().toISOString().split("T")[0]
let hash=0
for(let i=0;i<today.length;i++){
hash=today.charCodeAt(i)+((hash<<5)-hash)
}
return Math.abs(hash)
}

function getDailyPuzzle(){
const seed=generateSeed()
return PUZZLES[seed%PUZZLES.length]
}
