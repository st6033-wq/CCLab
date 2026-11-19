# What Stays — first prototype

Open this folder in Visual Studio Code. Open index.html with Live Server.
Internet access is required for p5.js, ml5.js and the hand model.

1. Press Begin to play the nine supplied drawings.
2. The final open hand stays on screen.
3. Press Enable hand tracking and allow camera access.
4. Raise a hand. Green points show the tracked joints after the opening.
5. Replay opening restarts the drawings. Stop camera releases the webcam.

Files
- index.html — page and library links
- style.css — paper-colored layout
- sketch.js — opening sequence and hand-tracking integration
- assets/ — Sally's nine original drawings, unchanged

Current scope
The ink hand does not follow the player yet. All drawings have opaque paper
backgrounds. Next prepare a transparent hand-4 PNG and a separate paper image.
Contact ink, sound, loss and the new hand are planned stages.

Timing is controlled in Opening.durations, in milliseconds.
The opening does not depend on camera permission.

Credits
Drawings and project concept — Sally Tan.
Hand tracking — ml5.js, based on the instructor-supplied handPose example.
Starter page, animation organization and integration — created with ChatGPT.
Course brief permits AI for ideation only. Confirm permitted use with the
instructor before using this generated implementation in assessed work.
