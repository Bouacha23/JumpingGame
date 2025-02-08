const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
// dialog handlers
const menu_dialog = document.getElementById("menu-dialog");
const branko = document.getElementById("branko");

let currentTab = {
  contentId: "main-menu",
  buttonId: "main-menu-btn",
};

function openTab(elem, target) {
  elem.parentElement.classList.add("active");
  document
    .getElementById(currentTab.buttonId)
    .parentElement.classList.remove("active");
  document.getElementById(currentTab.contentId).classList.add("invisible");
  document.getElementById(target).classList.remove("invisible");
  currentTab.contentId = target;
  currentTab.buttonId = elem.id;
}
function scaleToAspectRatio(width, height, newHeight) {
  let quotent = width / height;
  return {quotent: quotent, width: quotent * newHeight, height: newHeight};
}
// background handlers
class BgLayer {
  constructor(img, speed = 1) {
    this.img = img;
    let {quotent, width, height} = scaleToAspectRatio(img.width, img.height, canvas.height);
    this.quotent = quotent;
    this.img.height = height;
    this.img.width = width;
    this.speed = speed;
    this.x1 = 0;
    this.x2 = this.img.width;
  }
  resize(height) {
    this.img.height = height;
    this.img.width = this.quotent * height;
    this.x1 = this.x1 - this.img.width;
    this.x2 = this.x2 - this.img.width;
  }

  draw() {
    ctx.drawImage(this.img, this.x1, 0, this.img.width, this.img.height);
    ctx.drawImage(this.img, this.x2, 0, this.img.width, this.img.height);
  }
  update(speed) {
    if (this.x1 < -this.img.width + this.speed) {
      this.x1 = this.img.width - this.speed + this.x2;
    }
    if (this.x2 < -this.img.width + this.speed) {
      this.x2 = this.img.width - this.speed + this.x1;
    }
    this.x1 -= this.speed;
    this.x2 -= this.speed;
    this.speed += speed;
  }
}

