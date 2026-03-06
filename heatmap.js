const heatmap = document.getElementById("heatmap")

// Generate deterministic value based on date
function getLevelFromDate(date){

    const seed = date.getFullYear() + date.getMonth() + date.getDate()

    return seed % 5
}

function generateHeatmap(){

    const days = 365

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    for(let i = 0; i < days; i++){

        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        const cell = document.createElement("div")
        cell.classList.add("heatmap-cell")

        const level = getLevelFromDate(date)

        if(level > 0){
            cell.classList.add("level-" + level)
        }

        cell.title = date.toDateString()

        heatmap.appendChild(cell)
    }

}

generateHeatmap()
