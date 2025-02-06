const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// dialog handlers 
const start_dialog = document.getElementById("start-menu-dialog");
const controls_dialog = document.getElementById("controls-menu-dialog");
const settings_dialog = document.getElementById("settings-menu-dialog");
const credits_dialog = document.getElementById("credits-menu-dialog");
let modal_history = [start_dialog];

function showControls() {
  modal_history[modal_history.length - 1].close();
  modal_history.push(controls_dialog);
  controls_dialog.showModal();
}
function showSettings() {
  modal_history[modal_history.length - 1].close();
  modal_history.push(settings_dialog);
  settings_dialog.showModal();
}
function showCredits() {
  modal_history[modal_history.length - 1].close();
  modal_history.push(credits_dialog);
  credits_dialog.showModal();
}
function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
}

// background handlers 
class BgLayer {
  constructor(img, speed = 1) {
    this.img = img;
    this.quotent = img.width / img.height;
    this.img.height = canvas.height;
    this.img.width = this.quotent * canvas.height;
    this.speed = speed;
    this.width = img.width;
    this.height = canvas.height;
    this.x1 = 0;
    this.x2 = img.width;
  }
  resize() {
    this.img.height = canvas.height;
    this.img.width = this.quotent * canvas.height;
    this.height = canvas.height;
    this.width = this.img.width;
    this.x1 = this.x1 - this.img.width;
    this.x2 = this.x2 - this.img.width;
  }

  draw() {
    ctx.drawImage(this.img, this.x1, 0, this.width, this.height);
    ctx.drawImage(this.img, this.x2, 0, this.width, this.height);
  }
  update() {
    if (this.x1 < -this.width + this.speed) {
      this.x1 = this.width - this.speed + this.x2;
    }
    if (this.x2 < -this.width + this.speed) {
      this.x2 = this.width - this.speed + this.x1;
    }
    this.x1 -= this.speed;
    this.x2 -= this.speed;
  }
}

const backgroundImages = Array.from(
  document.querySelectorAll("[data-layer-level]")
).sort(
  (a, b) =>
    a.attributes["data-layer-level"].value -
    b.attributes["data-layer-level"].value
);
const backgroundLayers = backgroundImages.map((image) => {
  return new BgLayer(image, image.attributes["data-layer-level"].value * 1);
});

const dialog_text = Array.from(
  document.querySelector("[data-text-order]")
).sort(
  (a, b) =>
    a.attributes["data-text-order"].value - b.attributes["data-text-order"].value
);
dialog_text.forEach((text) => {
  text.classList.add("visible-text");
});

// music handlers 
const music = new Audio("./assets/music/sunshineskirmish.mp3");
music.loop = true;
music.volume = 0.5;

function startMusic() {
  music.play();
}
function toggleSound() {
  if (music.paused) {
    music.play();
  } else {
    music.pause();
  }
}
function stopMusic() {
  music.pause();
}
function playMusic() {
  music.play();
}
function changeVolume(value) {
  if (music.volume + value < 1 && music.volume + value > 0) {
    music.volume = value;
  }
}


const player = {
  x: 10,
  Y: 260,
  width: 50,
  height: 80,
  Y_velocity: 0,
  grav: 0.5,
  jumping: false,
};

function applyGravity() {
  if (player.jumping) {
    player.Y_velocity += player.grav;
    player.Y += player.Y_velocity;
    checkLanding();
  }
}

function checkLanding() {
  if (player.Y >= 280) {
    player.Y = 280;
    player.jumping = false;
    player.Y_velocity = 0;
  }
}


const obstacles = [];
let lastObstacleTime = 0;
const obstacleSpawnRate = 1500; 

function spawnObstacle() {
  const obstacle = {
    x: canvas.width + Math.random() * 100,
    y: 280, 
    width: 50,
    height: 50,
    img: document.getElementById("obstacle"), 
  };
  obstacles.push(obstacle);
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    obstacle.x -= 5; 

    if (obstacle.x + obstacle.width < 0) {
      const index = obstacles.indexOf(obstacle);
      if (index > -1) {
        obstacles.splice(index, 1);
        score += 100; 
      }
    }
  });
}

function checkCollision() {
  obstacles.forEach((obstacle) => {
    if (
      player.x < obstacle.x + obstacle.width &&
      player.x + player.width > obstacle.x &&
      player.Y < obstacle.y + obstacle.height &&
      player.Y + player.height > obstacle.y
    ) {
      endGame();
    }
  });
}

function drawPlayer() {
  const playerImg = document.getElementById("player");
  ctx.drawImage(playerImg, player.x, player.Y, player.width, player.height);
}

// gameLoop
let game_started = false;
let paused = false;

function gameLoop(timestamp) {
  if (paused) {
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw images to canvas order of rendering is important
  backgroundLayers.forEach((layer) => layer.draw());

  // update positions of images to canvas
  backgroundLayers.forEach((layer) => layer.update());

  
  if (timestamp - lastObstacleTime > obstacleSpawnRate) {
    spawnObstacle();
    lastObstacleTime = timestamp;
  }

  drawObstacles();
  applyGravity();
  checkCollision();
  drawPlayer();
  displayScore();
  requestAnimationFrame(gameLoop);
}

// event listeners and handlers 
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !player.jumping) {
    player.jumping = true;
    player.Y_velocity = -10;
  }
});
window.addEventListener("keydown", (e) => {
  if (e.code === "Escape") {
    handleEscape(e);
  }
  if (e.code === "KeyM") {
    toggleSound();
  }
  if (e.code === "KeyV") {
    changeVolume(music.volume + 0.1);
  }
  if (e.code === "KeyB") {
    changeVolume(music.volume - 0.1);
  }
});

window.onload = function () {
  start_dialog.showModal();
  backgroundLayers.forEach((layer) => layer.draw());
};

window.onresize = function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  backgroundLayers.forEach((layer) => layer.resize());
};

// startGame 
function startGame() {
  game_started = true;
  score = 0;
  startMusic();
  gameLoop();
}

function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function endGame() {
  paused = true;
  stopMusic();
  alert("Game Over");
}

function displayScore() {
  const scoreElement = document.getElementById("score");
  scoreElement.textContent = `Score: ${score}`;
}
