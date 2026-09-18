// Matriz lógica del Laberinto corregida (1: Paredes, 0: Caminos libres)
const LABERINTO = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const FILAS = LABERINTO.length;
const COLUMNAS = LABERINTO[0].length;
const ESCALA = 4;

let escena, camara, renderizador;
let jugador = { x: 1.5, z: 1.5, anguloY: 0, velocidad: 0.08, radio: 0.4 };
let queso = { celdaX: COLUMNAS - 2, celdaZ: FILAS - 2, malla: null };
let gatos = [
    { celdaX: 9, celdaZ: 1, malla: null, velocidad: 0.025, color: 0xff3333, ruta: [] },
    { celdaX: 18, celdaZ: 11, malla: null, velocidad: 0.02, color: 0xff6600, ruta: [] }
];

let controles = { w: false, a: false, s: false, d: false };
let juegoActivo = false;

const pantallaInicio = document.getElementById('pantalla-inicio');
const pantallaFin = document.getElementById('pantalla-fin');
const textoResultado = document.getElementById('texto-resultado');
const subtextoResultado = document.getElementById('subtexto-resultado');
const radarCanvas = document.getElementById('radar');
const ctxRadar = radarCanvas.getContext('2d');

document.getElementById('btn-comenzar').addEventListener('click', () => {
    pantallaInicio.classList.add('oculto');
    juegoActivo = true;
    document.body.requestPointerLock();
});

document.getElementById('btn-reiniciar').addEventListener('click', () => { location.reload(); });

window.addEventListener('keydown', (e) => {
    if (!juegoActivo) return;
    if (e.key.toLowerCase() === 'w') controles.w = true;
    if (e.key.toLowerCase() === 's') controles.s = true;
    if (e.key.toLowerCase() === 'a') controles.a = true;
    if (e.key.toLowerCase() === 'd') controles.d = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'w') controles.w = false;
    if (e.key.toLowerCase() === 's') controles.s = false;
    if (e.key.toLowerCase() === 'a') controles.a = false;
    if (e.key.toLowerCase() === 'd') controles.d = false;
});

window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body && juegoActivo) {
        jugador.anguloY -= e.movementX * 0.003;
    }
});

function init() {
    escena = new THREE.Scene();
    escena.background = new THREE.Color(0x0a0a14);
    escena.fog = new THREE.FogExp2(0x0a0a14, 0.05);

    camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderizador = new THREE.WebGLRenderer({ antialias: true });
    renderizador.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderizador.domElement);

    escena.add(new THREE.AmbientLight(0x404050, 1.5));
    let luz = new THREE.DirectionalLight(0xffffff, 0.8);
    luz.position.set(5, 10, 7);
    escena.add(luz);

    let geoSuelo = new THREE.PlaneGeometry(COLUMNAS * ESCALA, FILAS * ESCALA);
    let matSuelo = new THREE.MeshStandardMaterial({ color: 0x1a1a24 });
    let suelo = new THREE.Mesh(geoSuelo, matSuelo);
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.set((COLUMNAS * ESCALA)/2, 0, (FILAS * ESCALA)/2);
    escena.add(suelo);

    let geoPared = new THREE.BoxGeometry(ESCALA, 3.5, ESCALA);
    let matPared = new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.6 });
    for (let r = 0; r < FILAS; r++) {
        for (let c = 0; c < COLUMNAS; c++) {
            if (LABERINTO[r][c] === 1) {
                let pared = new THREE.Mesh(geoPared, matPared);
                pared.position.set(c * ESCALA + ESCALA/2, 1.75, r * ESCALA + ESCALA/2);
                escena.add(pared);
            }
        }
    }

    queso.malla = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 0.5, 6), new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0x332200 }));
    queso.malla.position.set(queso.celdaX * ESCALA + ESCALA/2, 0.4, queso.celdaZ * ESCALA + ESCALA/2);
    escena.add(queso.malla);

    gatos.forEach(gato => {
        let grupo = new THREE.Group();
        grupo.add(new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), new THREE.MeshStandardMaterial({ color: gato.color })));
        grupo.position.set(gato.celdaX * ESCALA + ESCALA/2, 0.8, gato.celdaZ * ESCALA + ESCALA/2);
        escena.add(grupo);
        gato.malla = grupo;
    });

    animate();
}

function moverJugador() {
    let dx = 0, dz = 0;
    if (controles.w) { dx += Math.sin(jugador.anguloY) * jugador.velocidad; dz += -Math.cos(jugador.anguloY) * jugador.velocidad; }
    if (controles.s) { dx -= Math.sin(jugador.anguloY) * jugador.velocidad; dz -= -Math.cos(jugador.anguloY) * jugador.velocidad; }
    if (controles.a) { dx += Math.sin(jugador.anguloY - Math.PI/2) * jugador.velocidad; dz += -Math.cos(jugador.anguloY - Math.PI/2) * jugador.velocidad; }
    if (controles.d) { dx += Math.sin(jugador.anguloY + Math.PI/2) * jugador.velocidad; dz += -Math.cos(jugador.anguloY + Math.PI/2) * jugador.velocidad; }

    if (!detectarColision(jugador.x + dx, jugador.z)) jugador.x += dx;
    if (!detectarColision(jugador.x, jugador.z + dz)) jugador.z += dz;

    camara.position.set(jugador.x * ESCALA, 1.5, jugador.z * ESCALA);
    camara.rotation.set(0, jugador.anguloY, 0, 'YXZ');
}

