

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
world.gravity.y = 0.1;


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
        friction: 0,
        frictionAir: 0.002,  // Minimal air resistance
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
  function handleOrientation(event) {
    const now = Date.now();
    if (now - lastTiltTime < 100) return; 
    lastTiltTime = now;


    let tiltX = event.gamma || 0;
    let tiltY = event.beta || 0;
   
    const rotationZ = event.alpha || 0; // Device rotation around Z-axis


      // Kitna change hua — threshold 0.5 degree rakha hai
  const diffX = Math.abs(tiltX - lastTiltX);
  const diffY = Math.abs(tiltY - lastTiltY);
  const diffA = Math.abs(rotationZ - lastAlpha);
 
   const changeThreshold = 0.8;


     if (diffX < changeThreshold && diffY < changeThreshold && diffA < changeThreshold) {
    stillTime++;
    // Agar 5 frames se kam change ho raha to animation stop
    if (stillTime > maxStillFrames) {
      return; // No tilt force, sirf gravity ka effect hoga
    }
  } else {
    stillTime = 0; // Movement detect ho gayi, reset counter
  }


  // Update last values
  lastTiltX = tiltX;
  lastTiltY = tiltY;
  lastAlpha = rotationZ;


 
    const sensitivityDivisor = 60;
    const forceMag = 0.005; // Impulse strength; increase for stronger bounce


    const threshold = 5; // degree
  if (Math.abs(tiltX) < threshold) tiltX = 0;
  if (Math.abs(tiltY) < threshold) tiltY = 0;



  balls.forEach(ball => {
  const fx = clamp(forceMag * (tiltX / sensitivityDivisor), -forceMag, forceMag);
  // Prevent upward force (fy < 0)
  const rawFy = forceMag * (-tiltY / sensitivityDivisor);
  const fy = clamp(Math.max(rawFy, 0), 0, forceMag);
  Body.applyForce(ball, ball.position, { x: fx, y: fy });
});



 
  }


  Events.on(engine, "beforeUpdate", function() {
    const maxSpeed = 15; // High max speed for superballs
    balls.forEach(ball => {
      const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
      if (speed > maxSpeed) {
        Body.setVelocity(ball, {
          x: ball.velocity.x * (maxSpeed / speed),
          y: ball.velocity.y * (maxSpeed / speed),
        });
      }
    });
  });


  startButton.addEventListener("click", startGyro);