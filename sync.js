const SYNC_URL = "https://example.com/sync/daily-scores"; // Replace with real backend URL

function syncData() {
  if (!navigator.onLine) {
    console.log("Offline — sync skipped");
    return;
  }

  getActivity(function (activity) {
    const unsynced = Object.values(activity).filter(a => !a.synced);

    if (unsynced.length === 0) {
      console.log("Nothing to sync");
      return;
    }

    fetch(SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: unsynced })
    })
      .then(res => {
        if (!res.ok) throw new Error("Server error: " + res.status);
        return res.json();
      })
      .then(() => {
        const dates = unsynced.map(e => e.date);
        markSynced(dates, function () {
          console.log("Sync success — marked " + dates.length + " entries synced");
        });
      })
      .catch(err => {
        console.warn("Sync failed:", err.message);
      });
  });
}

// Auto-sync when coming back online
window.addEventListener("online", function () {
  console.log("Back online — attempting sync");
  syncData();
  const banner = document.getElementById("offline-banner");
  if (banner) banner.classList.remove("show");
});

window.addEventListener("offline", function () {
  const banner = document.getElementById("offline-banner");
  if (banner) banner.classList.add("show");
});

// Set initial offline state
if (!navigator.onLine) {
  const banner = document.getElementById("offline-banner");
  if (banner) banner.classList.add("show");
}
