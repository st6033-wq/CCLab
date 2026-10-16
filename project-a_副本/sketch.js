/*
Template for IMA's Creative Coding Lab 

Project A: Generative Creatures
CCLaboratories Biodiversity Atlas 
*/

// food
let foodX = [];
let foodY = [];
let foodProgress = [];
let foodAge = [];
let foodAlive = [];
let foodType = [];

let foodCount = 8;
let foodMaxCycles = 15;
let foodCycleFrames = 120;

// rock
let rockX = [235, 590];
let rockY = [155, 360];
let rockRadius = [36, 42];

let bodyPadding = 42;
let rockPulse = [0, 0];
let rockTouched = [false, false];
let bumpFrames = 0;

// home
let homeX = 400;
let homeY = 250;
let homeRadius = 0;
let homeWarm = 0;
let homeRipple = 0;
let homeReady = true;

let goingHome = false;
let resting = false;
let awayFrames = 0;
let restLeft = 0;

// creature
let creatureX = 200;
let creatureY = 250;

let excited = 0;
let energetic = 0;

let motionTime = 0;
let turn = 0;
let breath = 0;
let rayCount = 30;

let coreRadius;
let tentacleLength;
let dotSize;
let wiggleAmount;
let breathing;

// grass
let wind = 0;
let grassTrans = 140;

function setup() {
    createCanvas(800, 500);
    angleMode(DEGREES);

    for (let i = 0; i < foodCount; i = i + 1) {
        if (i < 4) {
            foodType[i] = 1;
        } else {
            foodType[i] = 2;
        }

        resetFood(i);
    }
}

function draw() {
    motionTime = motionTime + 0.003;
    breath = breath + 1;
    wind = wind + 2;

    excited = max(0, excited - 1);
    energetic = max(0, energetic - 1);
    homeRipple = max(0, homeRipple - 1);
    bumpFrames = max(0, bumpFrames - 1);

    //rock
    for (let k = 0; k < rockX.length; k = k + 1) {
        rockPulse[k] = max(0, rockPulse[k] - 1);

        if (
            dist(creatureX, creatureY, rockX[k], rockY[k]) >
            rockRadius[k] + bodyPadding + 6
        ) {
            rockTouched[k] = false;
        }
    }

    turn = turn + 0.2 + energetic / 180 * 1.2;

    updateCreature();

    let nearHome = constrain(
        map(
            dist(creatureX, creatureY, homeX, homeY),
            0, 250, 1, 0
        ),
        0, 1
    );

    coreRadius = map(nearHome, 0, 1, 10, 35);
    tentacleLength = map(nearHome, 0, 1, 85, 15);
    dotSize = map(nearHome, 0, 1, 12, 24);
    wiggleAmount = map(nearHome, 0, 1, 18, 4);
    breathing = map(sin(breath), -1, 1, 0.94, 1.06);

    // yellow flower
    if (energetic > 0) {
        tentacleLength =
            tentacleLength * (1 + energetic / 180 * 0.3);

        breathing = 1 + sin(breath * 4) * 0.08;
    }

    if (resting) {
        homeWarm = lerp(homeWarm, 1, 0.03);
    } else {
        homeWarm = lerp(homeWarm, 0, 0.03);
    }

    updateFoods();

    background(0);
    drawGrass();
    drawRocks();
    drawHome();

    for (let i = 0; i < foodCount; i = i + 1) {
        drawFood(i);
    }

    drawCreature(creatureX, creatureY);
}

// random food (away from rocks)
function resetFood(i) {
    let freePosition = false;

    for (
        let attempt = 0;
        attempt < 80;
        attempt = attempt + 1
    ) {
        foodX[i] = random(70, width - 70);
        foodY[i] = random(70, height - 70);
        freePosition = true;

        for (let k = 0; k < rockX.length; k = k + 1) {
            if (
                dist(foodX[i], foodY[i], rockX[k], rockY[k]) <
                rockRadius[k] + 52
            ) {
                freePosition = false;
            }
        }

        if (freePosition) {
            break;
        }
    }

    if (freePosition === false) {
        foodX[i] = 80;
        foodY[i] = 420;
    }

    foodProgress[i] = 0;
    foodAge[i] = 0;
    foodAlive[i] = true;
}

