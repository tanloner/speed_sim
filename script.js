// Rectangle
const canvas = document.getElementById('playground');
const ctx = canvas.getContext('2d');
const trackCanvas = document.getElementById('track');
const trackCtx = trackCanvas.getContext('2d');

// Actual State
let actualRect = { x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0 };

// Sampled State (Based on discrete acceleration measurements)
let sampledRect = { x: 0, y: 0, vx: 0, vy: 0 };

// Trails for Visualization
let actualTrail = [{ x: actualRect.x, y: actualRect.y }];
let sampledTrail = [{ x: sampledRect.x, y: sampledRect.y }];

// Simulation Control Variables
let running = true; // Simulation running state
let interval = 1; // Interval for acceleration measurement (in frames)
let time = 0; // Time variable for the simulation
let lastAccelerationTime = 0; // Last time acceleration was measured
let deltaTime = 1 / 60; // 60 FPS

// Function to Update Actual Velocity based on Continuous Acceleration
function updateActualVelocity() {
    actualRect.vx += actualRect.ax * deltaTime;
    actualRect.vy += actualRect.ay * deltaTime;
}

// Function to Update Actual Position based on Actual Velocity
function updateActualPosition() {
    actualRect.x += actualRect.vx * deltaTime * 100; // Scaling for visibility
    actualRect.y += actualRect.vy * deltaTime * 100;

    actualTrail.push({ x: actualRect.x, y: actualRect.y });
    if (actualTrail.length > 600) actualTrail.shift();

    // Boundary Conditions
    if (actualRect.x < 0) actualRect.x = 0;
    if (actualRect.y < 0) actualRect.y = 0;
    if (actualRect.x > canvas.width - 20) actualRect.x = canvas.width - 20;
    if (actualRect.y > canvas.height - 20) actualRect.y = canvas.height - 20;
}

// Update Sampled Velocity based on Sampled Acceleration
function updateSampledState() {
    sampledRect.vx += actualRect.ax * deltaTime * interval;
    sampledRect.vy += actualRect.ay * deltaTime * interval;
    sampledRect.x += sampledRect.vx * deltaTime * interval * 100;
    sampledRect.y += sampledRect.vy * deltaTime * interval * 100;

    sampledTrail.push({ x: sampledRect.x, y: sampledRect.y });
    if (sampledTrail.length > 200) sampledTrail.shift();

    // Boundary Conditions
    if (sampledRect.x < 0) sampledRect.x = 0;
    if (sampledRect.y < 0) sampledRect.y = 0;
    if (sampledRect.x > canvas.width - 20) sampledRect.x = canvas.width - 20;
    if (sampledRect.y > canvas.height - 20) sampledRect.y = canvas.height - 20;
}

// Draw the Actual Rectangle and Trail
function drawActual() {
    // Draw Actual Trail
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    for (let i = 0; i < actualTrail.length - 1; i++) {
        ctx.moveTo(actualTrail[i].x + 10, actualTrail[i].y + 10);
        ctx.lineTo(actualTrail[i + 1].x + 10, actualTrail[i + 1].y + 10);
    }
    ctx.stroke();

    // Draw Actual Rectangle
    ctx.fillStyle = 'blue';
    ctx.fillRect(actualRect.x, actualRect.y, 20, 20);
}

// Draw the Sampled Trail
function drawSampled() {
    // Draw Sampled Trail
    ctx.strokeStyle = 'orange';
    ctx.beginPath();
    for (let i = 0; i < sampledTrail.length - 1; i++) {
        ctx.moveTo(sampledTrail[i].x + 10, sampledTrail[i].y + 10);
        ctx.lineTo(sampledTrail[i + 1].x + 10, sampledTrail[i + 1].y + 10);
    }
    ctx.stroke();

    // draw Sampled Rectangle
    ctx.fillStyle = 'red';
    ctx.fillRect(sampledRect.x, sampledRect.y, 20, 20);
}

// Draw Track Map based on Sampled Trail
function drawTrackMap() {
    trackCtx.clearRect(0, 0, trackCanvas.width, trackCanvas.height);
    trackCtx.strokeStyle = 'red';
    trackCtx.beginPath();
    for (let i = 0; i < sampledTrail.length - 1; i++) {
        trackCtx.moveTo(sampledTrail[i].x / 2, sampledTrail[i].y / 2);
        trackCtx.lineTo(sampledTrail[i + 1].x / 2, sampledTrail[i + 1].y / 2);
    }
    trackCtx.stroke();
}

