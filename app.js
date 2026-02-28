// --- CONFIGURACIÓN DE NOTICIAS ---
const MI_API_KEY = "pub_d412eb3a054d41198547159aced6da3e"; 

async function cargarNoticias() {
    const contenedor = document.getElementById('news-container');
    try {
        const respuesta = await fetch(`https://newsdata.io/api/1/news?apikey=${MI_API_KEY}&q=automovilismo&language=es`);
        const datos = await respuesta.json();
        contenedor.innerHTML = ""; 
        const titulosVistos = new Set();

        datos.results.forEach(noticia => {
            if (!titulosVistos.has(noticia.title)) {
                titulosVistos.add(noticia.title);
                const card = document.createElement('div');
                card.className = "news-card";
                card.innerHTML = `
                    <img src="${noticia.image_url || 'https://via.placeholder.com/400x200?text=AutoWorld'}" alt="Noticia">
                    <div class="news-content">
                        <h3>${noticia.title}</h3>
                        <p>${noticia.description ? noticia.description.substring(0, 80) : "Noticia de automovilismo de última hora..."}...</p>
                        <a href="${noticia.link}" target="_blank">LEER MÁS →</a>
                    </div>
                `;
                contenedor.appendChild(card);
            }
        });
    } catch (error) {
        contenedor.innerHTML = "Error al cargar noticias en vivo.";
    }
}

// --- REPRODUCTOR DE MÚSICA ---
let canciones = [
    { titulo: "In Da Club", url: "In Da Club.mp3" },
    { titulo: "Ooh Ahh (My Life Be Like)", url: "Ooh Ahh (My Life Be Like) (feat. Tobymac).mp3" },
    { titulo: "Pump It Up", url: "Pump It Up.mp3" },
    { titulo: "See You Again", url: "See You Again (feat. Charlie Puth).mp3" },
    { titulo: "Six Days (Remix)", url: "Six Days (Remix).mp3" },
    { titulo: "Tokyo Drift", url: "Tokyo Drift (Fast & Furious) (From The Fast And The Furious_ Tokyo Drift Soundtrack).mp3" },
    { titulo: "You Know How We Do It", url: "You Know How We Do It.mp3" }
];

let indice = 0;
let audio = new Audio(canciones[indice].url);

function vincularEventosAudio() {
    audio.addEventListener('timeupdate', () => {
        const progressBar = document.getElementById('progress-bar');
        if (audio.duration) {
            progressBar.value = (audio.currentTime / audio.duration) * 100;
            document.getElementById('current-time').innerText = formatTime(audio.currentTime);
            document.getElementById('duration-time').innerText = formatTime(audio.duration);
        }
    });
    audio.addEventListener('ended', () => changeSong(1));
}

function playMusic() {
    const btn = document.getElementById('btn-play');
    if (audio.paused) {
        audio.play();
        btn.innerText = "⏸";
        document.getElementById('song-title').innerText = canciones[indice].titulo;
    } else {
        audio.pause();
        btn.innerText = "▶";
    }
}

function changeSong(delta) {
    audio.pause();
    indice = (indice + delta + canciones.length) % canciones.length;
    audio = new Audio(canciones[indice].url);
    vincularEventosAudio();
    playMusic();
}

function changeVolume(amount) {
    let newVol = Math.min(1, Math.max(0, audio.volume + amount));
    audio.volume = newVol;
    document.getElementById('volume').value = newVol;
}

function actualizarVolumenDirecto(val) {
    audio.volume = val;
}

function seekSong() {
    const progressBar = document.getElementById('progress-bar');
    audio.currentTime = audio.duration * (progressBar.value / 100);
}

function formatTime(s) {
    let min = Math.floor(s / 60);
    let sec = Math.floor(s % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

// --- DIBUJO ---
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
let painting = false;
let color = "#e74c3c";

ctx.lineCap = 'round';
ctx.lineJoin = 'round';

canvas.addEventListener('mousedown', (e) => { painting = true; draw(e); });
canvas.addEventListener('mouseup', () => { painting = false; ctx.beginPath(); });
canvas.addEventListener('mousemove', draw);

function draw(e) {
    if (!painting) return;
    ctx.lineWidth = document.getElementById('brushSize').value;
    ctx.strokeStyle = color;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function setTool(tool) {
    color = (tool === 'eraser') ? "#ffffff" : document.getElementById('colorPicker').value;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// --- THREE.JS 3D ---
let scene, camera, renderer, carMesh;

function convertTo3D() {
    const container = document.getElementById('container3d');
    container.innerHTML = "";
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 500 / 300, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth || 500, 300);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7).normalize();
    scene.add(light);

    const texture = new THREE.CanvasTexture(canvas);
    const loader = new THREE.GLTFLoader();
    
    loader.load('https://threejs.org/examples/models/gltf/Ferrari.glb', function(gltf) {
        carMesh = gltf.scene;
        carMesh.traverse((node) => {
            if (node.isMesh) {
                node.material.map = texture;
                node.material.needsUpdate = true;
            }
        });
        carMesh.scale.set(1.5, 1.5, 1.5);
        scene.add(carMesh);
        animate();
    });
    camera.position.set(0, 2, 5);
}

function animate() {
    requestAnimationFrame(animate);
    if(carMesh) carMesh.rotation.y += 0.01;
    renderer.render(scene, camera);
}

window.onload = () => {
    cargarNoticias();
    vincularEventosAudio();
};