function updateFoods() {
    for (let i = 0; i < foodCount; i = i + 1) {
        let flowerSize = 25;

        if (foodType[i] === 2) {
            flowerSize = 14;
        }

        if (
            foodAlive[i] &&
            foodProgress[i] > 0 &&
            dist(creatureX, creatureY, foodX[i], foodY[i]) <
            coreRadius * breathing + flowerSize * 0.35
        ) {
            foodAlive[i] = false;
            resting = false;

            if (foodType[i] === 1) {
                // when eat pink flower
                excited = 70;
                energetic = 0;
                goingHome = true;

            } else {
                // when eat yellow flower
                energetic = 180;
                excited = 0;
                goingHome = false;
                awayFrames = 0;
            }
        }

        if (foodAlive[i] === false) {
            foodProgress[i] = foodProgress[i] - 20;

        } else if (
            foodAge[i] >= foodMaxCycles * foodCycleFrames
        ) {
            foodProgress[i] = foodProgress[i] - 5;

        } else {
            foodProgress[i] = min(360, foodProgress[i] + 5);
        }

        if (foodProgress[i] >= 360) {
            foodAge[i] = foodAge[i] + 1;
        }

        if (foodProgress[i] <= 0) {
            resetFood(i);
        }
    }
}

function drawFood(i) {
    push();
    translate(foodX[i], foodY[i]);

    scale(
        1 + sin(foodAge[i] * 360 / foodCycleFrames) * 0.08
    );

    let petalSize = 25;
    stroke(240, 160, 185, 160);

    if (foodType[i] === 2) {
        petalSize = 14;
        stroke(255, 225, 100, 210);
    }

    strokeWeight(0.7);

    for (
        let a = 0;
        a < foodProgress[i];
        a = a + 5
    ) {
        let petalRadius = map(
            sin(a * 4), -1, 1, 3, petalSize
        );

        line(
            0, 0,
            cos(a) * petalRadius,
            sin(a) * petalRadius
        );
    }

    pop();
}

function updateCreature() {
    if (dist(creatureX, creatureY, homeX, homeY) > 95) {
        homeReady = true;
    }

    if (mouseIsPressed) {
        resting = false;
        restLeft = 0;
    }

    if (resting) {
        restLeft = restLeft - 1;

        if (restLeft <= 0) {
            resting = false;
            goingHome = false;
            awayFrames = 0;
        }

    } else {
        awayFrames = awayFrames + 1;

        if (awayFrames >= 900) {
            goingHome = true;
        }
    }

    let targetX = map(
        noise(motionTime), 0, 1, 90, width - 90
    );

    let targetY = map(
        noise(motionTime + 200), 0, 1, 90, height - 90
    );

    let followEase = 0.03;

    if (energetic > 0) {
        followEase = 0.05;
    }

    if (goingHome || resting) {
        targetX = homeX;
        targetY = homeY;

        // if being blocked, get to the side of obstacles
        let heading = atan2(
            homeY - creatureY,
            homeX - creatureX
        );

        let homeDistance = dist(
            creatureX, creatureY, homeX, homeY
        );

        for (let k = 0; k < rockX.length; k = k + 1) {
            let dx = rockX[k] - creatureX;
            let dy = rockY[k] - creatureY;

            let along =
                dx * cos(heading) + dy * sin(heading);

            let sideways =
                -dx * sin(heading) + dy * cos(heading);

            if (
                along > 0 &&
                along < homeDistance &&
                abs(sideways) < rockRadius[k] + bodyPadding + 8
            ) {
                let side = -1;

                if (sideways < 0) {
                    side = 1;
                }

                targetX =
                    rockX[k] -
                    sin(heading) * (rockRadius[k] + 75) * side;

                targetY =
                    rockY[k] +
                    cos(heading) * (rockRadius[k] + 75) * side;

                break;
            }
        }
    }

    // follow the mouse
    if (mouseIsPressed) {
        targetX = constrain(
            mouseX, bodyPadding, width - bodyPadding
        );

        targetY = constrain(
            mouseY, bodyPadding, height - bodyPadding
        );

        followEase = 0.12;
    }

    moveCreature(targetX, targetY, followEase);

    if (
        mouseIsPressed === false &&
        resting === false &&
        (homeReady || goingHome) &&
        dist(creatureX, creatureY, homeX, homeY) < 38
    ) {
        resting = true;
        goingHome = false;
        restLeft = 240;
        awayFrames = 0;

        if (homeReady) {
            homeRipple = 120;
        }

        homeReady = false;
    }
}

