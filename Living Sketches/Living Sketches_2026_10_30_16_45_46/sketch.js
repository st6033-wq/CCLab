let ghosts = [];
let lotuses = [];

let ghostOrder = [0, 1, 2, 1];
let ready = false;

async function setup() {
  createCanvas(800, 559);

  let ghostPromises = [];
  let lotusPromises = [];

  for (let i = 0; i < 3; i++) {
    ghostPromises.push(
      loadImage("assets/ghost" + i + ".PNG")
    );

    lotusPromises.push(
      loadImage("assets/lotus" + i + ".JPG")
    );
  }

  ghosts = await Promise.all(ghostPromises);
  lotuses = await Promise.all(lotusPromises);

  ready = true;
}

function draw() {
  background(205, 230, 150);

  if (ready) {
    // Open the lotus as the mouse approaches.
    let distanceToFlower = dist(
      mouseX, mouseY, 400, 290
    );

    let lotusFrame = 0;

    if (distanceToFlower < 150) {
      lotusFrame = 2;
    } else if (distanceToFlower < 260) {
      lotusFrame = 1;
    }

    imageMode(CORNER);
    image(lotuses[lotusFrame], 0, 0, width, height);

    // Animate the ghost from side to side.
    let animationIndex =
      floor(frameCount / 12) % ghostOrder.length;

    let ghostFrame = ghostOrder[animationIndex];
    let ghostImage = ghosts[ghostFrame];

    // Keep the image's original proportions.
    let ghostHeight = 160;
    let ghostWidth =
      ghostImage.width / ghostImage.height * ghostHeight;

    imageMode(CENTER);
    image(
      ghostImage,
      mouseX, mouseY,
      ghostWidth, ghostHeight
    );
  }
}