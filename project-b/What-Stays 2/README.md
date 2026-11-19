# What Stays — ink hand prototype

Open the What-Stays folder in VS Code and open index.html with Live Server.
Keep an internet connection for p5.js, ml5.js and the hand model.

- Begin plays the nine original drawings.
- Enable hand tracking asks for the camera and starts the opening if necessary.
- Once the opening ends, one tracked hand is drawn as a soft ink contour.
- The drawn companion follows the player's palm slowly.
- Bringing the palms close produces a blue-green wash on the player's palm.
- Camera preview shows a small mirrored video for positioning.
- Try with mouse previews the interaction without a webcam.
- Replay opening restarts the drawing sequence.
- Stop camera releases the webcam.

The companion keeps the hand-4 pose while moving. The player's contour follows
tracked finger joints. A single camera cannot reconstruct a precise hand edge,
so this contour is an approximation and may look distorted when fingers overlap.

The companion's dark strokes are extracted from hand-4 at runtime using brightness.
This can leave paper speckles or soften pale strokes. A transparent export from
the original drawing will produce a cleaner result. The paper is sampled from
an empty top strip of the original drawing.

Contact uses palm-center distance as a first prototype.
Sound, departure and the new hand are not implemented.

Drawings — Sally Tan.
Tracking — ml5.js, adapted from the instructor's handPose example.
Page, animation and interaction code — developed with ChatGPT.
