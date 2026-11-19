// What Stays — first prototype.
// Opening drawings are supplied by Sally.
// Hand tracking follows the ml5.handPose example supplied in class.
// Green points are development feedback for checking camera alignment.

let drawings = [];
let opening;
let handPose;
let video;
let hands = [];
let tracking = false;
let cameraLoading = false;
let assetsFailed = false;

function preload() {
  let names = [
    "ink-1", "ink-2", "ink-3", "ink-4", "fist",
    "hand-1", "hand-2", "hand-3", "hand-4"
  ];
  for (let i = 0; i < names.length; i++) {
    drawings.push(loadImage("assets/" + names[i] + ".PNG", undefined, function () {
      assetsFailed = true;
      document.getElementById("status").textContent =
        "A drawing could not load. Check the assets folder and open with Live Server.";
    }));
  }
}

function setup() {
  let canvas = createCanvas(834, 582.5);
  canvas.parent("artwork");
  opening = new Opening(drawings);
  if (assetsFailed) return;
  document.getElementById("status").textContent = "Begin when you are ready.";
  document.getElementById("begin").disabled = false;
  document.getElementById("camera").disabled = false;

  document.getElementById("begin").onclick = function () {
    opening.start();
    this.hidden = true;
    document.getElementById("replay").disabled = false;
  };
  document.getElementById("replay").onclick = function () {
    opening.start();
  };
  document.getElementById("camera").onclick = startCamera;
  document.getElementById("stop-camera").onclick = stopCamera;
}

function draw() {
  background(238, 231, 216);
  if (!opening || assetsFailed) return;
  opening.display();
  if (tracking && opening.finished) {
    drawTrackedHands();
  }
}

class Opening {
  constructor(images) {
    this.images = images;
    // Milliseconds per drawing. The final hand remains on screen.
    this.durations = [450, 350, 350, 500, 400, 230, 230, 300, 450];
    this.startedAt = 0;
    this.started = false;
    this.finished = false;
  }

  start() {
    this.startedAt = millis();
    this.started = true;
    this.finished = false;
    document.getElementById("status").textContent = "An ink hand is taking shape.";
  }

  display() {
    if (!this.started) {
      image(this.images[0], 0, 0, width, height);
      return;
    }
    let elapsed = millis() - this.startedAt;
    let boundary = 0;
    let index = this.images.length - 1;
    for (let i = 0; i < this.durations.length; i++) {
      boundary += this.durations[i];
      if (elapsed < boundary) {
        index = i;
        break;
      }
    }
    image(this.images[index], 0, 0, width, height);

    // Whole-frame dissolve from ink wash to fist, including the paper.
    let transitionStart = 1650;
    if (elapsed >= transitionStart && elapsed < transitionStart + 400) {
      image(this.images[3], 0, 0, width, height);
      let opacity = map(elapsed, transitionStart, transitionStart + 400, 0, 255);
      tint(255, opacity);
      image(this.images[4], 0, 0, width, height);
      noTint();
    }
    if (elapsed >= boundary && !this.finished) {
      this.finished = true;
      document.getElementById("status").textContent =
        tracking ? "Raise one hand. Green points show its position." :
          "The hand is waiting. Enable hand tracking to try the camera.";
    }
  }
}

async function startCamera() {
  if (tracking || cameraLoading) return;
  cameraLoading = true;
  let button = document.getElementById("camera");
  button.disabled = true;
  document.getElementById("status").textContent = "Loading hand tracking…";
  try {
    if (!handPose) handPose = await ml5.handPose();
    // Ask only after the viewer presses the camera button.
    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video = createVideo([]);
    video.size(640, 480);
    video.hide();
    video.elt.muted = true;
    video.elt.playsInline = true;
    video.elt.srcObject = stream;
    await video.elt.play();
    handPose.detectStart(video, gotHands);
    tracking = true;
    button.hidden = true;
    document.getElementById("stop-camera").hidden = false;
    document.getElementById("status").textContent =
      "Camera ready. After the opening, raise one hand.";
  } catch (error) {
    stopCamera();
    document.getElementById("status").textContent =
      "Camera could not start. Allow camera access and use localhost or HTTPS.";
    console.error(error);
  } finally {
    cameraLoading = false;
    button.disabled = false;
  }
}

function gotHands(results) {
  hands = results;
}

function drawTrackedHands() {
  for (let i = 0; i < hands.length; i++) {
    let points = hands[i].keypoints;
    for (let j = 0; j < points.length; j++) {
      // Mirror x so moving right feels like looking in a mirror.
      let x = width - points[j].x * width / 640;
      let y = points[j].y * height / 480;
      noStroke();
      fill(70, 190, 120, 190);
      circle(x, y, 6);
    }
  }
}

function stopCamera() {
  tracking = false;
  hands = [];
  if (handPose) handPose.detectStop();
  if (video) {
    let stream = video.elt.srcObject;
    if (stream) {
      let tracks = stream.getTracks();
      for (let i = 0; i < tracks.length; i++) tracks[i].stop();
    }
    video.remove();
    video = undefined;
  }
  document.getElementById("camera").hidden = false;
  document.getElementById("camera").disabled = false;
  document.getElementById("stop-camera").hidden = true;
  document.getElementById("status").textContent = "Camera stopped. The opening can still be replayed.";
}
