// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');
const can = document.getElementById('can');
const tree = document.getElementById('tree');
const scoreElement = document.querySelector('.score-card .score');
const highScoreElement = document.querySelector('.score-card .high-score');
const restartButton = document.getElementById('restart-button');
const startButton = document.getElementById('start-button');

let isGameOver = false;
let isPlaying = false; // true once the game timer is running

function jump() {
  if (isGameOver) return;

  if (!isPlaying) {
    startGame();
    setHighScore(highscore); // Show high score during the game
  }

  if (can.classList.contains("jump")) return;

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
     endGame();
   }
 } else {
   // Horizontal collision (desktop)
   let treeLeft = parseInt(window.getComputedStyle(tree).getPropertyValue("left"));
   if (treeLeft < -80 && treeLeft > -140 && canTop >= 230) {
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
  hideRestartButton();

  // Reset timer and score
  clearInterval(scoreInterval);
  score = 0;
  setScore(score);

  // Reset can position and tree animation
  can.classList.remove('jump');
  tree.style.animation = 'none';
  // Force reflow to restart CSS animation
  // eslint-disable-next-line no-unused-expressions
  tree.offsetWidth;
  tree.style.animation = '';

  // Start the tree animation
  if (window.innerWidth <= 600) {
    tree.style.animation = 'block 0.8s infinite linear';
  } else {
    tree.style.animation = 'block 1s infinite linear';
  }

  // Start counting
  countScore();
}

function endGame() {
  // Stop the game and timer
  isGameOver = true;
  isPlaying = false;
  clearInterval(scoreInterval);
  tree.style.animation = 'none';

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

function countScore() {
  clearInterval(scoreInterval);
  scoreInterval = setInterval(() => {
    setScore(score + 1);
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

// Start button is visible on load

   
