let db = null;
let dbReady = false;
const dbCallbacks = [];

function onDBReady(fn) {
  if (dbReady) {
    fn();
  } else {
    dbCallbacks.push(fn);
  }
}

function initDB() {
  const request = indexedDB.open("PuzzleDB", 1);

  request.onupgradeneeded = function (e) {
    const database = e.target.result;
    if (!database.objectStoreNames.contains("activity")) {
      database.createObjectStore("activity", { keyPath: "date" });
    }
  };

  request.onsuccess = function (e) {
    db = e.target.result;
    dbReady = true;
    dbCallbacks.forEach(fn => fn());
    dbCallbacks.length = 0;
  };

  request.onerror = function () {
    console.error("IndexedDB failed to open");
  };
}

function saveToday(score, time, difficulty, callback) {
  onDBReady(function () {
    const today = getTodayKey();
    const tx = db.transaction("activity", "readwrite");
    const store = tx.objectStore("activity");
    store.put({
      date: today,
      solved: true,
      score: score,
      timeTaken: time,
      difficulty: difficulty,
      synced: false
    });
    tx.oncomplete = function () {
      if (callback) callback();
    };
  });
}

function getActivity(callback) {
  onDBReady(function () {
    const tx = db.transaction("activity", "readonly");
    const store = tx.objectStore("activity");
    const request = store.getAll();
    request.onsuccess = function () {
      const data = {};
      request.result.forEach(r => { data[r.date] = r; });
      callback(data);
    };
  });
}

function markSynced(dates, callback) {
  onDBReady(function () {
    const tx = db.transaction("activity", "readwrite");
    const store = tx.objectStore("activity");
    dates.forEach(date => {
      const req = store.get(date);
      req.onsuccess = function () {
        const record = req.result;
        if (record) {
          record.synced = true;
          store.put(record);
        }
      };
    });
    tx.oncomplete = function () {
      if (callback) callback();
    };
  });
}

initDB();
