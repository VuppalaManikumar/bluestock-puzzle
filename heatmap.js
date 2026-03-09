const heatmap = document.getElementById("heatmap")

function getActivityData() {

    const data = localStorage.getItem("activityData")

    if (data) {
        return JSON.parse(data)
    }

    return {}
}

function saveActivityData(data) {
    localStorage.setItem("activityData", JSON.stringify(data))
}

function calculateIntensity(score) {

    if (score >= 90) return 4
    if (score >= 70) return 3
    if (score >= 40) return 2
    if (score > 0) return 1

    return 0
}

function generateHeatmap() {

    heatmap.innerHTML = ""

    const activity = getActivityData()

    const days = 365

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    for (let i = 0; i < days; i++) {

        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        const key = date.toISOString().split("T")[0]

        const cell = document.createElement("div")
        cell.classList.add("heatmap-cell")

        if (activity[key]) {

            const level = calculateIntensity(activity[key].score)

            if (level > 0) {
                cell.classList.add("level-" + level)
            }

            cell.title = key + " | Score: " + activity[key].score

        } else {

            cell.title = key + " | No activity"

        }

        heatmap.appendChild(cell)
    }

}

function updateTodayActivity(score) {

    const activity = getActivityData()

    const today = new Date().toISOString().split("T")[0]

    activity[today] = {
        score: score,
        solved: true
    }

    saveActivityData(activity)

    generateHeatmap()
}

generateHeatmap()

window.updateTodayActivity = updateTodayActivity
