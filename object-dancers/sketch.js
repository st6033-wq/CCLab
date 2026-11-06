/*
  Check our the GOAL and the RULES of this exercise at the bottom of this file.
  
  After that, follow these steps before you start coding:

  1. rename the dancer class to reflect your name (line 35).
  2. adjust line 20 to reflect your dancer's name, too.
  3. run the code and see if a square (your dancer) appears on the canvas.
  4. start coding your dancer inside the class that has been prepared for you.
  5. have fun.
*/

let dancer;

function setup() {
  createCanvas(windowWidth, windowHeight);

  dancer = new SallyDancer(width / 2, height / 2);
}

function draw() {
  background(0);

  dancer.update();
  dancer.display();
}

class SallyDancer {
  constructor(startX, startY) {
    this.x = startX;
    this.y = startY;

    this.time = 0;
    this.energy = 0;
    this.bounce = 0;
    this.tilt = 0;
    this.stretch = 1;
    this.speed = random(0.04, 0.06);
  }
  update() {
    let distance = dist(mouseX, mouseY, this.x, this.y);
    let targetEnergy = distance < 130 ? 1 : 0;

    this.energy = lerp(this.energy, targetEnergy, 0.05);
    this.time += this.speed + this.energy * 0.07;

    this.bounce = sin(this.time * 2) * 8;
    this.tilt = sin(this.time) * 0.18;
    this.stretch = 1 + sin(this.time * 2) * 0.06;
  }
  display() {
    push();
    translate(this.x, this.y + this.bounce);
    rotate(this.tilt);
    scale(1 / this.stretch, this.stretch);


    // tentacles
    noStroke();

    for (let i = -2; i <= 2; i++) {
      let x = i * 19;

      // spots
      for (let j = 0; j < 9; j++) {
        // swing motion
        let swing =
          sin(this.time * 2 + j * 0.4 + i) *
          j *
          (1.3 + this.energy * 0.5);

        let dotX = x + swing;
        let dotY = j * 7;

        // halo
        fill(50, 220, 200, 35);
        circle(dotX, dotY, 13);

        fill(85, 225, 200);
        circle(dotX, dotY, 6);
      }
    }

    // tentacle tip
    noStroke();
    fill(160, 255, 225);
    circle(x + swing, tipY, 7);
    noFill();
  }

  // halo
  noStroke();

  for(let glow = 3; glow >= 1; glow--) {
  fill(45, 190, 220, 12);

  arc(
    0, 0,
    116 + glow * 7,
    100 + glow * 7,
    PI, TWO_PI, CHORD
  );
}

// body
fill(45, 155, 200);
arc(0, 0, 116, 100, PI, TWO_PI, CHORD);

// transparent jelly part
fill(90, 225, 220, 110);
arc(0, -3, 94, 77, PI, TWO_PI, CHORD);

// highlight
fill(200, 255, 255, 150);
ellipse(-27, -30, 17, 8);
circle(-13, -38, 5);

// wavy bottom
fill(85, 225, 205);

for (let i = -2; i <= 2; i++) {
  ellipse(i * 21, -1, 25, 12);
}

// eyes
stroke(12, 45, 65);
strokeWeight(3);
noFill();

if (this.energy > 0.5) {
  arc(-20, -21, 13, 11, PI, TWO_PI);
  arc(20, -21, 13, 11, PI, TWO_PI);
} else {
  noStroke();
  fill(12, 45, 65);
  ellipse(-20, -21, 8, 12);
  ellipse(20, -21, 8, 12);

  fill(255);
  circle(-21, -24, 3);
  circle(19, -24, 3);
}

// blush
noStroke();
fill(150, 245, 225, 150);
ellipse(-32, -12, 13, 6);
ellipse(32, -12, 13, 6);

// mouth
fill(12, 45, 65);
ellipse(0, -12, 10, 5 + this.energy * 8);

pop();
  }
}

/*
GOAL:
The goal is for you to write a class that produces a dancing being/creature/object/thing. In the next class, your dancer along with your peers' dancers will all dance in the same sketch that your instructor will put together. 

RULES:
For this to work you need to follow one rule: 
  - Only put relevant code into your dancer class; your dancer cannot depend on code outside of itself (like global variables or functions defined outside)
  - Your dancer must perform by means of the two essential methods: update and display. Don't add more methods that require to be called from outside (e.g. in the draw loop).
  - Your dancer will always be initialized receiving two arguments: 
    - startX (currently the horizontal center of the canvas)
    - startY (currently the vertical center of the canvas)
  beside these, please don't add more parameters into the constructor function 
  - lastly, to make sure our dancers will harmonize once on the same canvas, please don't make your dancer bigger than 200x200 pixels. 
*/