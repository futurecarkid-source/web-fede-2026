// --- CONFIGURACIÓN DE NOTICIAS (PEGA AQUÍ TU LLAVE) ---
const MI_API_KEY = "pub_d412eb3a054d41198547159aced6da3e"; 

async function cargarNoticias() {
    const contenedor = document.getElementById('news-container');
    try {
        // Buscamos noticias sobre "Formula 1" y "Nuevos Autos"
        const respuesta = await fetch(`https://newsdata.io/api/1/news?apikey=${MI_API_KEY}&q=automovilismo&language=es`);
        const datos = await respuesta.json();
        const newsData = [
    { id: 1, titulo: "Lanzamiento del nuevo Ferrari 2026", desc: "La ingeniería italiana sorprende con un motor híbrido revolucionario.", img: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=500" },
    { id: 2, titulo: "Calendario F1: Próximas Carreras", desc: "Revisa las fechas clave para el Gran Premio de esta temporada.", img: "https://images.unsplash.com/photo-1541890289-b86df5bafd81?w=500" },
    { id: 1, titulo: "Lanzamiento del nuevo Ferrari 2026", desc: "Repetida", img: "" }, // Esta será ignorada
    // Agrega más noticias aquí...
];

function renderNews() {
    const container = document.getElementById('news-container');
    container.innerHTML = ""; // Limpia el "Cargando..."
    
    const uniqueNews = [];
    const titlesSeen = new Set();

    // Filtramos para que no haya títulos repetidos
    newsData.forEach(news => {
        if (!titlesSeen.has(news.titulo)) {
            titlesSeen.add(news.titulo);
            uniqueNews.push(news);
        }
    });

    // Creamos las tarjetas modernas
    uniqueNews.forEach(news => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <img src="${news.img}" alt="Noticia">
            <div class="news-content">
                <h3>${news.titulo}</h3>
                <p>${news.desc}</p>
                <button class="btn-read">Leer más</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Ejecutar al cargar la página
window.onload = () => {
    renderNews();
    // Aquí puedes llamar también a tus otras funciones iniciales
};
        contenedor.innerHTML = ""; // Limpiamos el texto de "Cargando..."

        datos.results.forEach(noticia => {
            const card = document.createElement('div');
            card.className = "news-card";
            card.innerHTML = `
                <img src="${noticia.image_url || 'https://via.placeholder.com/300x150'}" alt="Noticia">
                <h3>${noticia.title}</h3>
                <p>${noticia.description ? noticia.description.substring(0, 100) : "Haz clic para leer más..."}...</p>
                <a href="${noticia.link}" target="_blank">Leer más</a>
            `;
            contenedor.appendChild(card);
        });
    } catch (error) {
        contenedor.innerHTML = "Error al conectar con la IA de noticias.";
    }
}

// Ejecutar al cargar la web
window.onload = () => {
    cargarNoticias();
    iniciarDibujo();
};

// --- LÓGICA DEL REPRODUCTOR ELEGANTE ---
let canciones = [
    { titulo: "In Da Club", url: "In Da Club.mp3" },
    { titulo: "Ooh Ahh (My Life Be Like)", url: "Ooh Ahh (My Life Be Like) (feat. Tobymac).mp3" },
    { titulo: "Pump It Up", url: "Pump It Up.mp3" },
    { titulo: "See You Again (feat. Charlie Puth)", url: "See You Again (feat. Charlie Puth).mp3" },
    { titulo: "Six Days (Remix)", url: "Six Days (Remix).mp3" },
    { titulo: "Tokyo Drift (Fast & Furious)", url: "Tokyo Drift (Fast & Furious) (From The Fast And The Furious_ Tokyo Drift Soundtrack).mp3" },
    { titulo: "You Know How We Do It", url: "You Know How We Do It.mp3" }
];
let currentTrack = 0;
// Cargamos la URL del primer objeto
let audio = new Audio(canciones[currentTrack].url);

function playMusic() {
    if (reproductor.paused) {
        reproductor.play();
        document.getElementById('song-title').innerText = "" + canciones[indice].titulo;
    } else {
        reproductor.pause();
    }
}

function changeVolume(amount) {
    // Calculamos el nuevo volumen sumando o restando 0.1 (10%)
    let newVolume = audio.volume + amount;

    // Validamos que se mantenga entre 0 y 1
    if (newVolume >= 0 && newVolume <= 1) {
        audio.volume = newVolume;
        
        // Esto actualiza la barrita visual (slider) para que coincida
        document.getElementById('volume').value = newVolume;
        
        console.log("Volumen actual: " + Math.round(newVolume * 100) + "%");
    }
}

function changeSong(delta) {
    indice = (indice + delta + canciones.length) % canciones.length;
    reproductor.src = canciones[indice].url;
    playMusic();
}

// Referencias a los nuevos elementos
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationTimeEl = document.getElementById('duration-time');

// Función para convertir segundos en formato 0:00
function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    if (sec < 10) sec = `0${sec}`;
    return `${min}:${sec}`;
}

// Actualizar la barra y los números mientras suena la música
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        // Calcular porcentaje para la barra
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progressPercent;

        // Actualizar los textos de tiempo
        currentTimeEl.innerText = formatTime(audio.currentTime);
        durationTimeEl.innerText = formatTime(audio.duration);
    }
});

// Función para saltar a una parte de la canción al mover la barra
function seekSong() {
    const seekTo = audio.duration * (progressBar.value / 100);
    audio.currentTime = seekTo;
}

// --- LÓGICA DE DIBUJO (Sencilla) ---
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
let painting = false;
let color = "#e74c3c";
let size = 5;

// Configuración inicial del trazo tipo iOS (Suave)
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// Eventos de Dibujo
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', finishedPosition);
canvas.addEventListener('mousemove', draw);

function startPosition(e) {
    painting = true;
    draw(e);
}

function finishedPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;
    
    ctx.lineWidth = document.getElementById('brushSize').value;
    ctx.strokeStyle = color;

    // Ajuste de coordenadas para el canvas
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function setTool(tool) {
    color = (tool === 'eraser') ? "#ffffff" : document.getElementById('colorPicker').value;
}

// --- CONEXIÓN A 3D ---
let scene, camera, renderer, carMesh;

function convertTo3D() {
    // Limpiar el contenedor antes de renderizar
    document.getElementById('container3d').innerHTML = "";
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 500 / 300, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(500, 300);
    document.getElementById('container3d').appendChild(renderer.domElement);

    // Luces para que el coche brille
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);

    // Tu dibujo del canvas como textura
    const drawingTexture = new THREE.CanvasTexture(canvas);

    // Cargar el modelo real
    const loader = new THREE.GLTFLoader();
    loader.load('https://threejs.org/examples/models/gltf/Ferrari.glb', function(gltf) {
        carMesh = gltf.scene;
        
        // Aplicar tu diseño a la pintura del coche
        carMesh.traverse((node) => {
            if (node.isMesh) {
                node.material.map = drawingTexture;
                node.material.needsUpdate = true;
            }
        });

        carMesh.scale.set(1.5, 1.5, 1.5);
        scene.add(carMesh);
        animate3D();
    });

    camera.position.set(0, 2, 5);
}

function animate3D() {
    requestAnimationFrame(animate3D);
    carMesh.rotation.y += 0.01; // El coche gira para mostrar tu diseño
    renderer.render(scene, camera);
}
function borrar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

}



