// script.js

let words = [];
let usedWords = [];
let language = null;
let currentWord = '';
let currentCharIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let totalCount = 0;
let showCorrect = true;
let showWrong = true;
let showTotal = true;
let difficulties = [];

const wordDisplay = document.getElementById('currentWord');
const correctSpan = document.getElementById('correctContainer');
const wrongSpan = document.getElementById('wrongContainer');
const totalSpan = document.getElementById('totalContainer');
const stats = document.getElementById('stats');
const game = document.getElementById('game');
const menu = document.getElementById('menu');

// Load user settings
function loadSettings() {
  const theme = localStorage.getItem('theme') || 'dark';
  document.body.className = theme;
  document.querySelector(`#themeSelect button[data-theme="${theme}"]`)?.classList.add('selected');

  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  showCorrect = settings.showCorrect ?? true;
  showWrong = settings.showWrong ?? true;
  showTotal = settings.showTotal ?? true;
  difficulties = settings.difficulties || [];

  document.getElementById('showCorrect').checked = showCorrect;
  document.getElementById('showWrong').checked = showWrong;
  document.getElementById('showTotal').checked = showTotal;

  difficulties.forEach(d => {
    document.querySelector(`#difficultySelect button[data-difficulty="${d}"]`)?.classList.add('selected');
  });

  updateStatsDisplay();
}

// Save settings
function saveSettings() {
  const theme = document.querySelector('#themeSelect .selected')?.dataset.theme || 'dark';
  localStorage.setItem('theme', theme);
  document.body.className = theme;

  const selectedDiffs = [...document.querySelectorAll('#difficultySelect .selected')].map(btn => btn.dataset.difficulty);

  const settings = {
    showCorrect: document.getElementById('showCorrect').checked,
    showWrong: document.getElementById('showWrong').checked,
    showTotal: document.getElementById('showTotal').checked,
    difficulties: selectedDiffs
  };
  localStorage.setItem('settings', JSON.stringify(settings));
  loadSettings();
}

// Reset settings
function resetSettings() {
  localStorage.removeItem('settings');
  localStorage.removeItem('theme');
  location.reload();
}

function updateStatsDisplay() {
  correctSpan.style.display = showCorrect ? 'inline' : 'none';
  wrongSpan.style.display = showWrong ? 'inline' : 'none';
  totalSpan.style.display = showTotal ? 'inline' : 'none';
  stats.style.display = (showCorrect || showWrong || showTotal) ? 'block' : 'none';
}

function loadWords() {
  const selectedDiffs = difficulties.length ? difficulties : ['1'];
  const promises = selectedDiffs.map(diff => fetch(`${language}${diff}.txt`).then(res => res.text()));

  Promise.all(promises).then(results => {
    words = results.flatMap(txt => txt.split(/\s+/).filter(w => w));
    startGame();
  });
}

function startGame() {
  menu.style.display = 'none';
  game.style.display = 'flex';
  usedWords = [];
  correctCount = 0;
  wrongCount = 0;
  totalCount = 0;
  nextWord();
  updateStats();
}

function nextWord() {
  const pool = words.filter(w => !usedWords.includes(w));
  if (pool.length === 0 || usedWords.length >= 20) usedWords = [];
  currentWord = pool[Math.floor(Math.random() * pool.length)];
  usedWords.push(currentWord);
  displayWord(currentWord);
  currentCharIndex = 0;
}

function displayWord(word) {
  wordDisplay.innerHTML = '';
  for (let char of word) {
    const span = document.createElement('span');
    span.textContent = char;
    span.className = 'letter';
    wordDisplay.appendChild(span);
  }
  wordDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function updateStats() {
  document.getElementById('correctCount').textContent = correctCount;
  document.getElementById('wrongCount').textContent = wrongCount;
  document.getElementById('totalCount').textContent = totalCount;
}

// Input handler
document.addEventListener('keydown', e => {
  if (!currentWord || !game.contains(wordDisplay)) return;
  const spans = wordDisplay.querySelectorAll('.letter');
  const expected = currentWord[currentCharIndex];
  const input = e.key;

  if (input.length === 1 && input.match(/\S/)) {
    const span = spans[currentCharIndex];
    if (input === expected) {
      span.classList.add('correct');
      correctCount++;
    } else {
      span.classList.add('wrong');
      wrongCount++;
    }
    currentCharIndex++;

    if (currentCharIndex === currentWord.length) {
      totalCount++;
      updateStats();
      setTimeout(nextWord, 300);
    }
  }
});

// UI button events
document.querySelectorAll('#languageSelect button').forEach(btn => {
  btn.addEventListener('click', () => {
    language = btn.dataset.lang;
    loadWords();
  });
});

document.querySelectorAll('#themeSelect button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#themeSelect button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

document.querySelectorAll('#difficultySelect button').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('selected');
  });
});

document.getElementById('saveSettings').addEventListener('click', saveSettings);
document.getElementById('resetSettings').addEventListener('click', resetSettings);
document.getElementById('settingsBtn').addEventListener('click', () => {
  document.getElementById('settingsPanel').classList.toggle('show');
});

// Initial load
loadSettings();