const backgroundImages = Array.from(
  document.querySelectorAll("[data-layer-level]")
).sort(
  (a, b) =>
    a.attributes["data-layer-level"].value -
    b.attributes["data-layer-level"].value
);
// TODO make spinner for that waits for all images to be loaded then open dialog
let loadedImages = 0;
const backgroundLayers = backgroundImages.map((image) => {
  image.onload = () => {
    loadedImages++;
  };
  return new BgLayer(image, image.attributes["data-layer-level"].value * 1);
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
const SFX_Jump = new Audio("./assets/sfx/jump.wav");
SFX_Jump.volume = 0.2;
SFX_Jump.loop = false;
function playJumpSound() {
  SFX_Jump.play();
}
const SFX_HIT = new Audio("./assets/sfx/hit.wav");
SFX_HIT.volume = 0.5;
SFX_HIT.loop = false;
function playHitSound() {
  SFX_HIT.play();
}
function controlSFXVolume(value) {
  if (SFX_Jump.volume + value < 1 && SFX_Jump.volume + value > 0) {
    SFX_Jump.volume = value;
    SFX_HIT.volume = value;
  }
}

function applyGravity() {
  if (player.jumping) {
    player.Y_velocity += player.grav;
    player.dy += player.Y_velocity;
    checkLanding();
  }
}

function checkLanding() {
  if (player.dy >= yFloorCords - player.dheight) {
    player.dy = yFloorCords - player.dheight;
    player.jumping = false;
    player.Y_velocity = 0;
  }
}

let obstacles = [];
let lastObstacleTime = 0;
const obstacleSpawnRate = 1500;
let yFloorCords = canvas.height - 70;
function spawnObstacle() {
  const obstacle = {
    sprite_type: Math.floor(Math.random() * 3) * 32,
    x: canvas.width + Math.random() * 100,
    y: yFloorCords - player.dheight/2,
    width: Math.floor(Math.random() * (50 - (player.dwidth/2)) + (player.dwidth/2)),
    height: (player.dwidth/2),
    img: document.getElementById("obstacle"),
    hit: false,
  };
  obstacles.push(obstacle);
}

function drawObstacles(x) {
  obstacles.forEach((obstacle) => {
    ctx.drawImage(
      obstacle.img,
      obstacle.sprite_type,
      0,
      32,
      32,
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );
    obstacle.x -= x;

    if (obstacle.x + obstacle.width < 0) {
      const index = obstacles.indexOf(obstacle);
      if (index > -1 && !obstacle.hit) {
        obstacles.splice(index, 1);
        score += 50;
      }
    }
  });
}

function checkCollision() {
  obstacles.forEach((obstacle) => {
    if (
      player.dx < obstacle.x + obstacle.width &&
      player.dx + player.dwidth > obstacle.x &&
      player.dy < obstacle.y + obstacle.height &&
      player.dy + player.dheight > obstacle.y
    ) {
      if (!obstacle.hit) {
        score -= 100;
        obstacle.hit = true;
        playHitSound();
      }

      if (score <= 0) {
        score = 0;
        setTimeout(endGame, 1);
      }
    }
  });
}

function drawPlayer() {
  let characterFrame = player.frames[player.currentCharacterFrame % 6];
  ctx.drawImage(
    branko,
    characterFrame.sx,
    characterFrame.sy,
    characterFrame.width,
    characterFrame.height,
    player.dx,
    player.dy,
    player.dwidth,
    player.dheight
  );
}
function updatePlayer(currentFrame) {
  if (currentFrame % player.frames.length == 0) {
    player.currentCharacterFrame++;
  }
}

// gameLoop
let game_started = false;
let paused = false;
let {quotent: playerQuotent, width: playerWidth, height: playerHeight} = scaleToAspectRatio(32, branko.height, 70);
const player = {
  img: branko,
  quotent: playerQuotent,
  frames: [
    { sx: 20, sy: 0, width: 20, height: 32 },
    { sx: 85, sy: 0, width: 20, height: 32 },
    { sx: 401, sy: 0, width: 20, height: 32 },
    { sx: 213, sy: 0, width: 20, height: 32 },
    { sx: 276, sy: 0, width: 20, height: 32 },
    { sx: 466, sy: 0, width: 20, height: 32 },
  ],
  currentCharacterFrame: 0,
  dx: 15,
  dy: yFloorCords - playerHeight,
  dwidth: playerWidth,
  dheight: playerHeight,
  Y_velocity: 0,
  grav: 0.6,
  jumping: false,
  resize: (height) => {
    player.dwidth = player.quotent * height;
    player.dheight = height;
    player.dy = yFloorCords - height;
  }
};
let currentFrame = 0;
let obstacleSpeed = 7;
function gameLoop(timestamp) {
  if (paused) {
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw images to canvas order of rendering is important
  backgroundLayers.forEach((layer) => layer.draw());

  drawPlayer();
  
  // update positions of images to canvas
  backgroundLayers.forEach((layer) => layer.update(Math.floor(score / 1000)));

  if (timestamp - lastObstacleTime > obstacleSpawnRate) {
    spawnObstacle();
    lastObstacleTime = timestamp;
  }
  updatePlayer(currentFrame);
  obstacleSpeed += Math.floor(score / 1000);
  drawObstacles(obstacleSpeed);
  applyGravity();
  checkCollision();
  displayScore();
  requestAnimationFrame(gameLoop);
  
  currentFrame++;
}

const pauseButton = document.getElementById("pause-game");

function handlePause() {

  if (!game_started) {
    return;
  }
  paused = !paused;
  if (paused) {
    menu_dialog.showModal();
  } else {
    menu_dialog.close();
    gameLoop();
    playMusic();
  }
}
let jumpVelocity = -10;
function handleJump() {
  if (!player.jumping) {
    player.jumping = true;
    player.Y_velocity = jumpVelocity;
    playJumpSound();
  }
}
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !player.jumping) {
    e.preventDefault();
    handleJump();
  }
  if (e.code === "Escape" | e.code === "KeyP") {
    e.preventDefault();
    handlePause();
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
canvas.addEventListener("pointerdown", () => {
  handleJump();
});
window.onload = function () {
  menu_dialog.showModal();
  backgroundLayers.forEach((layer) => layer.draw());
};

function handleResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  player.resize(canvas.height / 6);
  yFloorCords = canvas.height - player.dheight;
  jumpVelocity = -player.dheight / 9;
  obstacles.forEach((obstacle) => {
    obstacle.height = player.dheight/2;
    obstacle.y = yFloorCords - obstacle.height;
  });
  backgroundLayers.forEach((layer) => layer.resize(canvas.height));
}
window.onresize = function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  handleResize();
};

// startGame
let score = 300;

function startGame() {
  obstacles = [];
  lastObstacleTime = 0;
  score = 300;
  game_started = true;
  paused = false;
  menu_dialog.close();
  startMusic();
  gameLoop();
  pauseButton.blur();

}

function endGame() {
  score = 0;
  paused = true;
  stopMusic();
  menu_dialog.querySelector("#title").textContent = `You Lost`;
  game_started = false;
  menu_dialog.showModal();
}
function wonGame() {
  paused = true;
  stopMusic();
  game_started = false;
  menu_dialog.querySelector("#title").textContent = `You Won with a score of ${score} \u{1F3C6}`;
  menu_dialog.showModal();
}

function displayScore() {
  const scoreElement = document.getElementById("score");
  scoreElement.textContent = `Score: ${score}`;

  if (score >= 1000) {
    setTimeout(wonGame, 1);
  }
}
