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
    this.bounce = 0;
    this.swing = 0;
  }
  update() {
    this.time += 0.05;
    this.bounce = sin(this.time) * 10;
    this.swing = sin(this.time) * 12;
  }
  display() {
    push();
    translate(this.x, this.y + this.bounce);

    // tentacles
    noFill();
    stroke(80, 220, 190);
    strokeWeight(8);

    for (let i = -2; i <= 2; i++) {
      let x = i * 20;

      bezier(
        x, 0,
        x + this.swing, 25,
        x - this.swing, 45,
        x + this.swing, 65
      );
    }

    // body
    noStroke();
    fill(65, 180, 210);
    arc(0, 0, 130, 110, PI, TWO_PI, CHORD);

    // eyes
    fill(15, 45, 65);
    ellipse(-22, -20, 9, 13);
    ellipse(22, -20, 9, 13);

    // smile
    noFill();
    stroke(15, 45, 65);
    strokeWeight(3);
    arc(0, -15, 16, 12, 0, PI);

    pop();
  }
}」

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