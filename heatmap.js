const heatmap = document.getElementById("heatmap")

function generateHeatmap() {

    const days = 365

    for (let i = 0; i < days; i++) {

        const cell = document.createElement("div")

        cell.classList.add("heatmap-cell")

        const level = Math.floor(Math.random() * 5)

        if (level > 0) {
            cell.classList.add("level-" + level)
        }

        heatmap.appendChild(cell)

    }

}

generateHeatmap()