function moveCreature(targetX, targetY, followEase) {
    let moveX = (targetX - creatureX) * followEase;
    let moveY = (targetY - creatureY) * followEase;

    let smallSteps = max(
        1, ceil(dist(0, 0, moveX, moveY) / 8)
    );

    for (let n = 0; n < smallSteps; n = n + 1) {
        creatureX = creatureX + moveX / smallSteps;
        creatureY = creatureY + moveY / smallSteps;

        for (let k = 0; k < rockX.length; k = k + 1) {
            let safeRadius = rockRadius[k] + bodyPadding;

            if (
                dist(creatureX, creatureY, rockX[k], rockY[k]) <
                safeRadius
            ) {
                touchRock(k);

                let heading = atan2(
                    creatureY - rockY[k],
                    creatureX - rockX[k]
                );

                creatureX = rockX[k] + cos(heading) * safeRadius;
                creatureY = rockY[k] + sin(heading) * safeRadius;
            }
        }

        creatureX = constrain(
            creatureX, bodyPadding, width - bodyPadding
        );

        creatureY = constrain(
            creatureY, bodyPadding, height - bodyPadding
        );
    }
}

function touchRock(k) {
    if (rockTouched[k] === false) {
        bumpFrames = 40;
        rockPulse[k] = 60;
        rockTouched[k] = true;
    }
}

function drawCreature(x, y) {
    push();
    translate(x, y);
    rotate(turn);
    scale(breathing);

    // when touching rock obstacles
    if (bumpFrames > 0) {
        scale(1 - bumpFrames / 40 * 0.12);
        translate(random(-1, 1), random(-1, 1));
    }

    if (excited > 0) {
        translate(random(-2, 2), random(-2, 2));
    }

    for (
        let a = 0;
        a < 360;
        a = a + 360 / rayCount
    ) {
        drawTentacle(a);
    }

    drawBody();
    pop();
}

function creatureColor(outward) {
    let whiteMix =
        (sin(breath * 0.5 - 90) + 1) / 2;

    whiteMix = lerp(whiteMix, 1, homeWarm);

    let r = map(
        outward, 0, 1,
        lerp(220, 255, whiteMix),
        lerp(0, 255, whiteMix)
    );

    let g = map(
        outward, 0, 1,
        255, lerp(170, 255, whiteMix)
    );

    let b = map(
        outward, 0, 1,
        255, lerp(195, 255, whiteMix)
    );

    if (excited > 0) {
        r = map(outward, 0, 1, 130, 20);
        g = map(outward, 0, 1, 200, 80);
        b = 255;
    }

    if (energetic > 0) {
        r = 255;
        g = map(outward, 0, 1, 240, 205);
        b = map(outward, 0, 1, 190, 85);
    }

    fill(r, g, b);
}

function drawTentacle(rayAngle) {
    push();
    rotate(rayAngle);
    noStroke();

    for (let layer = 12; layer >= 0; layer = layer - 1) {
        let outward = layer / 12;

        let radius =
            coreRadius +
            outward * tentacleLength * (1 - homeWarm * 0.35);

        let wiggle = map(
            noise(rayAngle * 0.05, motionTime * 2 + 200),
            0, 1, -1, 1
        );

        radius =
            radius +
            wiggle * wiggleAmount * outward *
            (1 - homeWarm * 0.6);

        let bend =
            sin(breath + rayAngle * 2 + outward * 60) *
            8 * outward;

        creatureColor(outward);

        circle(
            cos(bend) * radius,
            sin(bend) * radius,
            map(outward, 0, 1, dotSize, 2)
        );
    }

    pop();
}

