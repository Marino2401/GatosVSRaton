// Matriz corregida: Las paredes sólidas están marcadas con 1 y los pasillos con 0
const LABERINTO = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,0,0,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,0,0,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,1,1,1,0,1,1,0,1,1,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const FILAS = LABERINTO.length;
const COLUMNAS = LABERINTO[0].length;

const canvas = document.getElementById('juegoCanvas');
const ctx = canvas.getContext('2d');
const ANCHO_CELDA = canvas.width / COLUMNAS;
const ALTO_CELDA = canvas.height / FILAS;

let jugador = { x: 1.5, y: 1.5, velocidad: 0.12 };
let queso = { x: COLUMNAS - 2, y: FILAS - 2 };
let gatos = [
    { x: 9.5, y: 1.5, velocidad: 0.035, color: '#ff3333', ruta: [] },
    { x: 18.5, y: 11.5, velocidad: 0.03, color: '#ff6600', ruta: [] }
];

let controles = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
let juegoActivo = false;

document.getElementById('btn-comenzar').addEventListener('click', () => {
    document.getElementById('pantalla-inicio').classList.add('oculto');
    juegoActivo = true;
});

document.getElementById('btn-reiniciar').addEventListener('click', () => { location.reload(); });

window.addEventListener('keydown', (e) => {
    if (e.key in controles) { controles[e.key] = true; e.preventDefault(); }
    if (e.key.toLowerCase() === 'w') controles.w = true;
    if (e.key.toLowerCase() === 's') controles.s = true;
    if (e.key.toLowerCase() === 'a') controles.a = true;
    if (e.key.toLowerCase() === 'd') controles.d = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key in controles) controles[e.key] = false;
    if (e.key.toLowerCase() === 'w') controles.w = false;
    if (e.key.toLowerCase() === 's') controles.s = false;
    if (e.key.toLowerCase() === 'a') controles.a = false;
    if (e.key.toLowerCase() === 'd') controles.d = false;
});

function detectarColision(nx, ny) {
    let margen = 0.35;
    let puntosRevision = [
        {x: nx - margen, y: ny - margen},
        {x: nx + margen, y: ny - margen},
        {x: nx - margen, y: ny + margen},
        {x: nx + margen, y: ny + margen}
    ];
    for (let p of puntosRevision) {
        let celdaX = Math.floor(p.x);
        let celdaY = Math.floor(p.y);
        if (LABERINTO[celdaY]?.[celdaX] === 1) return true;
    }
    return false;
}

function moverJugador() {
    let dx = 0, dy = 0;
    if (controles.w || controles.ArrowUp) dy -= jugador.velocidad;
    if (controles.s || controles.ArrowDown) dy += jugador.velocidad;
    if (controles.a || controles.ArrowLeft) dx -= jugador.velocidad;
    if (controles.d || controles.ArrowRight) dx += jugador.velocidad;

    if (!detectarColision(jugador.x + dx, jugador.y)) jugador.x += dx;
    if (!detectarColision(jugador.x, jugador.y + dy)) jugador.y += dy;
}

function ejecutarAStar(iX, iY, fX, fY) {
    let abierta = [];
    let cerrada = Array(FILAS).fill().map(() => Array(COLUMNAS).fill(false));
    let nodos = Array(FILAS).fill().map((_, r) => Array(COLUMNAS).fill().map((_, c) => ({ x: c, y: r, g: Infinity, f: Infinity, padre: null })));

    let inicio = nodos[iY][iX], fin = nodos[fY][fX];
    if (!inicio || !fin) return [];
    
    inicio.g = 0; inicio.f = Math.abs(iX - fX) + Math.abs(iY - fY);
    abierta.push(inicio);

    while (abierta.length > 0) {
        abierta.sort((a, b) => a.f - b.f);
        let actual = abierta.shift();
        cerrada[actual.y][actual.x] = true;

        if (actual.x === fin.x && actual.y === fin.y) {
            let ruta = []; let c = actual;
            while (c !== null) { ruta.push({ x: c.x, y: c.y }); c = c.padre; }
            return ruta.reverse();
        }

        let dx = [0, 0, -1, 1], dy = [-1, 1, 0, 0];
        for (let i = 0; i < 4; i++) {
            let nx = actual.x + dx[i], ny = actual.y + dy[i];
            if (nx >= 0 && nx < COLUMNAS && ny >= 0 && ny < FILAS && LABERINTO[ny][nx] === 0 && !cerrada[ny][nx]) {
                let gT = actual.g + 1;
                let v = nodos[ny][nx];
                if (gT < v.g) {
                    v.padre = actual; v.g = gT;
                    v.f = gT + Math.abs(nx - fX) + Math.abs(ny - fY);
                    if (!abierta.includes(v)) abierta.push(v);
                }
            }
        }
    }
    return [];
}