function detectarColision(cx, cz) {
    let buf = [-jugador.radio, jugador.radio];
    for (let x of buf) {
        for (let z of buf) {
            let sX = Math.floor(cx + x), sZ = Math.floor(cz + z);
            if (LABERINTO[sZ]?.[sX] === 1) return true;
        }
    }
    return false;
}

function ejecutarAStar(iX, iZ, fX, fZ) {
    let abierta = [];
    let cerrada = Array(FILAS).fill().map(() => Array(COLUMNAS).fill(false));
    let nodos = Array(FILAS).fill().map((_, r) => Array(COLUMNAS).fill().map((_, c) => ({ x: c, z: r, g: Infinity, f: Infinity, padre: null })));

    let inicio = nodos[iZ][iX], fin = nodos[fZ][fX];
    inicio.g = 0; inicio.f = Math.abs(iX - fX) + Math.abs(iZ - fZ);
    abierta.push(inicio);

    while (abierta.length > 0) {
        abierta.sort((a, b) => a.f - b.f);
        let actual = abierta.shift();
        cerrada[actual.z][actual.x] = true;

        if (actual.x === fin.x && actual.z === fin.z) {
            let ruta = []; let c = actual;
            while (c !== null) { ruta.push({ x: c.x, z: c.z }); c = c.padre; }
            return ruta.reverse();
        }

        let dx = [0, 0, -1, 1], dz = [-1, 1, 0, 0];
        for (let i = 0; i < 4; i++) {
            let nx = actual.x + dx[i], nz = actual.z + dz[i];
            if (LABERINTO[nz]?.[nx] === 0 && !cerrada[nz][nx]) {
                let gT = actual.g + 1;
                let v = nodos[nz][nx];
                if (gT < v.g) {
                    v.padre = actual; v.g = gT;
                    v.f = gT + Math.abs(nx - fX) + Math.abs(nz - fZ);
                    if (!abierta.includes(v)) abierta.push(v);
                }
            }
        }
    }
    return [];
}

function actualizarGatos() {
    let jX = Math.floor(jugador.x), jZ = Math.floor(jugador.z);
    gatos.forEach(gato => {
        let gX = Math.floor(gato.malla.position.x / ESCALA), gZ = Math.floor(gato.malla.position.z / ESCALA);
        gato.ruta = ejecutarAStar(gX, gZ, jX, jZ);

        if (gato.ruta.length > 1) {
            let puntoObjetivo = gato.ruta[1];
            let tX = puntoObjetivo.x * ESCALA + ESCALA/2, tZ = puntoObjetivo.z * ESCALA + ESCALA/2;
            let dX = tX - gato.malla.position.x, dZ = tZ - gato.malla.position.z;
            let dist = Math.sqrt(dX*dX + dZ*dZ);
            if (dist > 0.05) {
                gato.malla.position.x += (dX / dist) * gato.velocidad * ESCALA;
                gato.malla.position.z += (dZ / dist) * gato.velocidad * ESCALA;
            }
        }
        gato.malla.position.y = 0.8 + Math.sin(Date.now() * 0.003 + gato.color) * 0.1;

        if (Math.sqrt(Math.pow(gato.malla.position.x - jugador.x*ESCALA, 2) + Math.pow(gato.malla.position.z - jugador.z*ESCALA, 2)) < 1.2) {
            finalizarJuego(false);
        }
    });
}

function dibujarRadar() {
    ctxRadar.clearRect(0, 0, radarCanvas.width, radarCanvas.height);
    let sX = radarCanvas.width / COLUMNAS, sZ = radarCanvas.height / FILAS;

    ctxRadar.fillStyle = "rgba(255, 255, 255, 0.15)";
    for (let r = 0; r < FILAS; r++)
        for (let c = 0; c < COLUMNAS; c++)
            if (LABERINTO[r][c] === 1) ctxRadar.fillRect(c * sX, r * sZ, sX - 1, sZ - 1);

    ctxRadar.fillStyle = "#ffcc00";
    ctxRadar.fillRect(queso.celdaX * sX + 2, queso.celdaZ * sZ + 2, sX - 4, sZ - 4);

    gatos.forEach(gato => {
        ctxRadar.fillStyle = "red";
        ctxRadar.fillRect((gato.malla.position.x/ESCALA)*sX, (gato.malla.position.z/ESCALA)*sZ, 5, 5);
    });

    ctxRadar.fillStyle = "#4caf50";
    ctxRadar.beginPath(); ctxRadar.arc(jugador.x * sX, jugador.z * sZ, 4, 0, Math.PI*2); ctxRadar.fill();
}

function verificarVictoria() {
    if (Math.sqrt(Math.pow(queso.malla.position.x - jugador.x*ESCALA, 2) + Math.pow(queso.malla.position.z - jugador.z*ESCALA, 2)) < 1.5) {
        finalizarJuego(true);
    }
}

function finalizarJuego(ganado) {
 juegoActivo = false; document.exitPointerLock();
 pantallaFin.classList.remove('oculto');
 if (ganado) { textoResultado.textContent = "¡GANASTE!"; textoResultado.className = "ganaste"; subtextoResultado.textContent = "¡Burlaste las rutas de la Inteligencia Artificial y tienes el queso!"; }
 else { textoResultado.textContent = "TE ATRAPARON"; textoResultado.className = "perdiste"; subtextoResultado.textContent = "Los gatos calcularon tu posición mediante A* y te interceptaron."; }
}
function animate() {
 requestAnimationFrame(animate);
 if (juegoActivo) { moverJugador(); actualizarGatos(); verificarVictoria(); dibujarRadar(); }
 if (queso.malla) queso.malla.rotation.y += 0.02;
 renderizador.render(escena, camara);
}
init();
