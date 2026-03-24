// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');
const can = document.getElementById('can');
const tree = document.getElementById('tree');
const scoreElement = document.querySelector('.score-card .score');
const highScoreElement = document.querySelector('.score-card .high-score');
const restartButton = document.getElementById('restart-button');
const startButton = document.getElementById('start-button');
const easyButton = document.getElementById('easy-button');
const mediumButton = document.getElementById('medium-button');
const hardButton = document.getElementById('hard-button');
const village = document.getElementById('village');
const gameContainer = document.querySelector('.game');
const halfwayMessage = document.getElementById('halfway-message');

// Preload jump sound
const jumpSound = new Audio('sounds/freesound_community-cartoon-jump-6462.mp3');

let difficulty = 'easy'; // default
const durations = {
  easy: { desktop: 1.5, mobile: 1.2 },
  medium: { desktop: 1.0, mobile: 0.8 },
  hard: { desktop: 0.7, mobile: 0.5 }
};
const villageThresholds = {
  easy: 10,
  medium: 30,
  hard: 60
};

// Land background scroll speeds: slower for easy, faster for hard
const landDurations = {
  easy: '10s',
  medium: '5s',
  hard: '3s'
};

// Speed boost settings: smooth per-second speed-up so player can adapt.
let currentTreeDuration = 0;
const speedBoostIntervalSeconds = 3; // apply every sec for smoother ramping
const speedBoostFactor = 1; // ~2% faster each second

let isGameOver = false;
let isPlaying = false; // true once the game timer is running
let halfwayShown = false; // flag to show halfway message only once per game

function jump() {
  if (isGameOver) return;

  if (!isPlaying) {
    startGame();
    setHighScore(highscore); // Show high score during the game
  }

  if (can.classList.contains("jump")) return;

  // Play jump sound
  jumpSound.currentTime = 0;
  jumpSound.play().catch(e => console.error('Jump sound failed:', e));

  can.classList.add("jump");

  setTimeout(function() {
    can.classList.remove("jump");
  }, 300);
}

let isAlive = setInterval(function() {
  // Get current positions
 let canTop = parseInt(window.getComputedStyle(can).getPropertyValue("top"));

 if (window.innerWidth <= 600) {
   // Vertical collision (mobile)
   let treeTop = parseInt(window.getComputedStyle(tree).getPropertyValue("top"));
   if (treeTop < canTop + 70 && treeTop + 50 > canTop && canTop >= 145) {
     can.classList.add("flip");
     endGame();
   }
 } else {
   // Horizontal collision (desktop)
   let treeLeft = parseInt(window.getComputedStyle(tree).getPropertyValue("left"));
   if (treeLeft < -80 && treeLeft > -140 && canTop >= 230) {
     can.classList.add("flip");
     endGame();
   }
 }

},10);

document.addEventListener('keydown', function(event) {
  jump();
});

restartButton.addEventListener('click', function() {
  startGame();
});

startButton.addEventListener('click', function() {
  startGame();
  startButton.classList.add('hidden');
});

// Difficulty button event listeners
easyButton.addEventListener('click', () => setDifficulty('easy'));
mediumButton.addEventListener('click', () => setDifficulty('medium'));
hardButton.addEventListener('click', () => setDifficulty('hard'));

function setDifficulty(level) {
  difficulty = level;
  // Remove selected class from all buttons
  document.querySelectorAll('.difficulty-button').forEach(btn => btn.classList.remove('selected'));
  // Add selected class to the clicked button
  document.getElementById(`${level}-button`).classList.add('selected');
  // Update land scroll speed based on difficulty
  document.documentElement.style.setProperty('--land-duration', landDurations[level]);
}

// Add click to jump on mobile
if (window.innerWidth <= 600) {
  document.addEventListener('click', function(event) {
    // Prevent jump on button clicks
    if (event.target !== restartButton) {
      jump();
    }
  });
}

//score (seconds survived)
let score = 0;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const MM = String(minutes).padStart(2, '0');
  const SS = String(secs).padStart(2, '0');
  return `${MM}:${SS}`;
}

function setScore(newScore) {
  score = newScore;
  scoreElement.innerText = formatTime(score);
}

