const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const Ground = document.getElementById('ground');

const Trees = document.getElementById('trees');
const ForeGround = document.getElementById('foreground');
const SKY = document.getElementById('sky');




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

let skybox = new BgLayer(SKY, 0.5);
let trees = new BgLayer(ForeGround, 1);
let poles = new BgLayer(Trees, 2);
let bgLayer = new BgLayer(Ground, 5);

function startGame(){
  animate();
}

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw images to canvas order of rendering is important
    skybox.draw();
    trees.draw();
    poles.draw();
    bgLayer.draw();
    
    ctx.fillRect(20, 270, 10, 50, 'black');

    // update positions of images to canvas
    skybox.update();
    trees.update();
    poles.update();
    bgLayer.update();
    requestAnimationFrame(animate);
}