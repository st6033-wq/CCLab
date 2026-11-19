let drawings = [];

let imageNames = [
  "ink-1",
  "ink-2",
  "ink-3",
  "ink-4",
  "fist",
  "hand-1",
  "hand-2",
  "hand-3",
  "hand-4"
];

let imageDurations = [
  450,
  350,
  350,
  500,
  400,
  230,
  230,
  300,
  450
];

let paper;
let imageFailed = false;

// ---------- Opening ----------

let scene = "waiting";
let openingStartedAt = 0;
let interactionStartedAt = 0;

// ---------- Tracking ----------

let handPose;
let video;

let hands = [];
let handHistory = [];

let cameraOn = false;
let cameraLoading = false;
let lastDetection = 0;

// ---------- Ink hands ----------

let playerHand;
let companionHand;

// ---------- Interface ----------

function setStatus(message) {
  document.getElementById("status").textContent = message;
}

// ---------- Loading ----------

function preload() {
  for (let i = 0; i < imageNames.length; i++) {
    let path = "assets/" + imageNames[i] + ".PNG";

    drawings.push(
      loadImage(
        path,
        undefined,
        function () {
          imageFailed = true;

          setStatus(
            "A drawing could not load. Check the assets folder."
          );
        }
      )
    );
  }
}

// ---------- Setup ----------

function setup() {
  let canvas = createCanvas(834, 583);
  canvas.parent("artwork");

  pixelDensity(1);

  paper = createGraphics(width, height);
  paper.pixelDensity(1);

  // The upper strip of the original drawing contains empty paper.
  paper.image(
    drawings[8],
    0,
    0,
    width,
    height,
    0,
    0,
    drawings[8].width,
    100
  );

  playerHand = new InkHand(false);
  companionHand = new InkHand(true);

  document.getElementById("begin").onclick = startOpening;
  document.getElementById("replay").onclick = startOpening;
  document.getElementById("camera").onclick = startCamera;
  document.getElementById("stop").onclick = stopCamera;

  if (!imageFailed) {
    document.getElementById("begin").disabled = false;
    document.getElementById("camera").disabled = false;

    setStatus("Begin when you are ready.");
  }
}

// ---------- Main drawing ----------

function draw() {
  background(238, 231, 216);

  if (imageFailed) {
    return;
  }

  if (scene === "waiting") {
    image(drawings[0], 0, 0, width, height);
  }

  if (scene === "opening") {
    drawOpening();
  }

  if (scene === "interaction") {
    drawInteraction();
  }

  drawCameraPreview();
}

// ---------- Opening animation ----------

function startOpening() {
  openingStartedAt = millis();
  scene = "opening";

  playerHand.reset();
  companionHand.reset();

  handHistory = [];

  document.getElementById("begin").hidden = true;
  document.getElementById("replay").disabled = false;

  setStatus("An ink hand is taking shape.");
}

function drawOpening() {
  let elapsed = millis() - openingStartedAt;

  let frameStart = 0;
  let frameIndex = drawings.length - 1;

  for (let i = 0; i < imageDurations.length; i++) {
    let frameEnd = frameStart + imageDurations[i];

    if (elapsed < frameEnd) {
      frameIndex = i;
      break;
    }

    frameStart = frameEnd;
  }

  image(
    drawings[frameIndex],
    0,
    0,
    width,
    height
  );

  // Dissolve from the large ink wash into the fist.
  let dissolveStart = 1650;
  let dissolveEnd = 2050;

  if (
    elapsed >= dissolveStart &&
    elapsed < dissolveEnd
  ) {
    image(drawings[3], 0, 0, width, height);

    let opacity = map(
      elapsed,
      dissolveStart,
      dissolveEnd,
      0,
      255
    );

    tint(255, opacity);

    image(drawings[4], 0, 0, width, height);

    noTint();
  }

  let totalDuration = 0;

  for (let i = 0; i < imageDurations.length; i++) {
    totalDuration += imageDurations[i];
  }

  if (elapsed >= totalDuration) {
    scene = "interaction";
    interactionStartedAt = millis();
  }
}

// ---------- Interaction ----------

