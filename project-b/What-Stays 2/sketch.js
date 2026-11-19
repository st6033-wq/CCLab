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
let companion;
let inkHand;
let paper;
let playerPoints = [];
let lastDetection = 0;
let demo = false;
let showVideo = false;

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
  paper = createGraphics(width, height);
  // Stretch only the empty top strip of the supplied paper, keeping the drawing separate.
  paper.image(drawings[8], 0, 0, width, height, 0, 0, 1668, 110);
  inkHand = createInkLayer(drawings[8]);
  companion = new Companion();
  document.getElementById("demo").onclick = function () {
    demo = !demo;
    playerPoints = [];
    this.textContent = demo ? "Exit mouse trial" : "Try with mouse";
    if (demo) { opening.started = true; opening.finished = true; }
  };
  document.getElementById("preview").onchange = function () { showVideo = this.checked; };
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
  if (opening.finished) {
    image(paper, 0, 0);
    updatePlayer();
    companion.update();
    companion.display();
    if (playerPoints.length) drawInkHand(playerPoints);
    updateStatus();
  } else {
    opening.display();
    // Preview and status remain available while the opening plays.
    updateStatus();
  }
  if (showVideo && video && tracking) {
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, 200, 150);
    pop();
  }
}

function createInkLayer(source) {
  let layer = createImage(width, height);
  layer.copy(source, 0, 0, source.width, source.height, 0, 0, width, height);
  layer.loadPixels();
  // Keep dark drawn strokes and suppress the light paper.
  for (let i = 0; i < layer.pixels.length; i += 4) {
    let light = (layer.pixels[i] + layer.pixels[i + 1] + layer.pixels[i + 2]) / 3;
    layer.pixels[i] = 34;
    layer.pixels[i + 1] = 37;
    layer.pixels[i + 2] = 31;
    layer.pixels[i + 3] = constrain((155 - light) * 4, 0, 255);
  }
  layer.updatePixels();
  return layer;
}

function updatePlayer() {
  let target = [];
  if (demo && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    // An open-hand pose for testing without a camera.
    let pose = [[0,90],[-38,65],[-63,33],[-83,8],[-103,-9],
      [-36,5],[-43,-40],[-46,-73],[-48,-100],
      [0,0],[0,-51],[0,-89],[0,-120],
      [33,8],[38,-37],[40,-70],[42,-93],
      [60,25],[74,-8],[81,-35],[86,-57]];
    for (let i = 0; i < pose.length; i++) target.push({x:mouseX+pose[i][0],y:mouseY+pose[i][1]});
  } else if (tracking && hands.length && millis() - lastDetection < 650) {
    let raw = hands[0].keypoints;
    let vw = video.elt.videoWidth || 640;
    let vh = video.elt.videoHeight || 480;
    for (let i = 0; i < raw.length; i++) target.push({
      x:width - raw[i].x * width / vw,
      y:raw[i].y * height / vh
    });
  }
  if (!target.length) { playerPoints = []; return; }
  if (playerPoints.length !== target.length) {
    playerPoints = target;
  } else {
    for (let i = 0; i < target.length; i++) {
      playerPoints[i].x += (target[i].x - playerPoints[i].x) * 0.45;
      playerPoints[i].y += (target[i].y - playerPoints[i].y) * 0.45;
    }
  }
}

function inkPath(points, weight, opacity) {
  noFill();
  stroke(31, 40, 34, opacity);
  strokeWeight(weight);
  beginShape();
  for (let i = 0; i < points.length; i++) curveVertex(points[i].x, points[i].y);
  endShape();
}