function drawBody() {
    noStroke();
    creatureColor(0);

    beginShape();

    for (let a = 0; a < 360; a = a + 5) {
        vertex(
            cos(a) * coreRadius,
            sin(a) * coreRadius
        );
    }

    endShape(CLOSE);
}

function drawHome() {
    homeRadius = min(homeRadius + 0.03, 35);

    push();
    translate(homeX, homeY);

    noStroke();
    fill(120, 225, 225, 8 + homeWarm * 25);
    circle(0, 0, 105 + sin(breath) * 5);

    noFill();
    stroke(
        130 + homeWarm * 125,
        200 + homeWarm * 55,
        210 + homeWarm * 45,
        110 + homeWarm * 100
    );

    strokeWeight(0.5 + homeWarm * 0.5);

    for (let a = 0; a < 1080; a = a + 12) {
        let radius = map(a, 0, 1080, 0, homeRadius);

        circle(
            cos(a + turn) * radius,
            sin(a + turn) * radius,
            20
        );
    }

    if (homeRipple > 0) {
        stroke(200, 255, 245, homeRipple);
        circle(0, 0, 90 + (120 - homeRipple) * 0.8);
    }

    pop();
}

// rotating rocks
function drawRocks() {
    for (let k = 0; k < rockX.length; k = k + 1) {
        push();
        translate(rockX[k], rockY[k]);

        // different rotating directions
        if (k === 0) {
            rotate(breath * 0.35);
        } else {
            rotate(-breath * 0.45);
        }

        stroke(
            95 + rockPulse[k] * 1.8,
            185 + rockPulse[k],
            195 + rockPulse[k] * 0.8,
            220
        );

        strokeWeight(1.5);
        fill(20, 65, 75);

        // ten spikes
        beginShape();

        for (let point = 0; point < 20; point = point + 1) {
            let thornRadius = rockRadius[k];

            if (point % 2 === 1) {
                thornRadius = rockRadius[k] * 0.55;
            }

            let thornAngle = point * 18;

            vertex(
                cos(thornAngle) * thornRadius,
                sin(thornAngle) * thornRadius
            );
        }

        endShape(CLOSE);

        // core
        fill(35, 95, 105);
        stroke(120, 210, 210, 180);
        circle(0, 0, rockRadius[k] * 0.75);

        for (let a = 0; a < 360; a = a + 36) {
            line(
                cos(a) * rockRadius[k] * 0.38,
                sin(a) * rockRadius[k] * 0.38,
                cos(a) * rockRadius[k] * 0.8,
                sin(a) * rockRadius[k] * 0.8
            );
        }

        // ripples
        if (rockPulse[k] > 0) {
            noFill();
            stroke(170, 240, 235, rockPulse[k] * 3);
            strokeWeight(1);

            circle(
                0, 0,
                rockRadius[k] * 2 + (60 - rockPulse[k]) * 0.8
            );
        }

        pop();
    }
}

function drawGrass() {
    push();
    strokeWeight(0.8);

    for (let gx = 0; gx < width; gx = gx + 12) {
        for (let gy = 15; gy <= height; gy = gy + 15) {
            let grassLength = map(
                noise(gx * 0.03, gy * 0.03),
                0, 1, 12, 25
            );

            let grassGreen = map(
                noise(gx * 0.02, gy * 0.02),
                0, 1, 100, 210
            );

            let sway =
                sin(wind + gx * 0.6 + gy * 0.4) * 5;

            stroke(50, grassGreen, 140, grassTrans);

            line(
                gx, gy,
                gx + sway, gy - grassLength
            );
        }
    }

    pop();
}