function drawInteraction() {
  image(paper, 0, 0);

  let detected =
    cameraOn &&
    hands.length > 0 &&
    millis() - lastDetection < 600;

  if (!detected) {
    playerHand.reset();
    companionHand.reset();

    // Keep the original invitation image while waiting for a hand.
    image(drawings[8], 0, 0, width, height);

    if (cameraLoading) {
      setStatus("Loading the camera and hand model…");
    } else if (cameraOn) {
      setStatus(
        "Raise one hand with your palm and fingers visible."
      );
    } else {
      setStatus(
        "Enable the camera to reach toward the ink hand."
      );
    }

    return;
  }

  let currentPose = handHistory[handHistory.length - 1];

  if (!currentPose) {
    return;
  }

  playerHand.update(currentPose.points);

  // Find a pose from approximately 350 milliseconds ago.
  let delayedPose;
  let targetTime = millis() - 350;

  for (let i = 0; i < handHistory.length; i++) {
    if (handHistory[i].time <= targetTime) {
      delayedPose = handHistory[i];
    }
  }

  if (delayedPose) {
    companionHand.update(delayedPose.points);
  }

  // The companion is slightly offset so both hands remain visible.
  companionHand.display(-55, -30);
  playerHand.display(0, 0);

  setStatus(
    "Open your hand, bend a finger, or make a fist."
  );
}

// ---------- Ink hand ----------

class InkHand {
  constructor(isCompanion) {
    this.isCompanion = isCompanion;

    this.points = [];

    this.layer = createGraphics(width, height);
    this.layer.pixelDensity(1);

    this.color = isCompanion
      ? [29, 101, 91]
      : [62, 137, 139];
  }

  reset() {
    this.points = [];
  }

  update(targetPoints) {
    if (targetPoints.length !== 21) {
      return;
    }

    if (this.points.length !== 21) {
      this.points = [];

      for (let i = 0; i < targetPoints.length; i++) {
        this.points.push({
          x: targetPoints[i].x,
          y: targetPoints[i].y
        });
      }

      return;
    }

    // Light smoothing reduces tracking jitter.
    for (let i = 0; i < targetPoints.length; i++) {
      this.points[i].x = lerp(
        this.points[i].x,
        targetPoints[i].x,
        0.65
      );

      this.points[i].y = lerp(
        this.points[i].y,
        targetPoints[i].y,
        0.65
      );
    }
  }

  drawSilhouette() {
    let points = this.points;
    let layer = this.layer;

    layer.clear();

    let palmWidth = dist(
      points[5].x,
      points[5].y,
      points[17].x,
      points[17].y
    );

    // Prevent fingers from becoming extremely thin in side views.
    let palmLength = dist(
      points[0].x,
      points[0].y,
      points[9].x,
      points[9].y
    );

    let fingerWidth = max(
      palmWidth * 0.19,
      palmLength * 0.13
    );

    layer.noStroke();
    layer.fill(255);

    // Solid palm.
    let palm = [0, 1, 2, 5, 9, 13, 17];

    layer.beginShape();

    for (let i = 0; i < palm.length; i++) {
      let point = points[palm[i]];

      layer.vertex(point.x, point.y);
    }

    layer.endShape(CLOSE);

    let fingers = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
      [17, 18, 19, 20]
    ];

    layer.stroke(255);
    layer.strokeCap(ROUND);
    layer.strokeJoin(ROUND);

