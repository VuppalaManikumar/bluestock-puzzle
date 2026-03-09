const heatmap=document.getElementById("heatmap")

function intensity(score){

if(score>90)return 4
if(score>70)return 3
if(score>40)return 2
if(score>0)return 1
return 0

}

function renderHeatmap(){

heatmap.innerHTML=""

const activity=getActivity()

const days=365
const start=new Date()
start.setDate(start.getDate()-days)

for(let i=0;i<days;i++){

const d=new Date(start)
d.setDate(start.getDate()+i)

const key=d.toISOString().split("T")[0]

const cell=document.createElement("div")
cell.classList.add("heatmap-cell")

if(activity[key]){

const level=intensity(activity[key].score)

if(level>0)cell.classList.add("level-"+level)

cell.title=key+" Score:"+activity[key].score

}else{

cell.title=key

}

heatmap.appendChild(cell)

}

}

renderHeatmap()
