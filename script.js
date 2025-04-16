// script.js

let language = null;
let theme = localStorage.getItem('theme') || 'dark';
let difficulties = JSON.parse(localStorage.getItem('difficulties')) || ['1'];
let settings = JSON.parse(localStorage.getItem('settings')) || {
  showCorrect: true,
  showWrong: true,
  showTotal: true
};

let words = [];
let usedWords = [];
let repeatThreshold = 20;
let currentWord = '';
let currentIndex = 0;
let correct = 0;
let wrong = 0;
let total = 0;

const currentWordDiv = document.getElementById('currentWord');
const correctCount = document.getElementById('correctCount');
const wrongCount = document.getElementById('wrongCount');
const totalCount = document.getElementById('totalCount');
const stats = document.getElementById('stats');

const languageButtons = document.querySelectorAll('#languageSelect button');
const themeButtons = document.querySelectorAll('#themeSelect button');
const difficultyButtons = document.querySelectorAll('#difficultySelect button');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const saveSettings = document.getElementById('saveSettings');
const resetSettings = document.getElementById('resetSettings');

function applyTheme(themeName) {
  document.body.className = themeName;
  localStorage.setItem('theme', themeName);
}

function applySettings() {
  document.getElementById('showCorrect').checked = settings.showCorrect;
  document.getElementById('showWrong').checked = settings.showWrong;
  document.getElementById('showTotal').checked = settings.showTotal;
  toggleStatsVisibility();
}

function toggleStatsVisibility() {
  stats.style.display = 'none';
  if (settings.showCorrect || settings.showWrong || settings.showTotal) {
    stats.style.display = 'block';
    document.getElementById('correctContainer').style.display = settings.showCorrect ? 'inline' : 'none';
    document.getElementById('wrongContainer').style.display = settings.showWrong ? 'inline' : 'none';
    document.getElementById('totalContainer').style.display = settings.showTotal ? 'inline' : 'none';
  }
}

function loadWords() {
  const promises = difficulties.map(dif => fetch(`${language}${dif}.txt`).then(res => res.text()));
  return Promise.all(promises).then(datas => {
    const wordSet = new Set();
    datas.forEach(data => {
      data.split(/\s+/).forEach(word => wordSet.add(word));
    });
    words = Array.from(wordSet);
  });
}

function pickNewWord() {
  if (usedWords.length >= repeatThreshold) {
    usedWords.shift();
  }
  let newWord;
  do {
    newWord = words[Math.floor(Math.random() * words.length)];
  } while (usedWords.includes(newWord));
  usedWords.push(newWord);
  return newWord;
}

function displayWord(word) {
  currentWordDiv.innerHTML = '';
  word.split('').forEach(letter => {
    const span = document.createElement('span');
    span.textContent = letter;
    span.classList.add('letter');
    currentWordDiv.appendChild(span);
  });
}

function resetGame() {
  correct = 0;
  wrong = 0;
  total = 0;
  updateStats();
  currentIndex = 0;
  currentWord = pickNewWord();
  displayWord(currentWord);
}

function updateStats() {
  correctCount.textContent = correct;
  wrongCount.textContent = wrong;
  totalCount.textContent = total;
}

document.addEventListener('keydown', (e) => {
  if (!currentWord) return;
  const letterSpans = document.querySelectorAll('.letter');
  if (e.key === currentWord[currentIndex]) {
    letterSpans[currentIndex].classList.add('correct');
    correct++;
  } else {
    letterSpans[currentIndex].classList.add('wrong');
    wrong++;
  }
  currentIndex++;
  total++;

  if (currentIndex >= currentWord.length) {
    currentIndex = 0;
    currentWord = pickNewWord();
    displayWord(currentWord);
  }
  updateStats();
});

languageButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    language = btn.dataset.lang;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game').style.display = 'flex';
    if (difficulties.length === 0) {
      alert("Lütfen en az bir zorluk seçiniz.");
      location.reload();
      return;
    }
    loadWords().then(() => {
      resetGame();
    });
  });
});

themeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    themeButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    theme = btn.dataset.theme;
    applyTheme(theme);
  });
});

difficultyButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.dataset.difficulty;
    if (difficulties.includes(value)) {
      difficulties = difficulties.filter(d => d !== value);
    } else {
      difficulties.push(value);
    }
    btn.classList.toggle('selected');
  });
});

settingsBtn.addEventListener('click', () => {
  settingsPanel.classList.toggle('show');
});

saveSettings.addEventListener('click', () => {
  settings.showCorrect = document.getElementById('showCorrect').checked;
  settings.showWrong = document.getElementById('showWrong').checked;
  settings.showTotal = document.getElementById('showTotal').checked;
  localStorage.setItem('settings', JSON.stringify(settings));
  localStorage.setItem('difficulties', JSON.stringify(difficulties));
  applySettings();
  settingsPanel.classList.remove('show');
});

resetSettings.addEventListener('click', () => {
  localStorage.removeItem('settings');
  localStorage.removeItem('difficulties');
  location.reload();
});

applyTheme(theme);
applySettings();

difficulties.forEach(value => {
  const btn = document.querySelector(`#difficultySelect button[data-difficulty="${value}"]`);
  if (btn) btn.classList.add('selected');
});

document.querySelector(`#themeSelect button[data-theme="${theme}"]`)?.classList.add('selected');
