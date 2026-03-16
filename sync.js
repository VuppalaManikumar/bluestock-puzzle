function syncData(){

if(!navigator.onLine){
console.log("Offline mode")
return
}

getActivity(function(activity){

const entries=Object.values(activity).filter(a=>!a.synced)

if(entries.length===0) return

fetch("https://example.com/sync/daily-scores",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({entries:entries})

})
.then(()=>console.log("Sync success"))
.catch(()=>console.log("Sync failed"))

})

}