// Keyboard Controls
document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key === 'ArrowUp') actualRect.ay = -0.5; // Adjusted for visibility
    if (key === 'ArrowDown') actualRect.ay = 0.5;
    if (key === 'ArrowLeft') actualRect.ax = -0.5;
    if (key === 'ArrowRight') actualRect.ax = 0.5;
});

document.addEventListener('keyup', (event) => {
    const key = event.key;
    if (key === 'ArrowUp' || key === 'ArrowDown') actualRect.ay = 0;
    if (key === 'ArrowLeft' || key === 'ArrowRight') actualRect.ax = 0;
});

// Toggle Running State
document.getElementById('toggleSim').addEventListener('click', () => {
    running = !running;
    document.getElementById('toggleSim').textContent = running ? 'Simulation stoppen' : 'Simulation starten';
});

// Slider for Sampling Interval
document.getElementById('intervalSlider').addEventListener('input', (event) => {
    interval = parseInt(event.target.value);
    document.getElementById('intervalValue').textContent = interval;
});

function initGraphs() {
    //maybe later offer a way to make those graphs 2d
    Plotly.newPlot('accelerationGraph', [{
        x: [0],
        y: [0],
        z: [0],
        type: 'scatter3d',
        mode: 'lines+markers',
        name: 'Beschleunigung',
        line: { color: 'blue' },
        marker: {
          color: 'blue',
          size: 2
        }

    }], {
        title: 'Beschleunigung (X: O/W, Z: N/S, Y: Zeit)',
        scene: { 
            xaxis: { title: 'Zeit' }, 
            yaxis: { title: 'O/W (X)' }, 
            zaxis: { title: 'N/S (Z)' } 
        }
    });

    Plotly.newPlot('velocityGraph', [{
        x: [0],
        y: [0],
        z: [0],
        type: 'scatter3d',
        mode: 'lines+markers',
        name: 'Geschwindigkeit',
        line: { color: 'green' },
        marker: {
          color: 'green',
          size: 2
        }
    }], {
        title: 'Geschwindigkeit (X: O/W, Z: N/S, Y: Zeit)',
        scene: { 
            xaxis: { title: 'Zeit' }, 
            yaxis: { title: 'O/W (X)' }, 
            zaxis: { title: 'N/S (Z)' } 
        }
    });

    Plotly.newPlot('positionGraph', [{
        x: [0],
        y: [0],
        z: [0],
        type: 'scatter3d',
        mode: 'lines+markers',
        name: 'Position',
        line: { color: 'red' },
        marker: {
          color: 'red',
          size: 2
        }
    }], {
        title: 'Position (X: O/W, Z: N/S, Y: Zeit)',
        scene: { 
            xaxis: { title: 'Zeit' }, 
            yaxis: { title: 'O/W (X)' }, 
            zaxis: { title: 'N/S (Z)' } 
        }
    });
}

function updateGraphs(currentTime) {
    Plotly.extendTraces('accelerationGraph', {
        x: [[currentTime]],
        y: [[actualRect.ax]],
        z: [[actualRect.ay]]
    }, [0]);

    Plotly.extendTraces('velocityGraph', {
        x: [[currentTime]],
        y: [[sampledRect.vx]],
        z: [[sampledRect.vy]]
    }, [0]);

    Plotly.extendTraces('positionGraph', {
        x: [[currentTime]],
        y: [[sampledRect.x]],
        z: [[sampledRect.y]]
    }, [0]);

    const maxPoints = 100; //maybe change this to a variable
    Plotly.relayout('accelerationGraph', {
        'xaxis.range': [Math.max(0, currentTime - maxPoints), currentTime]
    });
    Plotly.relayout('velocityGraph', {
        'xaxis.range': [Math.max(0, currentTime - maxPoints), currentTime]
    });
    Plotly.relayout('positionGraph', {
        'xaxis.range': [Math.max(0, currentTime - maxPoints), currentTime]
    });
    //TODO: there is the problem that even if the sim is stopped the time is still running, so when continued you can see that the graphs all have a gap
}

// Sampling Mechanism to Update Sampled State and Graphs
function sampleAndUpdate() {
    updateSampledState();
    updateGraphs(time);
}

// Main loop
function animate() {
    if (running) {
        updateActualVelocity();
        updateActualPosition();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawActual();
        drawSampled();

        drawTrackMap();

        if (time % interval === 0) {
            sampleAndUpdate();
        }
    }
    time++;
    requestAnimationFrame(animate);
}

initGraphs();
animate();

