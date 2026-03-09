function syncData(){

if(!navigator.onLine){
console.log("Offline mode")
return
}

const activity=getActivity()

fetch("https://example.com/sync",{
method:"POST",
body:JSON.stringify(activity)
})
.then(()=>console.log("Sync success"))
.catch(()=>console.log("Sync failed"))

}
