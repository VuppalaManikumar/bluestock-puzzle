// ════════════════════════════════════════════════
// STORAGE.JS — IndexedDB (Offline-First)
// Race-condition safe, GitHub Pages compatible
// ════════════════════════════════════════════════

let db = null;
let dbReady = false;
const dbCallbacks = [];

// Expose a promise so boot can await it
let dbReadyResolve;
const dbReadyPromise = new Promise(resolve => { dbReadyResolve = resolve; });

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function onDBReady(fn) {
  if (dbReady) { fn(); } else { dbCallbacks.push(fn); }
}

function initDB() {
  try {
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
      dbReadyResolve(true); // ← unblocks boot
      console.log("✅ IndexedDB ready");
    };

    request.onerror = function (e) {
      console.warn("IndexedDB error — falling back to memory store", e);
      // Fallback: in-memory store so app still works
      db = createMemoryStore();
      dbReady = true;
      dbCallbacks.forEach(fn => fn());
      dbCallbacks.length = 0;
      dbReadyResolve(true); // ← still unblocks boot
    };

    request.onblocked = function () {
      console.warn("IndexedDB blocked — resolving anyway");
      dbReadyResolve(true);
    };

  } catch (err) {
    console.warn("IndexedDB not available — using memory store", err);
    db = createMemoryStore();
    dbReady = true;
    dbReadyResolve(true);
  }
}

// ── In-memory fallback store (private browsing / iOS quirks) ──
function createMemoryStore() {
  const store = {};
  return {
    _memStore: store,
    transaction: function(name, mode) {
      return {
        objectStore: function() {
          return {
            put: function(record) { store[record.date] = record; },
            get: function(key) {
              const r = { result: store[key] || null };
              setTimeout(() => { if (r.onsuccess) r.onsuccess(); }, 0);
              return r;
            },
            getAll: function() {
              const r = { result: Object.values(store) };
              setTimeout(() => { if (r.onsuccess) r.onsuccess(); }, 0);
              return r;
            }
          };
        },
        oncomplete: null,
        _complete: function() { if (this.oncomplete) this.oncomplete(); }
      };
    }
  };
}

function saveToday(score, time, difficulty) {
  onDBReady(function () {
    const today = getTodayKey();
    try {
      const tx = db.transaction("activity", "readwrite");
      const s = tx.objectStore("activity");
      s.put({ date: today, solved: true, score, timeTaken: time, difficulty, synced: false });
      tx.oncomplete = function () { console.log("💾 Saved activity for", today); };
    } catch (e) {
      console.warn("saveToday error", e);
    }
  });
}

function getActivity(callback) {
  onDBReady(function () {
    try {
      const tx = db.transaction("activity", "readonly");
      const s = tx.objectStore("activity");
      const req = s.getAll();
      req.onsuccess = function () {
        const data = {};
        (req.result || []).forEach(r => { data[r.date] = r; });
        callback(data);
      };
      req.onerror = function () { callback({}); };
    } catch (e) {
      console.warn("getActivity error", e);
      callback({});
    }
  });
}

function markSynced(dates) {
  onDBReady(function () {
    try {
      const tx = db.transaction("activity", "readwrite");
      const s = tx.objectStore("activity");
      dates.forEach(date => {
        const req = s.get(date);
        req.onsuccess = function () {
          if (req.result) { req.result.synced = true; s.put(req.result); }
        };
      });
    } catch (e) {
      console.warn("markSynced error", e);
    }
  });
}

initDB();
