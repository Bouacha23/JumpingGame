const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// dialog handlers 
const menu_dialog = document.getElementById("menu-dialog");
const branko = document.getElementById("branko");

let currentTab = {
  contentId: "main-menu",
  buttonId: "main-menu-btn"
};
function openTab(elem, target) {
  elem.parentElement.classList.add("active")
  document.getElementById(currentTab.buttonId).parentElement.classList.remove("active")
  document.getElementById(currentTab.contentId).classList.add("invisible")
  document.getElementById(target).classList.remove("invisible")
  currentTab.contentId = target;
  currentTab.buttonId = elem.id;
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


// const player = {
//   x: 10,
//   Y: 260,
//   width: 50,
//   height: 80,
//   Y_velocity: 0,
//   grav: 0.5,
//   jumping: false,
// };

function applyGravity() {
  if (player.jumping) {
    player.Y_velocity += player.grav;
    player.dy += player.Y_velocity;
    checkLanding();
  }
}

function checkLanding() {
  if (player.dy >= 280) {
    player.dy = 280;
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
    y: 305, 
    width: Math.floor(Math.random() * (50 - 30) + 30 ),
    height:30 ,
    img: document.getElementById("obstacle"), 
  };
  obstacles.push(obstacle);
}

function drawObstacles(x) {
  obstacles.forEach((obstacle) => {
    ctx.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    obstacle.x -= x; 

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
      player.dx < obstacle.x + obstacle.width &&
      player.dx + player.dwidth > obstacle.x &&
      player.dy < obstacle.y + obstacle.height &&
      player.dy + player.dheight > obstacle.y
    ) {
      endGame();
    }
  });
}

function drawPlayer() {
  let characterFrame = player.frames[currentCharacterFrame % 6];
  ctx.drawImage(branko, characterFrame.sx, characterFrame.sy, characterFrame.width, characterFrame.height, player.dx, player.dy, player.dwidth, player.dheight);
}
function updatePlayer() {

}

// gameLoop
let game_started = false;
let paused = false;
const player = {
  img: branko,
  frames: [
    { sx: 20, sy: 0, width: 20, height: 32 },
    { sx: 85, sy: 0, width: 20, height: 32 },
    { sx: 401, sy: 0, width: 20, height: 32 },
    // { sx: 148, sy: 0, width: 20, height: 32 },
    { sx: 213, sy: 0, width: 20, height: 32 },
    { sx: 276, sy: 0, width: 20, height: 32 },
    { sx: 466, sy: 0, width: 20, height: 32 },
    // { sx: 337, sy: 0, width: 20, height: 32 },
  ],
  dx: 10,
  dy: 260,
  dwidth: 50,
  dheight: 80,
  Y_velocity: 0,
  grav: 0.5,
  jumping: false,
}
let currentFrame = 0;
let currentCharacterFrame = 0;
function gameLoop(timestamp) {
  if (paused) {
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw images to canvas order of rendering is important
  backgroundLayers.forEach((layer) => layer.draw());
  // let characterFrame = branko_initial.frames[currentCharacte  characterFrame.width, characterFrame.height, 0, 0, 50, 70);
  // ctx.drawImage(branko, branko_initial.sx, branko_initial.sy, branko_initial.width, branko_initial.height, 0, 0, 70, 70);

  if (currentFrame % 8 == 0) {
    currentCharacterFrame = currentCharacterFrame + 1;
    // characterFrame = branko_initial.frames[currentCharacterFrame];
  }
  currentFrame++;
  // branko_initial.sx += 32 + 20;
  // update positions of images to canvas
  backgroundLayers.forEach((layer) => layer.update());

  
  if (timestamp - lastObstacleTime > obstacleSpawnRate) {
    spawnObstacle();
    lastObstacleTime = timestamp;
  }

  drawObstacles(6);
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
function handleEscape(e) {
  e.preventDefault();
  if (!game_started){
    return;
  }
  paused = !paused;
  if (paused){
    menu_dialog.showModal();
  } else {
    menu_dialog.close();
    gameLoop();
    playMusic();
  }
}
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
  menu_dialog.showModal();
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
  menu_dialog.close()
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