function actualizarGatos() {
    let jX = Math.floor(jugador.x), jY = Math.floor(jugador.y);
    gatos.forEach(gato => {
        let gX = Math.floor(gato.x), gY = Math.floor(gato.y);
        gato.ruta = ejecutarAStar(gX, gY, jX, jY);

        if (gato.ruta.length > 1) {
            let siguientePaso = gato.ruta[1];
            let tX = siguientePaso.x + 0.5, tY = siguientePaso.y + 0.5;
            let dX = tX - gato.x, dY = tY - gato.y;
            let dist = Math.sqrt(dX*dX + dY*dY);
            if (dist > 0.05) {
                gato.x += (dX / dist) * gato.velocidad;
                gato.y += (dY / dist) * gato.velocidad;
            }
        }
        if (Math.abs(gato.x - jugador.x) < 0.5 && Math.abs(gato.y - jugador.y) < 0.5) finalizarJuego(false);
    });
}

function dibujarJuego() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < FILAS; r++) {
        for (let c = 0; c < COLUMNAS; c++) {
            if (LABERINTO[r][c] === 1) {
                ctx.fillStyle = '#2d2d44';
                ctx.fillRect(c * ANCHO_CELDA, r * ALTO_CELDA, ANCHO_CELDA, ALTO_CELDA);
                ctx.strokeStyle = '#1e1e2f';
                ctx.strokeRect(c * ANCHO_CELDA, r * ALTO_CELDA, ANCHO_CELDA, ALTO_CELDA);
            }
        }
    }

    gatos.forEach(gato => {
        if (gato.ruta.length > 0) {
            ctx.strokeStyle = gato.color + '44';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(gato.x * ANCHO_CELDA, gato.y * ALTO_CELDA);
            gato.ruta.forEach(p => ctx.lineTo((p.x + 0.5) * ANCHO_CELDA, (p.y + 0.5) * ALTO_CELDA));
            ctx.stroke();
        }
    });

    // Queso Objetivo
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc((queso.x + 0.5) * ANCHO_CELDA, (queso.y + 0.5) * ALTO_CELDA, ANCHO_CELDA * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Gatos
    gatos.forEach(gato => {
        ctx.fillStyle = gato.color;
        ctx.beginPath();
        ctx.arc(gato.x * ANCHO_CELDA, gato.y * ALTO_CELDA, ANCHO_CELDA * 0.38, 0, Math.PI * 2);
        ctx.fill();
    });

    // Ratón
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.arc(jugador.x * ANCHO_CELDA, jugador.y * ALTO_CELDA, ANCHO_CELDA * 0.35, 0, Math.PI * 2);
    ctx.fill();
}

function verificarVictoria() {
    if (Math.abs(queso.x + 0.5 - jugador.x) < 0.6 && Math.abs(queso.y + 0.5 - jugador.y) < 0.6) finalizarJuego(true);
}

function finalizarJuego(ganado) {
    juegoActivo = false;
    const pantallaFin = document.getElementById('pantalla-fin');
    const texto = document.getElementById('texto-resultado');
    const subtexto = document.getElementById('subtexto-resultado');
    pantallaFin.classList.remove('oculto');
    if (ganado) {
        texto.textContent = "¡GANASTE!"; texto.className = "ganaste";
        subtexto.textContent = "¡Increíble! Lograste evadir los cálculos de trayectoria en tiempo real del Algoritmo A* y asegurar el queso.";
    } else {
        texto.textContent = "TE ATRAPARON"; texto.className = "perdiste";
        subtexto.textContent = "Los gatos recalcularon de manera óptima la distancia Manhattan del laberinto e interceptaron tu posición.";
    }
}

function buclePrincipal() {
    if (juegoActivo) { moverJugador(); actualizarGatos(); verificarVictoria(); }
    dibujarJuego();
    requestAnimationFrame(buclePrincipal);
}

buclePrincipal();
