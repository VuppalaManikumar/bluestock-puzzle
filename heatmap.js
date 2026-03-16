const heatmap=document.getElementById("heatmap")

function intensity(entry){

if(!entry) return 0

if(entry.score>90) return 4
if(entry.score>70) return 3
if(entry.score>40) return 2
return 1

}

function renderHeatmap(){

getActivity(function(activity){

heatmap.innerHTML=""

const days=365

const start=new Date()

start.setDate(start.getDate()-days)

for(let i=0;i<days;i++){

const d=new Date(start)

d.setDate(start.getDate()+i)

const key=d.toISOString().split("T")[0]

const cell=document.createElement("div")

cell.classList.add("heatmap-cell")

const entry=activity[key]

const level=intensity(entry)

if(level>0){
cell.classList.add("level-"+level)
cell.classList.add("active")
}

if(entry){

cell.title=
key+
"\nScore:"+entry.score+
"\nTime:"+entry.timeTaken+
"\nDifficulty:"+entry.difficulty

}else{

cell.title=key+"\nNo puzzle solved"

}

heatmap.appendChild(cell)

}

})

}

renderHeatmap()
