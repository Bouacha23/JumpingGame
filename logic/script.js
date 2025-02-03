const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');


const Ground = document.getElementById('road');
const ForeGround_Trees = document.getElementById('foreground-trees');
const Telegraph_poles = document.getElementById('telegraph-poles');
const Skybox = document.getElementById('sky');
const Distant_Trees_Backdrop = document.getElementById('distant-trees-bd');
const Distant_Trees_Backdrop_2 = document.getElementById('distant-trees-bd-2');
const Distant_Trees = document.getElementById('distant-trees');


let music = new Audio('./assets/music/sunshineskirmish.mp3');
music.loop = true;



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

let skybox = new BgLayer(Skybox, 0.5);
let trees = new BgLayer(ForeGround_Trees, 1);
let poles = new BgLayer(Telegraph_poles, 2);
let bgLayer = new BgLayer(Ground, 5);
let distantTrees = new BgLayer(Distant_Trees, 0.5);
let distantTreesBackdrop = new BgLayer(Distant_Trees_Backdrop, 0.5);
let distantTreesBackdrop2 = new BgLayer(Distant_Trees_Backdrop_2, 0.5);


function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw images to canvas order of rendering is important
    skybox.draw();
    distantTreesBackdrop.draw();
    distantTreesBackdrop2.draw();
    distantTrees.draw();
    trees.draw();
    poles.draw();
    bgLayer.draw();
    
    ctx.fillRect(20, 270, 10, 50, 'black');

    // update positions of images to canvas
    skybox.update();
    distantTreesBackdrop.update();
    distantTreesBackdrop2.update();
    distantTrees.update();
    trees.update();
    poles.update();
    bgLayer.update();
    requestAnimationFrame(animate);
}


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

function startGame(){
  startMusic();
  animate();
}