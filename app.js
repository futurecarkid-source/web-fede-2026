// --- CONFIGURACIÓN DE NOTICIAS (PEGA AQUÍ TU LLAVE) ---
const MI_API_KEY = "pub_d412eb3a054d41198547159aced6da3e"; 

async function cargarNoticias() {
    const contenedor = document.getElementById('news-container');
    try {
        // Buscamos noticias sobre "Formula 1" y "Nuevos Autos"
        const respuesta = await fetch(`https://newsdata.io/api/1/news?apikey=${MI_API_KEY}&q=automovilismo&language=es`);
        const datos = await respuesta.json();
        
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
    { titulo: "Phonk Drift", url: "musica/pista1.mp3" },
    { titulo: "Night Ride", url: "musica/pista2.mp3" }
];
let indice = 0;
let reproductor = new Audio(canciones[indice].url);

function playMusic() {
    if (reproductor.paused) {
        reproductor.play();
        document.getElementById('song-title').innerText = "Reproduciendo: " + canciones[indice].titulo;
    } else {
        reproductor.pause();
    }
}

function changeSong(delta) {
    indice = (indice + delta + canciones.length) % canciones.length;
    reproductor.src = canciones[indice].url;
    playMusic();
}

// --- LÓGICA DE DIBUJO (Sencilla) ---
const canvas = document.getElementById('canvasDibujo');
const ctx = canvas.getContext('2d');
let pintando = false;

function iniciarDibujo() {
    canvas.width = 400;
    canvas.height = 250;
    canvas.addEventListener('mousedown', () => pintando = true);
    canvas.addEventListener('mouseup', () => pintando = false);
    canvas.addEventListener('mousemove', (e) => {
        if (!pintando) return;
        ctx.fillStyle = "black";
        ctx.fillRect(e.offsetX, e.offsetY, 5, 5);
    });
}

function borrar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}