let currentWords = [], currentIndex = 0, lang = "", difficulty = [1], recentWords = [];
let showCorrect = true, showWrong = false, showTotal = false;
let correctCount = 0, wrongCount = 0, totalCount = 0;

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem("typeTestSettings") || "{}");
  if (saved.theme) document.body.className = saved.theme;
  if (saved.difficulty) difficulty = saved.difficulty;
  document.getElementById("showCorrect").checked = saved.showCorrect || false;
  document.getElementById("showWrong").checked = saved.showWrong || false;
  document.getElementById("showTotal").checked = saved.showTotal || false;
}

function saveSettings() {
  const theme = document.body.className;
  const settings = {
    theme,
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

function fetchWords(lang, difficulty) {
  const promises = difficulty.map(lvl =>
    fetch(`${lang}${lvl}.txt`).then(res => res.text())
  );
  return Promise.all(promises).then(results => {
    const all = results.flatMap(r => r.split('\n').map(w => w.trim())).filter(Boolean);
    return all;
  });
}

function getNextWord(words) {
  let word;
  let attempts = 0;
  do {
    word = words[Math.floor(Math.random() * words.length)];
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
  if (!lang || difficulty.length === 0) {
    alert("Dil ve en az bir zorluk seçilmeli!");
    return;
  }
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").style.display = "flex";
  document.getElementById("stats").style.display = "block";
  fetchWords(lang, difficulty).then(words => {
    currentWords = words;
    nextWord();
  });
}

function nextWord() {
  const word = getNextWord(currentWords);
  showWord(word);
  currentIndex++;
  updateStats();
}

function updateStats() {
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("wrongCount").textContent = wrongCount;
  document.getElementById("totalCount").textContent = totalCount;

  document.getElementById("correctContainer").style.display = showCorrect ? "inline" : "none";
  document.getElementById("wrongContainer").style.display = showWrong ? "inline" : "none";
  document.getElementById("totalContainer").style.display = showTotal ? "inline" : "none";
}

function checkWord(inputWord) {
  const currentWord = document.getElementById("currentWord").innerText;
  if (inputWord === currentWord) {
    correctCount++;
    totalCount++;
    nextWord();
  } else if (inputWord.length === currentWord.length) {
    wrongCount++;
    totalCount++;
    nextWord();
  }
}

document.getElementById("languageSelect").addEventListener("click", e => {
  if (e.target.dataset.lang) {
    lang = e.target.dataset.lang;
    startGame();
  }
});

document.getElementById("themeSelect").addEventListener("click", e => {
  const theme = e.target.dataset.theme;
  if (!theme) return;
  document.body.className = theme;
});

document.getElementById("difficultySelect").addEventListener("click", e => {
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

document.getElementById("saveSettings").addEventListener("click", () => {
  showCorrect = document.getElementById("showCorrect").checked;
  showWrong = document.getElementById("showWrong").checked;
  showTotal = document.getElementById("showTotal").checked;
  saveSettings();
  updateStats();
});

document.getElementById("resetSettings").addEventListener("click", resetSettings);

document.getElementById("settingsBtn").addEventListener("click", () => {
  document.getElementById("settingsPanel").classList.toggle("show");
});

document.getElementById("wordInput").addEventListener("input", (e) => {
  checkWord(e.target.value);
});

loadSettings();