function drawInkHand(points) {
  // Landmark centers are expanded into a continuous outer contour.
  let fingers = [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16],[17,18,19,20]];
  let outline = [{x:points[0].x-13,y:points[0].y}];
  for (let f = 0; f < fingers.length; f++) {
    let ids = fingers[f];
    for (let j = 0; j < ids.length; j++) {
      let point = points[ids[j]];
      let previous = points[j ? ids[j-1] : 0];
      let dx = point.x-previous.x, dy = point.y-previous.y;
      let length = max(1,sqrt(dx*dx+dy*dy));
      let radius = j === 3 ? 5 : 8;
      outline.push({x:point.x+dy/length*radius,y:point.y-dx/length*radius});
    }
    for (let j = ids.length-1; j >= 0; j--) {
      let point = points[ids[j]];
      let previous = points[j ? ids[j-1] : 0];
      let dx=point.x-previous.x,dy=point.y-previous.y;
      let length=max(1,sqrt(dx*dx+dy*dy));
      let radius=j===3?5:8;
      outline.push({x:point.x-dy/length*radius,y:point.y+dx/length*radius});
    }
  }
  outline.push({x:points[0].x+13,y:points[0].y},outline[0],outline[1]);
  inkPath(outline,8,12);
  inkPath(outline,4,60);
  inkPath(outline,1.7,155);
  // A few palm creases, instead of a full joint skeleton.
  inkPath([points[5],points[5],points[9],points[13],points[17],points[17]],1.2,90);
  inkPath([points[1],points[1],points[5],points[0],points[0]],1.2,80);
}

class Companion {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.contact = 0;
    this.mark = 0;
  }
  update() {
    let targetX=0,targetY=0;
    if (playerPoints.length) {
      // The supplied hand stays in its original pose and slowly follows the palm.
      targetX=constrain(playerPoints[9].x-width*0.5,-width*0.24,width*0.24);
      targetY=constrain(playerPoints[9].y-height*0.52,-height*0.22,height*0.22);
    }
    this.x+=(targetX-this.x)*0.025;
    this.y+=(targetY-this.y)*0.025;
    this.contact=0;
    if (playerPoints.length) {
      let distance=dist(playerPoints[9].x,playerPoints[9].y,width*0.5+this.x,height*0.52+this.y);
      this.contact=constrain(1-distance/105,0,1);
      this.mark=max(this.mark,this.contact);
    }
  }
  display() {
    image(inkHand,this.x,this.y,width,height);
    if (playerPoints.length && this.mark>0) {
      let point=playerPoints[9];
      noStroke();
      for (let i=6;i>0;i--) {
        fill(35,140,122,3+this.contact*3);
        ellipse(point.x,point.y,i*10,i*8);
      }
    }
  }
}

function updateStatus() {
  let message;
  if (cameraLoading) message="Loading camera and hand model…";
  else if (demo) message="Move your mouse to try the ink hand.";
  else if (tracking) {
    if (hands.length && millis()-lastDetection<650) message="Hand detected. Move slowly and pause near the ink hand.";
    else message="Camera is on. Hold one hand in view with fingers visible.";
  } else return;
  document.getElementById("status").textContent=message;
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
  cameraLoading=true;
  document.getElementById("camera").disabled=true;
  document.getElementById("status").textContent="Loading hand tracking…";
  try {
    if (typeof ml5 === "undefined") throw new Error("ml5 library did not load. Check your connection.");
    if (!handPose) handPose=await ml5.handPose();
    // Use the instructor's p5 capture approach and wait until video metadata is ready.
    video=await new Promise(function(resolve,reject) {
      let capture=createCapture({video:{width:640,height:480},audio:false},function() {
        resolve(capture);
      });
      capture.size(640,480);
      capture.hide();
      capture.elt.addEventListener("error",function(){reject(new Error("Camera video failed."));},{once:true});
      capture.elt.addEventListener("loadeddata",function(){resolve(capture);},{once:true});
      // The timeout also covers a permission prompt left unanswered.
      setTimeout(function(){
        if (!capture.elt.srcObject) {
          capture.remove();
          reject(new Error("Camera access was not granted. Allow the camera, then retry."));
        }
      },20000);
      video=capture;
    });
    handPose.detectStart(video,gotHands);
    tracking=true;
    demo=false;
    document.getElementById("demo").textContent="Try with mouse";
    document.getElementById("camera").hidden=true;
    document.getElementById("stop-camera").hidden=false;
    if (!opening.started) {
      opening.start();
      document.getElementById("begin").hidden=true;
      document.getElementById("replay").disabled=false;
    }
  } catch(error) {
    stopCamera();
    document.getElementById("status").textContent=error.message+" Use Live Server and check browser camera permission.";
    console.error(error);
  } finally {
    cameraLoading=false;
    document.getElementById("camera").disabled=false;
  }
}

function gotHands(results) {
  hands=results;
  lastDetection=millis();
}

function stopCamera() {
  if (handPose && tracking) handPose.detectStop();
  tracking = false;
  hands = [];
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
