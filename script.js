

const { Engine, Render, Runner, Bodies, World, Body, Composite, Events } = Matter;


// Get the start button
const startButton = document.getElementById('startButton');
const Main = document.getElementById('card-with-arrow').getBoundingClientRect();


// Define dimensions for consistency
const width = Main.width - 5;
const height = Main.height - 5;
document.getElementById('canvas').width = width;
document.getElementById('canvas').height = height;


// --- Engine Setup ---
const engine = Engine.create();
const world = engine.world;
world.gravity.y = 0.01;


// Set initial gravity to zero; it will be controlled by the gyroscope



// --- Renderer Setup ---
const render = Render.create({
  element: document.body,
  engine: engine,
  canvas: document.getElementById("canvas"),
  options: {
    width: width,
    height: height,
    wireframes: false, // realistic view
    background: "transparent"
  }
});


Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);


const thickness = 500;
const wallOptions = {
  isStatic: true,
  restitution: 1,
  frictionAir: 0,
  friction: 0, // Makes balls bounce off the walls
  render: {
    fillStyle: 'transparent',
    strokeStyle: 'transparent',
    lineWidth: 0
  }
};


// --- Create Walls ---
const walls = [
  // Top wall
  Bodies.rectangle(width / 2, -thickness / 2, width, thickness, wallOptions),
  // Bottom wall (ground)
  Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, wallOptions),
  // Left wall
  Bodies.rectangle(-thickness / 2, height / 2, thickness, height, wallOptions),
  // Right wall
  Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, wallOptions)
];
Composite.add(world, walls);



// --- Create Balls ---
const balls = [];
const numBalls = 20;
const ballRadius = 8;
const ballColor = "#c9c4c9ff";


 for (let i = 0; i <= numBalls; i++) {
    const ball = Bodies.circle(
        100 + (i * (ballRadius * 2 + 10)),
        height / 2 + (Math.random() - 0.5) * 100, // slight init. vertical jitter
        ballRadius,
      {
        restitution: 1,      // Perfect superball bounce
        friction: 0.01,
        frictionAir: 0.01,  // Minimal air resistance
        density: 0.002,
        render: { fillStyle: ballColor }
      }
    );
    balls.push(ball);
  }
  World.add(world, balls);






function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }







function startGyro() {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      DeviceOrientationEvent.requestPermission().then((res) => {
        if (res === "granted") {
          window.addEventListener("deviceorientation", handleOrientation);
          startButton.remove();
        } else alert("Permission denied");
      });
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
      startButton.remove();
    }
  }



  // Apply impulse on device orientation, with cooldown to avoid spamming
  let lastTiltTime = 0;
  let animationStopped = false;
const faceThreshold = 10;
const maxStillFrames = 2;

let lastTiltX = 0;
let lastTiltY = 0;
let lastAlpha = 0;
let stillTime = 0;

let stableMode = false;

function handleOrientation(event) {
  const now = Date.now();
  if (now - lastTiltTime < 100) return;
  lastTiltTime = now;

  let tiltX = event.gamma || 0;
  let tiltY = event.beta || 0;
  const rotationZ = event.alpha || 0;

  const diffX = Math.abs(tiltX - lastTiltX);
  const diffY = Math.abs(tiltY - lastTiltY);
  const diffA = Math.abs(rotationZ - lastAlpha);

  const changeThreshold = 0.8;

  if (diffX < changeThreshold && diffY < changeThreshold && diffA < changeThreshold) {
    stillTime++;
    if (stillTime > maxStillFrames) {
      stableMode = true; // Device is stable → settle balls
    }
  } else {
    stillTime = 0;
    stableMode = false; // Movement detected → normal bouncing
  }

  lastTiltX = tiltX;
  lastTiltY = tiltY;
  lastAlpha = rotationZ;

  // Clamp small jitters
  const jitterThreshold = 2;
  if (Math.abs(tiltX) < jitterThreshold) tiltX = 0;
  if (Math.abs(tiltY) < jitterThreshold) tiltY = 0;

  const gravityStrength = 1;
  world.gravity.x = clamp(tiltX / 90, -1, 1) * gravityStrength;
  world.gravity.y = clamp(tiltY / 90, -1, 1) * gravityStrength;

  if (!stableMode) {
    // Apply bouncing impulse only when moving
    const sensitivityDivisor = 60;
    const forceMag = 0.008;

  
 

let lastFX = 0;
let lastFY = 0;
let bounceCooldown = 400 ; // ms between bounces
let lastBounceTime = 0;

balls.forEach(ball => {
  let adjTiltX = Math.abs(tiltX) > jitterThreshold ? tiltX : 0;
  let adjTiltY = Math.abs(tiltY) > jitterThreshold ? tiltY : 0;

  // Calculate new force
  const fx = clamp(forceMag * (adjTiltX / sensitivityDivisor), -forceMag, forceMag);
  const fy = clamp(forceMag * (adjTiltY / sensitivityDivisor), -forceMag, forceMag);

  const now = Date.now();
  const forceChanged = Math.abs(fx - lastFX) > 0.0005 || Math.abs(fy - lastFY) > 0.0005;

  // Apply bounce only if force changed and cooldown passed
  if (forceChanged && (now - lastBounceTime) > bounceCooldown) {
    const cappedFX = clamp(fx, -0.005, 0.005);
    const cappedFY = clamp(fy, -0.005, 0.005);
    Body.applyForce(ball, ball.position, { x: cappedFX, y: cappedFY });

    lastBounceTime = now;
    lastFX = fx;
    lastFY = fy;
  }

  // Cap max velocity at 4–5
  const maxSpeed = 6;
  const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
  if (speed > maxSpeed) {
    Body.setVelocity(ball, {
      x: ball.velocity.x * (maxSpeed / speed),
      y: ball.velocity.y * (maxSpeed / speed),
    });
  }
});

 
  }
}


  startButton.addEventListener("click", startGyro);
