let currentWords = [], lang = "", difficulty = [1], recentWords = [];
let showCorrect = true, showWrong = false, showTotal = false;
let correctCount = 0, wrongCount = 0, totalCount = 0;
let buffer = "";

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem("typeTestSettings") || "{}");
  if (saved.theme) document.body.className = saved.theme;
  if (saved.difficulty) difficulty = saved.difficulty;
  showCorrect = saved.showCorrect !== undefined ? saved.showCorrect : true;
  showWrong = saved.showWrong !== undefined ? saved.showWrong : false;
  showTotal = saved.showTotal !== undefined ? saved.showTotal : false;
  document.getElementById("showCorrect").checked = showCorrect;
  document.getElementById("showWrong").checked = showWrong;
  document.getElementById("showTotal").checked = showTotal;
  updateStats();
}

function saveSettings() {
  const settings = {
    theme: document.body.className,
    difficulty,
    showCorrect: document.getElementById("showCorrect").checked,
    showWrong: document.getElementById("showWrong").checked,
    showTotal: document.getElementById("showTotal").checked,
  };
  localStorage.setItem("typeTestSettings", JSON.stringify(settings));
}

function resetSettings() {
  localStorage.removeItem("typeTestSettings");
  location.reload();
}

async function fetchWords(lang, difficulty) {
  const promises = difficulty.map(lvl =>
    fetch(`${lang}${lvl}.txt`).then(res => res.text())
  );
  return Promise.all(promises).then(results => {
    return results.flatMap(r => r.split('\n').map(w => w.trim())).filter(Boolean);
  });
}

function getNextWord() {
  let word, attempts = 0;
  do {
    word = currentWords[Math.floor(Math.random() * currentWords.length)];
    attempts++;
  } while (recentWords.includes(word) && attempts < 50);
  
  recentWords.push(word);
  if (recentWords.length > 20) recentWords.shift();
  return word;
}

function showWord(word) {
  const el = document.getElementById("currentWord");
  el.innerHTML = "";
  word.split("").forEach(ch => {
    const span = document.createElement("span");
    span.textContent = ch;
    span.className = "letter";
    el.appendChild(span);
  });
}

function startGame() {
  if (!lang || difficulty.length === 0) return alert("Dil ve zorluk seçin!");
  
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").style.display = "flex";
  fetchWords(lang, difficulty).then(words => {
    currentWords = words;
    nextWord();
  });
}

function nextWord() {
  const word = getNextWord();
  showWord(word);
  buffer = "";
}

function updateStats() {
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("wrongCount").textContent = wrongCount;
  document.getElementById("totalCount").textContent = totalCount;

  document.getElementById("correctContainer").style.display = showCorrect ? "inline" : "none";
  document.getElementById("wrongContainer").style.display = showWrong ? "inline" : "none";
  document.getElementById("totalContainer").style.display = showTotal ? "inline" : "none";
}

function checkInput() {
  const currentWord = document.getElementById("currentWord").textContent;
  const el = document.getElementById("currentWord");

  Array.from(el.children).forEach(span => {
    span.className = "letter";
  });

  for (let i = 0; i < buffer.length; i++) {
    if (i >= currentWord.length) break;
    el.children[i].classList.add(buffer[i] === currentWord[i] ? "correct" : "wrong");
  }

  if (buffer === currentWord) {
    correctCount++;
    totalCount++;
    updateStats();
    nextWord();
  } else if (buffer.length === currentWord.length) {
    wrongCount++;
    totalCount++;
    updateStats();
    nextWord();
  }
}

window.addEventListener("keydown", (e) => {
  if (document.getElementById("game").style.display !== "flex") return;
  
  if (e.key === " ") {
    e.preventDefault();
    checkInput();
  } else if (/^[a-zA-ZçÇğĞıİöÖşŞüÜ]$/.test(e.key)) {
    buffer += e.key.toLowerCase();
    checkInput();
  } else if (e.key === "Backspace") {
    buffer = buffer.slice(0, -1);
    checkInput();
  }
});

document.getElementById("languageSelect").addEventListener("click", (e) => {
  if (e.target.dataset.lang) {
    lang = e.target.dataset.lang;
    startGame();
  }
});

document.getElementById("themeSelect").addEventListener("click", (e) => {
  if (e.target.dataset.theme) {
    document.body.className = e.target.dataset.theme;
  }
});

document.getElementById("difficultySelect").addEventListener("click", (e) => {
  const d = e.target.dataset.difficulty;
  if (!d) return;
  
  const idx = difficulty.indexOf(+d);
  if (idx > -1) {
    difficulty.splice(idx, 1);
    e.target.classList.remove("selected");
  } else {
    difficulty.push(+d);
    e.target.classList.add("selected");
  }
});

document.getElementById("saveSettings").addEventListener("click", saveSettings);
document.getElementById("resetSettings").addEventListener("click", resetSettings);
document.getElementById("settingsBtn").addEventListener("click", () => {
  document.getElementById("settingsPanel").classList.toggle("show");
});

loadSettings();