let scoreInterval;

function showRestartButton(text = 'Restart') {
  restartButton.textContent = text;
  restartButton.classList.remove('hidden');
}

function hideRestartButton() {
  restartButton.classList.add('hidden');
}

function startGame() {
  // Reset game state
  isGameOver = false;
  isPlaying = true;
  halfwayShown = false; // reset halfway message flag
  halfwayMessage.classList.add('hidden'); // hide message
  hideRestartButton();

  // Reset timer and score
  clearInterval(scoreInterval);
  score = 0;
  setScore(score);

  // Hide village
  village.classList.add('hidden');

  // Reset can position and tree animation
  can.classList.remove('jump');
  can.classList.remove('flip');
  tree.style.animation = 'none';
  // Force reflow to restart CSS animation
  // eslint-disable-next-line no-unused-expressions
  tree.offsetWidth;
  tree.style.animation = '';

  // Start the tree animation with selected difficulty
  const dur = durations[difficulty];
  if (window.innerWidth <= 600) {
    currentTreeDuration = dur.mobile;
  } else {
    currentTreeDuration = dur.desktop;
  }
  applyTreeAnimation();

  // Set land scroll speed for current difficulty
  document.documentElement.style.setProperty('--land-duration', landDurations[difficulty]);

  // Start moving land background while playing
  gameContainer.classList.add('playing');

  // Start counting
  countScore();
}

function endGame() {
  // Stop the game and timer
  isGameOver = true;
  isPlaying = false;
  clearInterval(scoreInterval);
  tree.style.animation = 'none';

  // Stop land background motion too
  gameContainer.classList.remove('playing');

  // Update high score if current run is better
  if (score > highscore) {
    highscore = score;
    localStorage.setItem('highscore', highscore);
  }

  // Set BEST to the current high score
  setHighScore(highscore);

  alert("Game Over!");
  showRestartButton('Restart');
}

function winGame() {
  isPlaying = false;
  clearInterval(scoreInterval);
  tree.style.animation = 'none';

  // Show congratulations and restart after user dismisses dialog
  setTimeout(() => {
    alert('Congratulations! You gave the town water!                                    Donate to charity: water to change lives!                                            Click OK to restart.');
    startGame();
  }, 50);
}

function applyTreeAnimation() {
  tree.style.animation = `block ${currentTreeDuration}s infinite linear`;
}

function boostSpeed() {
  if (isGameOver || !isPlaying) return;

  currentTreeDuration = Math.max(0.3, currentTreeDuration * speedBoostFactor);
  applyTreeAnimation();
}

function countScore() {
  clearInterval(scoreInterval);
  scoreInterval = setInterval(() => {
    setScore(score + 1);

    // Check for halfway message
    const halfway = Math.floor(villageThresholds[difficulty] / 2);
    if (!halfwayShown && score >= halfway) {
      halfwayMessage.innerText = `Halfway there!`;
      halfwayMessage.classList.remove('hidden');
      setTimeout(() => {
        halfwayMessage.classList.add('hidden');
      }, 3000); // Show for 3 seconds
      halfwayShown = true;
    }

    // Smooth speed boost: apply each second to create gradual difficulty ramp.
    if (score > 0) {
      boostSpeed();
    }

    // Show village when player hits threshold for current difficulty.
    // Use >= to avoid timing skips and ensure easy shows at 10 seconds.
    if (score >= villageThresholds[difficulty] && village.classList.contains('hidden')) {
      village.classList.remove('hidden');
      winGame();
    }
  }, 1000); // Increment every second
}

let highscore = Number(localStorage.getItem('highscore')) || 0;

// Reset high score to 00:00
localStorage.setItem('highscore', 0);
highscore = 0;

let displayBest = highscore; // Initially show the stored high score

function setHighScore(newScore) {
  displayBest = newScore;
  highScoreElement.innerText = formatTime(displayBest);
}



// Initialize display
setScore(0);
setHighScore(0); // Start with 00:00 on load

// Set default difficulty to medium
setDifficulty('medium');

// Initialize land duration for default difficulty
document.documentElement.style.setProperty('--land-duration', landDurations[difficulty]);

// Start button is visible on load


   
