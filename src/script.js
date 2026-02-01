// ==========================================
// CANVAS SETUP
// ==========================================
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ==========================================
// CABLE NETWORK DATA
// ==========================================
// Generate realistic cable network nodes (representing major cities/landing points)
const nodes = [
    // North America
    { x: 0.15, y: 0.35, name: 'New York' },
    { x: 0.12, y: 0.42, name: 'Miami' },
    { x: 0.05, y: 0.38, name: 'Los Angeles' },
    { x: 0.08, y: 0.32, name: 'San Francisco' },
    { x: 0.10, y: 0.30, name: 'Seattle' },
    
    // Europe
    { x: 0.45, y: 0.28, name: 'London' },
    { x: 0.48, y: 0.32, name: 'Paris' },
    { x: 0.50, y: 0.30, name: 'Amsterdam' },
    { x: 0.52, y: 0.35, name: 'Frankfurt' },
    { x: 0.42, y: 0.38, name: 'Lisbon' },
    
    // Asia
    { x: 0.75, y: 0.35, name: 'Tokyo' },
    { x: 0.72, y: 0.40, name: 'Shanghai' },
    { x: 0.70, y: 0.42, name: 'Hong Kong' },
    { x: 0.68, y: 0.45, name: 'Singapore' },
    { x: 0.65, y: 0.48, name: 'Mumbai' },
    
    // South America
    { x: 0.22, y: 0.65, name: 'São Paulo' },
    { x: 0.20, y: 0.70, name: 'Buenos Aires' },
    
    // Africa
    { x: 0.48, y: 0.60, name: 'Cape Town' },
    { x: 0.50, y: 0.50, name: 'Cairo' },
    
    // Australia
    { x: 0.82, y: 0.68, name: 'Sydney' },
    { x: 0.78, y: 0.72, name: 'Melbourne' },
];

// Generate cable connections between nodes
const cables = [
    // Transatlantic
    [0, 5], [0, 6], [1, 9], [0, 7],
    // Transpacific
    [3, 10], [4, 10], [7, 11], [3, 11],
    // Asia-Europe
    [5, 12], [6, 13], [8, 14],
    // Intra-continental
    [0, 1], [0, 3], [3, 4], [5, 6], [6, 7], [7, 8],
    [10, 11], [11, 12], [12, 13], [13, 14],
    // South America
    [1, 15], [15, 16],
    // Africa
    [9, 17], [17, 18], [6, 18],
    // Australia
    [13, 19], [19, 20],
    // Additional connections
    [14, 18], [12, 19], [5, 8], [11, 13]
];

// ==========================================
// ANIMATION STATE
// ==========================================
let offset = { x: 0, y: 0 };
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let animationFrame = 0;

// ==========================================
// DRAWING FUNCTIONS
// ==========================================
function drawCable(node1, node2, progress) {
    const x1 = node1.x * canvas.width + offset.x;
    const y1 = node1.y * canvas.height + offset.y;
    const x2 = node2.x * canvas.width + offset.x;
    const y2 = node2.y * canvas.height + offset.y;
    
    // Create gradient for cable
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
    gradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0.3)');
    
    // Draw cable line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw animated pulse along cable
    const pulsePos = (progress % 1);
    const pulseX = x1 + (x2 - x1) * pulsePos;
    const pulseY = y1 + (y2 - y1) * pulsePos;
    
    // Pulse glow
    const pulseGradient = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 15);
    pulseGradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
    pulseGradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.4)');
    pulseGradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
    
    ctx.beginPath();
    ctx.arc(pulseX, pulseY, 15, 0, Math.PI * 2);
    ctx.fillStyle = pulseGradient;
    ctx.fill();
}

function drawNode(node) {
    const x = node.x * canvas.width + offset.x;
    const y = node.y * canvas.height + offset.y;
    
    // Outer glow
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
    glowGradient.addColorStop(0, 'rgba(74, 158, 255, 0.6)');
    glowGradient.addColorStop(1, 'rgba(74, 158, 255, 0)');
    
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();
    
    // Inner node
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#4a9eff';
    ctx.fill();
    
    // Node border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

function drawBackground() {
    // Create subtle grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    for (let x = (offset.x % gridSize); x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = (offset.y % gridSize); y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// ==========================================
// ANIMATION LOOP
// ==========================================
function animate() {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    drawBackground();
    
    // Calculate animation progress
    animationFrame += 0.005;
    
    // Draw cables with animated pulses
    cables.forEach((cable, index) => {
        const node1 = nodes[cable[0]];
        const node2 = nodes[cable[1]];
        const progress = animationFrame + (index * 0.1);
        drawCable(node1, node2, progress);
    });
    
    // Draw nodes
    nodes.forEach(node => {
        drawNode(node);
    });
    
    requestAnimationFrame(animate);
}

// Start animation
animate();

// ==========================================
// INTERACTION - DRAG TO PAN
// ==========================================
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStart = { x: e.clientX - offset.x, y: e.clientY - offset.y };
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        offset.x = e.clientX - dragStart.x;
        offset.y = e.clientY - dragStart.y;
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches[0];
    dragStart = { x: touch.clientX - offset.x, y: touch.clientY - offset.y };
    e.preventDefault();
});

canvas.addEventListener('touchmove', (e) => {
    if (isDragging) {
        const touch = e.touches[0];
        offset.x = touch.clientX - dragStart.x;
        offset.y = touch.clientY - dragStart.y;
    }
    e.preventDefault();
});

canvas.addEventListener('touchend', () => {
    isDragging = false;
});

// ==========================================
// INFO PANEL CONTROLS
// ==========================================
const closeBtn = document.getElementById('closeBtn');
const infoPanel = document.getElementById('infoPanel');

closeBtn.addEventListener('click', () => {
    infoPanel.classList.add('fade-out');
    setTimeout(() => {
        infoPanel.classList.add('hidden');
    }, 300);
});
