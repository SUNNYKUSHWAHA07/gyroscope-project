


// script.js
const { Engine, Render, Runner, Bodies, World, Body, Composite, Events } = Matter;

// Get the start button
const startButton = document.getElementById('startButton');
const Main = document.getElementById('main');

// Define dimensions for consistency
const width = 390;
const height = 450;
document.getElementById('canvas').width = width;
document.getElementById('canvas').height = height;

// --- Engine Setup ---
const engine = Engine.create();
const world = engine.world;

// Set initial gravity to zero; it will be controlled by the gyroscope
world.gravity.y = 0;
world.gravity.x = 0;

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

const wallOptions = {
  isStatic: true,
  render: {
    fillStyle: 'transparent',
    strokeStyle: 'transparent',
    lineWidth: 0
  }
};

// --- Create Walls ---
const thickness = 100;
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
const numBalls = 30;
const radius = 10;
const ballColor = "#c9c4c9ff";

for (let i = 0; i < numBalls; i++) {
  const ball = Bodies.circle(
    // Spawn in the middle area
    width / 2 + (Math.random() - 0.5) * 200,
    height / 2 + (Math.random() - 0.5) * 200,
    radius, {
      restitution: 0.9, // Bounciness
      friction: 0.01,
      frictionAir: 0.005,
      density: 0.001,
      render: {
        fillStyle: ballColor
      }
    }
  );
  balls.push(ball);
}
Composite.add(world, balls);

// --- Gyroscope Controls ---

// Function to request access to device orientation
async function requestGyroAccess() {
  // Hide the button after it's clicked
  startButton.style.display = 'none';
  
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    // iOS 13+
    try {
      const permissionState = await DeviceOrientationEvent.requestPermission();
      if (permissionState === 'granted') {
        window.addEventListener('deviceorientation', handleOrientation);
      } else {
        alert('Permission not granted for device orientation.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while requesting permission.');
    }
  } else {
    // Non-iOS 13+ browsers
    window.addEventListener('deviceorientation', handleOrientation);
  }
}

// Event handler for device orientation
function handleOrientation(event) {
  
  // beta: front-back tilt (-180 to 180) -> controls Y gravity
  // gamma: left-right tilt (-90 to 90) -> controls X gravity
  const { beta, gamma } = event;

  // Map tilt to gravity
  // We divide by a factor (e.g., 45) to scale the gravity.
  // A larger divisor means less sensitivity.
  const gravityScale = 30;
  world.gravity.y = beta / gravityScale;
  world.gravity.x = gamma / gravityScale;
}


// Event listener for the start button
startButton.addEventListener('click', requestGyroAccess);
// requestGyroAccess()

// --- Speed Limiter (Optional but recommended) ---
// This prevents balls from moving unrealistically fast
Events.on(engine, 'beforeUpdate', function() {
  const maxSpeed = 5; // Maximum speed
  
  balls.forEach(ball => {
    const speed = ball.speed;
    
    if (speed > maxSpeed) {
      // If speed is too high, scale the velocity down
      // This preserves the direction of movement
      Body.setVelocity(ball, {
        x: ball.velocity.x * (maxSpeed / speed),
        y: ball.velocity.y * (maxSpeed / speed),
      });
    }
  });
});