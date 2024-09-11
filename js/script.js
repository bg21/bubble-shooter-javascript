const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const bubbleRadius = 20;
const colors = ['red', 'blue', 'green', 'yellow', 'purple'];

let bubbles = [];
let shooterX = canvas.width / 2;
let shooterY = canvas.height - bubbleRadius;
let shooting = false;
let shotBubble = { x: shooterX, y: shooterY, color: colors[Math.floor(Math.random() * colors.length)] };
let dx = 0;
let dy = -5;
let score = 0;


function createBubbles() {
    bubbles = []; // Limpar bolhas existentes antes de criar novas
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 12; col++) {
            const x = col * bubbleRadius * 2 + bubbleRadius;
            const y = row * bubbleRadius * 2 + bubbleRadius;
            const color = colors[Math.floor(Math.random() * colors.length)];
            bubbles.push({ x, y, color });
        }
    }
}


function drawBubbles() {
    bubbles.forEach(bubble => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubbleRadius, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.fill();
        ctx.closePath();
    });
}


// Função para desenhar o atirador (linha de tiro)
function drawShooter() {
    ctx.beginPath();
    ctx.moveTo(shooterX, shooterY);
    ctx.lineTo(shooterX, shooterY - 30);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawShotBubble() {
    ctx.beginPath();
    ctx.arc(shotBubble.x, shotBubble.y, bubbleRadius, 0, Math.PI * 2);
    ctx.fillStyle = shotBubble.color;
    ctx.fill();
    ctx.closePath();
}

function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Score: ${score}`, 10, 10);
}

canvas.addEventListener('click', (event) => {
    if (!shooting) {
        shooting = true;
        dx = (event.offsetX - shooterX) / 20;
        dy = (event.offsetY - shooterY) / 20;
    }
});


function moveShotBubble() {
    if (shooting) {
        shotBubble.x += dx;
        shotBubble.y += dy;

        // Verifica colisão com as bordas do canvas
        if (shotBubble.x <= bubbleRadius || shotBubble.x >= canvas.width - bubbleRadius) {
            dx = -dx;
        }

        // Verifica se a bolha disparada atingiu o topo
        if (shotBubble.y <= bubbleRadius) {
            shooting = false;
            alignBubble(shotBubble);
            bubbles.push(shotBubble);
            removeConnectedBubbles(shotBubble);
            shotBubble = { x: shooterX, y: shooterY, color: colors[Math.floor(Math.random() * colors.length)] };
        }

        // Detecta colisão com outras bolhas
        bubbles.forEach(bubble => {
            const dist = Math.sqrt((bubble.x - shotBubble.x) ** 2 + (bubble.y - shotBubble.y) ** 2);
            if (dist <= bubbleRadius * 2) {
                shooting = false;
                alignBubble(shotBubble);
                bubbles.push(shotBubble);
                removeConnectedBubbles(shotBubble);
                shotBubble = { x: shooterX, y: shooterY, color: colors[Math.floor(Math.random() * colors.length)] };
            }
        });
    }
}


function alignBubble(bubble) {
    // Calcula a posição de grade mais próxima
    const col = Math.round((bubble.x - bubbleRadius) / (bubbleRadius * 2));
    const row = Math.round((bubble.y - bubbleRadius) / (bubbleRadius * 2));
    bubble.x = col * bubbleRadius * 2 + bubbleRadius;
    bubble.y = row * bubbleRadius * 2 + bubbleRadius;
}



function removeConnectedBubbles(shotBubble) {
    const color = shotBubble.color;
    const connected = new Set(); // Usar um Set para evitar duplicatas
    const stack = [shotBubble];

    // Encontrar todas as bolhas conectadas da mesma cor
    while (stack.length > 0) {
        const bubble = stack.pop();
        const key = `${bubble.x},${bubble.y}`; // Usar uma string como chave para evitar duplicatas

        if (!connected.has(key)) {
            connected.add(key);

            // Verifica bolhas vizinhas
            const neighbors = [
                { x: bubble.x, y: bubble.y - bubbleRadius * 2 }, // Acima
                { x: bubble.x + bubbleRadius * 2, y: bubble.y }, // Direita
                { x: bubble.x - bubbleRadius * 2, y: bubble.y }, // Esquerda
                { x: bubble.x, y: bubble.y + bubbleRadius * 2 }, // Abaixo
                { x: bubble.x + bubbleRadius * 2, y: bubble.y - bubbleRadius * 2 }, // Diagonal superior direita
                { x: bubble.x - bubbleRadius * 2, y: bubble.y - bubbleRadius * 2 }, // Diagonal superior esquerda
                { x: bubble.x + bubbleRadius * 2, y: bubble.y + bubbleRadius * 2 }, // Diagonal inferior direita
                { x: bubble.x - bubbleRadius * 2, y: bubble.y + bubbleRadius * 2 }  // Diagonal inferior esquerda
            ];

            neighbors.forEach(neighbor => {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                if (!connected.has(neighborKey)) {
                    const neighborBubble = bubbles.find(b => b.x === neighbor.x && b.y === neighbor.y && b.color === color);
                    if (neighborBubble) {
                        stack.push(neighborBubble);
                    }
                }
            });
        }
    }

    // Remove bolhas conectadas e atualiza a pontuação
    if (connected.size >= 3) {
        bubbles = bubbles.filter(bubble => !connected.has(`${bubble.x},${bubble.y}`));
        score += connected.size; // Atualiza a pontuação com base no número de bolhas removidas
    }
}



function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBubbles();
    drawShooter();
    drawShotBubble();
    drawScore();

    if (shooting) {
        moveShotBubble();
    }

    requestAnimationFrame(render);
}

createBubbles();
render();
