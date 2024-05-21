// Declaro las variables en el alcance global
let moviesContainer, ordenSelector, busquedaInput;

// Registrar el Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('sw.js')
            .then(() => console.log("SW registrado correctamente"))
            .catch(() => console.log("SW no se pudo registrar"))
    });
}

// Cargar películas al cargar la página principal
window.addEventListener('load', () => {
    
    moviesContainer = document.getElementById("movies-container");
    ordenSelector = document.getElementById("orden");
    busquedaInput = document.getElementById("busqueda");

    // Verifica si estamos en la página principal antes de continuar
    if (moviesContainer && ordenSelector && busquedaInput) {
        // Manejador de evento para el cambio en el elemento de selección de orden
        ordenSelector.addEventListener('change', () => {
            const ordenSeleccionado = ordenSelector.value;
            const busqueda = busquedaInput.value.trim();
            cargarPeliculas(1, ordenSeleccionado, busqueda);
            cargarPeliculasProximamente();
        });

        // Manejador de evento para la entrada de texto en el campo de búsqueda
        busquedaInput.addEventListener('input', () => {
            const ordenSeleccionado = ordenSelector.value;
            const busqueda = busquedaInput.value.trim();
            cargarPeliculas(1, ordenSeleccionado, busqueda);
        });

        // Llamar a la función para cargar películas
        cargarPeliculas();
    }
});

function cargarPeliculas(pagina = 1, orden = 'popularity.desc', busqueda = '') {
    let url = `https://api.themoviedb.org/3/discover/movie?api_key=e91c47009a810141f2bf0020105973d8&language=es-AR&sort_by=${orden}&include_adult=false&include_video=false&page=${pagina}&with_genres=27,53,9648`;
    if (busqueda !== '') {
        url = `https://api.themoviedb.org/3/search/movie?api_key=e91c47009a810141f2bf0020105973d8&language=es-AR&query=${busqueda}&page=${pagina}`;
    }
    fetch(url)
        .then(response => response.json())
        .then(data => {
            let html = "";
            const totalPeliculas = data.results.length;
            for (let i = 0; i < totalPeliculas; i++) {
                const movie = data.results[i];
                html += `
                    <div class="col-12 col-md-4 mb-4 pelicula">
                        <div class="card">
                            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">
                            <div class="card-body">
                                <h5 class="card-title text-center">${movie.title}</h5>
                                <p class="card-text text-center">Lanzamiento: ${movie.release_date}</p>
                                <p class="card-text text-center">Puntuación: ${movie.vote_average}</p>
                                <div class="rating" id="ratingContainer_${i}">
                                    <span class="star">&#9733;</span>
                                    <span class="star">&#9733;</span>
                                    <span class="star">&#9733;</span>
                                    <span class="star">&#9733;</span>
                                    <span class="star">&#9733;</span>
                                </div>
                                <button class="btn btn-primary btn-ver-mas" data-movie-id="${movie.id}">Ver +</button>

                            </div>
                        </div>
                    </div>`;
            }
            moviesContainer.innerHTML = html;

            // Agregar evento de clic a cada botón "Ver +" para redirigir a la página de detalles
            document.querySelectorAll('.btn-ver-mas').forEach(btn => {
                btn.addEventListener('click', () => {
                    const movieId = btn.getAttribute('data-movie-id');
                    window.location.href = `detalles.html?id=${movieId}`;
                });
            });

            // Agregar evento de click a cada estrella de valoración
            document.querySelectorAll('.rating').forEach((ratingContainer, index) => {
                ratingContainer.querySelectorAll('.star').forEach((star, starIndex) => {
                    star.addEventListener('click', () => {
                        const rating = starIndex + 1; // La calificación va desde 1 hasta 5
                        // Guardar la calificación en localStorage
                        localStorage.setItem(`rating_${index}`, rating);
                        // Pintar las estrellas según la calificación seleccionada
                        pintarEstrellas(`ratingContainer_${index}`, rating);
                    });
                });
            });

            // Cargar la calificación desde el localStorage
            cargarCalificacion();
        })
        .catch(error => console.error("Error al obtener datos de la API:", error));
}

// Función para pintar las estrellas según la calificación guardada en localStorage
function pintarEstrellas(ratingContainerId, calificacion) {
    const ratingContainer = document.getElementById(ratingContainerId);
    if (!ratingContainer) return; 
    ratingContainer.querySelectorAll('.star').forEach((star, index) => {
        if (index < calificacion) {
            star.style.color = '#ffcc00';
        } else {
            star.style.color = '#000'; 
        }
    });
}

// Función para cargar la calificación desde el localStorage y pintar las estrellas correspondientes
function cargarCalificacion() {
    document.querySelectorAll('.rating').forEach(ratingContainer => {
        const ratingContainerId = ratingContainer.id;
        const calificacion = localStorage.getItem(ratingContainerId);
        if (calificacion) {
            pintarEstrellas(ratingContainerId, calificacion);
        }
    });
}

/*boton para subir*/
function subirArriba() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}


// Función para cargar los detalles de la película en la página de detalles
function cargarDetallesPelicula(movieId) {
    // URL de la API para obtener los detalles de la película
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=e91c47009a810141f2bf0020105973d8&language=es-AR`;
    
    // Realizar la solicitud a la API
    fetch(url)
        .then(response => response.json())
        .then(movieDetails => {
            // Construir el HTML para mostrar los detalles de la película
            const html = `
                <div class="container-detalle">
                    <div class="row">
                        <div class="col-md-4">
                            <img src="https://image.tmdb.org/t/p/w500${movieDetails.poster_path}" alt="${movieDetails.title}" class="img-fluid">
                        </div>
                        <div class="col-md-8">
                            <h2>${movieDetails.title}</h2>
                            <p><strong>Año de Lanzamiento:</strong> ${movieDetails.release_date}</p>
                            <p><strong>Puntuación:</strong> ${movieDetails.vote_average}</p>
                            <p>${movieDetails.overview}</p>
                            

                            <a href="index.html" class="btn btn-primary btn-volver-inicio">Volver a Inicio</a>

  
                        </div>
                    </div>
                </div>
            `;

            // Insertar el HTML en el contenedor
            document.getElementById("detalle-pelicula").innerHTML = html;
        })
        .catch(error => console.error("Error al cargar los detalles de la película:", error));
}

// OTRO -Función para cargar las películas de estreno //
function cargarPeliculasEstreno() {
    const moviesEstrenoContainer = document.getElementById("movies-estreno");
    if (!moviesEstrenoContainer) return;
  
    // Obtener los datos de las películas de estreno desde el archivo JSON
    fetch('productos.json')
      .then(response => response.json())
      .then(data => {
        let html = "";
        // Iterar sobre cada película en los datos
        data.forEach(movie => {
          // Construir el HTML para cada película
          html += `
            <div class="pelicula text-center">
              <img src="${movie.imagen}" alt="${movie.nombre}">
              <h2 class="text-center">${movie.nombre}</h2>
              <p class="text-center">Lanzamiento: ${movie.estreno}</p>
            </div>`;
        });
        // Insertar el HTML en el contenedor de películas de estreno
        moviesEstrenoContainer.innerHTML = html;
      })
      .catch(error => console.error("Error al cargar las películas de estreno:", error));
}

// Llamar a la función para cargar las películas de estreno al cargar la página
window.addEventListener('load', cargarPeliculasEstreno);
