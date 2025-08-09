


// script.js
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
world.gravity.y = 0.5;

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

// for (let i = 0; i < numBalls; i++) {
//       // Randomize physical and response properties for extra individuality
//       const density = 0.0006 + Math.random() * 0.0007;
//       const frictionAir = 0.003 + Math.random() * 0.020;
//       const restitution = 0.6 + Math.random() * 0.5;
//       // X/Y gyroscope force sensitivity, for dramatically different movement!
//       const responseFactorX = (Math.random() * 2 - 1) * (0.5 + Math.random() * 1.5);
//       const responseFactorY = (Math.random() * 2 - 1) * (0.5 + Math.random() * 1.5);
//       // "Heaviness" slows responsiveness further for some balls
//       const inertia = 0.6 + Math.random() * 1.1;

//       // Store per-ball custom properties for gyroscope response
//       const ball = Bodies.circle(
//         100 + (i * (ballRadius * 2 + 10)),
//         height / 2 + (Math.random() - 0.5) * 100, // slight init. vertical jitter
//         ballRadius,
//         {
//           restitution: restitution,
//           frictionAir: frictionAir,
//           density: density,
//           render: { fillStyle: ballColor, strokeStyle: "#888", lineWidth: 1, shadowColor: "#444", shadowBlur: 3 }
//         }
//       );
//       // Custom attributes:
//       ball._gyroResponse = { x: responseFactorX, y: responseFactorY, inertia: inertia };
//       ball._gyroVel = {x:0, y:0}; // to smoothly interpolate gyroscope forces per frame
//       balls.push(ball);
//     }

//     World.add(world, balls);
// --- Gyroscope Controls ---


function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }



// Events.on(engine, 'afterUpdate', () => {
//   balls.forEach(ball => {
//     const windForce = (Math.random() - 0.5) * 0.00007; // Slight wind
//     Body.applyForce(ball, ball.position, { x: windForce, y: 0 });
//   });
// });

// Function to request access to device orientation
// async function requestGyroAccess() {
//   // Hide the button after it's clicked
//   startButton.style.display = 'none';
  
//   if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
//     // iOS 13+
//     try {
//       const permissionState = await DeviceOrientationEvent.requestPermission();
//       if (permissionState === 'granted') {
//         window.addEventListener('deviceorientation', handleOrientation);
//       } else {
//         alert('Permission not granted for device orientation.');
//       }
//     } catch (error) {
//       console.error(error);
//       alert('An error occurred while requesting permission.');
//     }
//   } else {
//     // Non-iOS 13+ browsers
//     window.addEventListener('deviceorientation', handleOrientation);
//   }
// }


// Event handler for device orientation
// function handleOrientation(event) {
  
//   // beta: front-back tilt (-180 to 180) -> controls Y gravity
//    const tiltX = Math.abs(event.gamma) > 2 ? event.gamma : 0;
//   const tiltY = Math.abs(event.beta) > 2 ? event.beta : 0;

//       const baseForceMagnitude =  0.00018;
//       const maxForce = 0.012;
//       const minForce = -0.012;

//       balls.forEach(ball => {
//         // For smooth, inertial force changes (not just *instant* jumps with device)
//         // Gyro "target" force for this ball
//         const targetForceX = clamp(baseForceMagnitude * tiltX * ball._gyroResponse.x, minForce, maxForce);
//         const targetForceY = clamp(baseForceMagnitude * -tiltY * ball._gyroResponse.y, minForce, maxForce);

//         // Interpolate current velocity to target for inertia effect:
//         // (The smaller the inertia, the more sluggish the ball's reaction)
//         ball._gyroVel.x += (targetForceX - ball._gyroVel.x) / (5 * ball._gyroResponse.inertia);
//         ball._gyroVel.y += (targetForceY - ball._gyroVel.y) / (5 * ball._gyroResponse.inertia);

//         // Apply force
//         Body.applyForce(ball, ball.position, {
//           x: ball._gyroVel.x,
//           y: ball._gyroVel.y
//         });
//       });
// }


// Event listener for the start button
// startButton.addEventListener('click', requestGyroAccess);
// requestGyroAccess()

// Events.on(engine, 'beforeUpdate', function() {
//   const maxSpeed = 2.5; // Lower value helps
//   balls.forEach(ball => {
//     const speed = ball.speed;
//     if (speed > maxSpeed) {
//       Body.setVelocity(ball, {
//         x: ball.velocity.x * (maxSpeed / speed),
//         y: ball.velocity.y * (maxSpeed / speed),
//       });
//     }
//   });
// });


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
  function handleOrientation(event) {
    const now = Date.now();
    if (now - lastTiltTime < 400) return; // 400ms cooldown
    lastTiltTime = now;

    let tiltX = event.gamma || 0;
    let tiltY = event.beta || 0;
    const sensitivityDivisor = 60;
    const forceMag = 0.01; // Impulse strength; increase for stronger bounce

    const threshold = 5; // degree
  if (Math.abs(tiltX) < threshold) tiltX = 0;
  if (Math.abs(tiltY) < threshold) tiltY = 0;

  balls.forEach(ball => {
    const fx = clamp(forceMag * (tiltX / sensitivityDivisor), -forceMag, forceMag);
    const fy = clamp(forceMag * (-tiltY / sensitivityDivisor), -forceMag, forceMag);
    Body.applyForce(ball, ball.position, { x: fx, y: fy });
  });


    // balls.forEach(ball => {
    //   // Impulse force scaled to tilt angles, clamped to max magnitude
    //   const fx = clamp(forceMag * (tiltX / 45), -forceMag, forceMag);
    //   const fy = clamp(forceMag * (-tiltY / 45), -forceMag, forceMag);

    //   Body.applyForce(ball, ball.position, { x: fx, y: fy });
    // });
  }

  // Speed limiter to prevent unrealistic velocities
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