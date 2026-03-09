function getActivity(){
const data=localStorage.getItem("activityData")
if(data)return JSON.parse(data)
return{}
}

function saveActivity(data){
localStorage.setItem("activityData",JSON.stringify(data))
}

function saveToday(score,time){
const activity=getActivity()
const today=new Date().toISOString().split("T")[0]

activity[today]={
score:score,
time:time,
solved:true
}

saveActivity(activity)
}
