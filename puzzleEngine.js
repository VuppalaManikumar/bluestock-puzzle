// ════════════════════════════════════════════════
// PUZZLE ENGINE — SHA256-based deterministic seed
// ════════════════════════════════════════════════

const PUZZLE_SECRET = "bluestock_2026";

const PUZZLES = [
  { type:"sequence", q:"What comes next? 2, 4, 8, 16, __?",                                          a:"32",                      hint:"Each number doubles",              difficulty:1 },
  { type:"sequence", q:"What comes next? 3, 9, 27, 81, __?",                                         a:"243",                     hint:"Multiply by 3 each time",          difficulty:2 },
  { type:"sequence", q:"What comes next? 1, 1, 2, 3, 5, 8, __?",                                     a:"13",                      hint:"Add the two previous numbers",     difficulty:2 },
  { type:"sequence", q:"What comes next? 100, 50, 25, 12.5, __?",                                    a:"6.25",                    hint:"Divide by 2 each time",            difficulty:2 },
  { type:"sequence", q:"What comes next? 2, 6, 12, 20, 30, __?",                                     a:"42",                      hint:"Differences: 4,6,8,10...",         difficulty:3 },
  { type:"sequence", q:"What comes next? 1, 4, 9, 16, 25, __?",                                      a:"36",                      hint:"Perfect squares",                  difficulty:1 },
  { type:"math",     q:"Calculate: 12 × 8 = ?",                                                      a:"96",                      hint:"12 × 8 = 12 × 4 × 2",             difficulty:1 },
  { type:"math",     q:"Calculate: 144 ÷ 12 = ?",                                                    a:"12",                      hint:"12 × 12 = 144",                    difficulty:1 },
  { type:"math",     q:"Calculate: 15% of 200 = ?",                                                  a:"30",                      hint:"10% is 20, 5% is 10",              difficulty:2 },
  { type:"math",     q:"Calculate: 7² + 3² = ?",                                                     a:"58",                      hint:"7²=49, 3²=9",                      difficulty:2 },
  { type:"math",     q:"Calculate: √196 = ?",                                                        a:"14",                      hint:"14 × 14 = ?",                      difficulty:2 },
  { type:"logic",    q:"5 cats catch 5 mice in 5 minutes. How long for 1 cat to catch 1 mouse?",     a:"5",                       hint:"Each cat = 1 mouse in 5 mins",     difficulty:3 },
  { type:"logic",    q:"A rooster lays an egg on a roof. Which side does it roll down?",              a:"roosters don't lay eggs", hint:"Think what a rooster is",          difficulty:3 },
  { type:"logic",    q:"I speak without a mouth, heard without ears, have no body. What am I?",       a:"echo",                    hint:"It repeats what you say",          difficulty:3 },
  { type:"logic",    q:"The more you take, the more you leave behind. What am I?",                   a:"footsteps",               hint:"Think about walking",              difficulty:3 },
  { type:"word",     q:"SILENT is an anagram of which 6-letter word?",                               a:"listen",                  hint:"Use all the same letters",         difficulty:2 },
  { type:"word",     q:"What 4-letter word can follow: OVER, UNDER, OUT, AND?",                      a:"come",                    hint:"Overcome, undercome...",           difficulty:2 },
];

// SHA256-based seed (async, falls back to simple hash)
async function generateSeedAsync() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const msg = today + "|" + PUZZLE_SECRET;
    const msgBuf = new TextEncoder().encode(msg);
    const hashBuf = await crypto.subtle.digest("SHA-256", msgBuf);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    // Use first 4 bytes as uint32
    return (hashArr[0] << 24 | hashArr[1] << 16 | hashArr[2] << 8 | hashArr[3]) >>> 0;
  } catch (e) {
    // Fallback: simple hash
    const today = new Date().toISOString().split("T")[0];
    let h = 5381;
    for (let i = 0; i < today.length; i++) h = (h * 33) ^ today.charCodeAt(i);
    return Math.abs(h);
  }
}

// Sync wrapper for immediate use (uses simple hash)
function generateSeed() {
  const today = new Date().toISOString().split("T")[0];
  let h = 5381;
  for (let i = 0; i < today.length; i++) h = (h * 33) ^ today.charCodeAt(i);
  return Math.abs(h);
}

function getDailyPuzzle() {
  const seed = generateSeed();
  return PUZZLES[seed % PUZZLES.length];
}

// Async version (preferred — uses SHA256)
async function getDailyPuzzleAsync() {
  const seed = await generateSeedAsync();
  return PUZZLES[seed % PUZZLES.length];
}

// Case + punctuation insensitive answer check
function checkAnswer(userAnswer, correctAnswer) {
  const normalize = s => s.trim().toLowerCase().replace(/[^a-z0-9.\s]/g, "").replace(/\s+/g, " ");
  return normalize(userAnswer) === normalize(correctAnswer);
}