    // Rounded finger segments, all on one opaque mask.
    for (let f = 0; f < fingers.length; f++) {
      let ids = fingers[f];

      for (let j = 0; j < ids.length - 1; j++) {
        let start = points[ids[j]];
        let end = points[ids[j + 1]];

        let thickness = fingerWidth * (1 - j * 0.12);

        if (f === 0) {
          thickness *= 1.12;
        }

        if (f === 4) {
          thickness *= 0.78;
        }

        layer.strokeWeight(thickness);

        layer.line(
          start.x,
          start.y,
          end.x,
          end.y
        );
      }
    }
  }

  display(offsetX, offsetY) {
    if (this.points.length !== 21) {
      return;
    }

    this.drawSilhouette();

    let centerX = this.points[9].x;
    let centerY = this.points[9].y;

    let red = this.color[0];
    let green = this.color[1];
    let blue = this.color[2];

    push();

    translate(offsetX, offsetY);

    // Low-opacity, uneven halos around the silhouette.
    // Stable noise keeps the edge from flickering randomly.
    for (let i = 7; i >= 1; i--) {
      let spread = 1 + i * 0.008;

      let shiftX = map(
        noise(i * 1.7),
        0,
        1,
        -2,
        2
      );

      let shiftY = map(
        noise(i * 2.3 + 20),
        0,
        1,
        -2,
        2
      );

      push();

      translate(
        centerX + shiftX,
        centerY + shiftY
      );

      scale(spread);
      translate(-centerX, -centerY);

      tint(red, green, blue, 5);

      image(this.layer, 0, 0);

      pop();
    }

    // Main transparent wash.
    let opacity = this.isCompanion ? 72 : 42;

    tint(red, green, blue, opacity);
    image(this.layer, 0, 0);

    // Fine darker edge, created from the silhouette.
    // Draw dark shifted masks, then cover the interior with paper.
    // A very light inner wash remains visible.
    noTint();

    pop();
  }
}

// ---------- Camera ----------

async function startCamera() {
  if (cameraOn || cameraLoading) {
    return;
  }

  cameraLoading = true;

  document.getElementById("camera").disabled = true;

  setStatus("Loading the hand model…");

  try {
    if (typeof ml5 === "undefined") {
      throw new Error(
        "ml5 did not load. Check your internet connection."
      );
    }

    if (!handPose) {
      handPose = await ml5.handPose();
    }

    setStatus("Allow camera access in your browser.");

    // Obtain permission with explicit error handling.
    let stream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

    video = createVideo([]);

    video.hide();
    video.size(640, 480);

    video.elt.muted = true;
    video.elt.playsInline = true;
    video.elt.srcObject = stream;

    await video.elt.play();

    cameraOn = true;
    handHistory = [];
    hands = [];

    handPose.detectStart(video, gotHands);

    document.getElementById("camera").hidden = true;
    document.getElementById("stop").hidden = false;

    if (scene === "waiting") {
      startOpening();
    }

    setStatus("Camera ready. Raise one hand.");
  } catch (error) {
    stopCamera();

    setStatus(
      "Camera could not start. " +
      error.message +
      " Open the page with Live Server and check camera permission."
    );

    console.error(error);
  } finally {
    cameraLoading = false;

    document.getElementById("camera").disabled = false;
  }
}

// ---------- Detection callback ----------

function gotHands(results) {
  hands = results;
  lastDetection = millis();

  if (results.length === 0) {
    handHistory = [];
    return;
  }

  let points = results[0].keypoints;

  let savedPoints = [];

  for (let i = 0; i < points.length; i++) {
    savedPoints.push({
      x: width - points[i].x * width / video.width,
      y: points[i].y * height / video.height
    });
  }

  handHistory.push({
    time: millis(),
    points: savedPoints
  });

  while (
    handHistory.length > 1 &&
    handHistory[0].time < millis() - 2000
  ) {
    handHistory.shift();
  }
}

// ---------- Camera preview ----------

function drawCameraPreview() {
  let checkbox = document.getElementById("preview");

  if (
    !checkbox.checked ||
    !cameraOn ||
    !video
  ) {
    return;
  }

  push();

  translate(width, 0);
  scale(-1, 1);

  image(video, 0, 0, 192, 144);

  pop();
}

// ---------- Stop camera ----------

function stopCamera() {
  if (handPose && cameraOn) {
    handPose.detectStop();
  }

  cameraOn = false;

  hands = [];
  handHistory = [];

  if (playerHand) {
    playerHand.reset();
  }

  if (companionHand) {
    companionHand.reset();
  }

  if (video) {
    let stream = video.elt.srcObject;

    if (stream) {
      let tracks = stream.getTracks();

      for (let i = 0; i < tracks.length; i++) {
        tracks[i].stop();
      }
    }

    video.remove();
    video = undefined;
  }

  document.getElementById("camera").hidden = false;
  document.getElementById("camera").disabled = false;
  document.getElementById("stop").hidden = true;

  setStatus("Camera stopped.");
}