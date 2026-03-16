let db

function initDB(){

const request=indexedDB.open("PuzzleDB",1)

request.onupgradeneeded=function(e){

db=e.target.result

db.createObjectStore("activity",{keyPath:"date"})

}

request.onsuccess=function(e){

db=e.target.result

}

}

function saveToday(score,time,difficulty){

const today=new Date().toISOString().split("T")[0]

const tx=db.transaction("activity","readwrite")

const store=tx.objectStore("activity")

store.put({

date:today,
solved:true,
score:score,
timeTaken:time,
difficulty:difficulty,
synced:false

})

}

function getActivity(callback){

const tx=db.transaction("activity","readonly")

const store=tx.objectStore("activity")

const request=store.getAll()

request.onsuccess=function(){

let data={}

request.result.forEach(r=>{
data[r.date]=r
})

callback(data)

}

}

initDB()
