const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// dialog handlers
const start_dialog = document.getElementById('start-menu-dialog');
const controls_dialog = document.getElementById('control-menu-dialog');
const settings_dialog = document.getElementById('settings-menu-dialog');
const credits_dialog = document.getElementById('credits-menu-dialog');
let modal_history = [start_dialog];

function showControls(){
  modal_history[modal_history.length - 1].close();
  modal_history.push(controls_dialog);
  controls_dialog.showModal();
}
function showSettings(){
  modal_history[modal_history.length - 1].close();
  modal_history.push(settings_dialog);
  settings_dialog.showModal();
}
function showCredits() {
  modal_history[modal_history.length - 1].close();
  modal_history.push(credits_dialog);
  credits_dialog.showModal();
}
function toggleFullscreen(){
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
}
// background handlers
class BgLayer{
  constructor(img, speed=1) {
    this.img = img;
    this.speed = speed;
    this.x1 = 0;
    this.x2 = canvas.width;
  }

  draw() {
    ctx.drawImage(this.img, this.x1, 0, canvas.width, canvas.height);
    ctx.drawImage(this.img, this.x2, 0, canvas.width, canvas.height);
  }
  update() {
    if (this.x1 < -canvas.width + this.speed){
        this.x1 = canvas.width - this.speed + this.x2;
    }
    if (this.x2 < -canvas.width + this.speed){
        this.x2 = canvas.width - this.speed + this.x1;
    }
    this.x1 -= this.speed;
    this.x2 -= this.speed;
  }
}
const backgroundImages = Array.from(
    document.querySelectorAll("[data-layer-level]")
  ).sort((a, b) => (
    a.attributes['data-layer-level'].value - b.attributes['data-layer-level'].value
  )
);
const backgroundLayers = backgroundImages.map(image => {
  return new BgLayer(image, image.attributes['data-layer-level'].value * 1)
})

// music handlers
const music = new Audio('./assets/music/sunshineskirmish.mp3');
music.loop = true;
music.volume = 0.5;

function startMusic(){
  music.play();
}
function toggleSound() {
  if (music.paused) {
    music.play();
  } else {
    music.pause();
  }
}
function stopMusic(){
  music.pause();
}
function playMusic(){
  music.play();
}
function changeVolume(value){
  if(music.volume + value < 1 && music.volume + value > 0){
    music.volume = value;
  }
}

// gameLoop
let game_started = false;
let paused = false;
function gameLoop(){
    if (paused){
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw images to canvas order of rendering is important
    backgroundLayers.forEach(layer => layer.draw());
    ctx.fillRect(20, 270, 10, 50, 'black');

    // update positions of images to canvas
    backgroundLayers.forEach(layer => layer.update());
    requestAnimationFrame(gameLoop);
}


// event handlers
function handleEscape(e) {
  e.preventDefault();
  if (modal_history.length > 1){
    const modal = modal_history.pop();
    const previousModal = modal_history[modal_history.length - 1];
    modal.close();
    previousModal.showModal();
    return;
  }
  if (!game_started){
    return;
  }
  paused = !paused;
  if (paused){
    settings_dialog.showModal();
  } else {
    settings_dialog.close();
    gameLoop();
    playMusic();
  }
}
window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape'){
    handleEscape(e);
  }
  if (e.code === 'KeyM'){
    toggleSound();
  }
  if (e.code === 'KeyV'){
    changeVolume(music.volume + 0.1);
  }
  if (e.code === 'KeyB'){
    changeVolume(music.volume - 0.1);
  }
});


function startGame(){
  game_started = true;
  startMusic();
  gameLoop();
}