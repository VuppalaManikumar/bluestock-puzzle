const PUZZLES=[

{type:"sequence",q:"2,4,8,16, ?",a:"32",hint:"Numbers double each step",difficulty:1},

{type:"sequence",q:"3,9,27, ?",a:"81",hint:"Multiply by 3",difficulty:2},

{type:"math",q:"What is 12 × 8 ?",a:"96",hint:"Multiplication",difficulty:1},

{type:"logic",q:"If 5 cats catch 5 mice in 5 minutes, how many minutes for 1 cat to catch 1 mouse?",a:"5",hint:"Think proportion",difficulty:3}

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
