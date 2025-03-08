// Funciones para interactuar con la API
const API_URL = '/api';

// Función para descargar un video
async function downloadVideo(url, quality = 'best') {
    try {
        const response = await fetch(`${API_URL}/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, quality }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al descargar el video:', error);
        throw error;
    }
}

// Función para obtener el historial de descargas
async function getHistory() {
    try {
        const response = await fetch(`${API_URL}/history`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener el historial:', error);
        throw error;
    }
}

// Función para eliminar un video del historial
async function deleteFromHistory(filename) {
    try {
        const response = await fetch(`${API_URL}/history/${filename}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al eliminar del historial:', error);
        throw error;
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Función para obtener el ícono de la plataforma
function getPlatformIcon(platform) {
    switch (platform?.toLowerCase()) {
        case 'instagram':
            return '<i class="fab fa-instagram"></i>';
        case 'facebook':
            return '<i class="fab fa-facebook"></i>';
        case 'tiktok':
            return '<i class="fab fa-tiktok"></i>';
        default:
            return '<i class="fas fa-download"></i>';
    }
}

// Función para formatear la duración
function formatDuration(seconds) {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Función para crear la tarjeta de video
function createVideoCard(video) {
    return `
        <div class="video-card">
            <div class="video-thumbnail">
                <img src="${video.thumbnail || 'https://via.placeholder.com/400x400?text=Video'}" alt="${video.title || 'Video'}">
            </div>
            <div class="video-info">
                <div class="video-header">
                    <div class="video-platform">
                        <span class="platform-badge">${getPlatformIcon(video.platform)} ${video.platform || 'Video'}</span>
                        <span class="video-date">${video.date || ''}</span>
                    </div>
                    ${video.platform === 'history' ? `<button class="delete-btn" data-filename="${video.filename}"><i class="fas fa-trash"></i></button>` : ''}
                </div>
                <h3 class="video-title">${video.title || 'Video descargado'}</h3>
                ${video.description ? `<p class="video-description">${video.description.length > 100 ? video.description.substring(0, 100) + '...' : video.description}</p>` : ''}
                <div class="video-meta">
                    <div class="video-details">
                        <p><strong>Tamaño:</strong> ${video.file_size || 'Desconocido'}</p>
                        ${video.duration ? `<p><strong>Duración:</strong> ${formatDuration(video.duration)}</p>` : ''}
                    </div>
                    <div class="video-actions">
                        <a href="${video.download_url}" target="_blank" class="btn btn-outline"><i class="fas fa-play"></i> Ver</a>
                        <a href="${video.download_url}" download class="btn btn-primary"><i class="fas fa-download"></i> Descargar</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Función para manejar el envío del formulario
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const urlInput = document.getElementById('video-url');
    const qualitySelect = document.getElementById('video-quality');
    const submitBtn = document.getElementById('submit-btn');
    const resultSection = document.getElementById('result-section');
    
    const url = urlInput.value.trim();
    const quality = qualitySelect.value;
    
    if (!url) {
        showNotification('Por favor, ingresa una URL válida', 'error');
        return;
    }
    
    // Validar que la URL sea de una plataforma soportada
    const supportedPlatforms = ['instagram.com', 'tiktok.com', 'facebook.com', 'fb.com', 'fb.watch'];
    const isSupported = supportedPlatforms.some(platform => url.includes(platform));
    
    if (!isSupported) {
        showNotification('URL no soportada. Por favor, ingresa una URL de Instagram, TikTok o Facebook', 'error');
        return;
    }
    
    // Mostrar estado de carga
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Descargando...';
    
    try {
        const result = await downloadVideo(url, quality);
        
        if (result.success) {
            showNotification('¡Video descargado exitosamente!');
            urlInput.value = '';
            
            // Mostrar resultado
            resultSection.innerHTML = `
                <h2>Video Descargado</h2>
                ${createVideoCard(result)}
            `;
            resultSection.style.display = 'block';
            
            // Desplazar a la sección de resultados
            resultSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            showNotification(result.message || 'Error al descargar el video', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al conectar con el servidor. Por favor, inténtalo de nuevo más tarde.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-download"></i> Descargar Video';
    }
}

// Función para cargar el historial
async function loadHistory() {
    const historySection = document.getElementById('history-section');
    
    if (!historySection) return;
    
    try {
        const history = await getHistory();
        
        if (history.length === 0) {
            historySection.innerHTML = `
                <div class="empty-history">
                    <h3>No hay videos en el historial</h3>
                    <p>Los videos que descargues aparecerán aquí para que puedas acceder a ellos fácilmente.</p>
                </div>
            `;
        } else {
            const historyHTML = history.map(video => {
                video.platform = 'history';
                return createVideoCard(video);
            }).join('');
            
            historySection.innerHTML = historyHTML;
            
            // Agregar event listeners a los botones de eliminar
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const filename = btn.dataset.filename;
                    
                    if (confirm('¿Estás seguro de que deseas eliminar este video del historial? Esta acción no se puede deshacer.')) {
                        try {
                            await deleteFromHistory(filename);
                            showNotification('Video eliminado del historial');
                            loadHistory(); // Recargar historial
                        } catch (error) {
                            showNotification('Error al eliminar el video', 'error');
                        }
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error al cargar el historial:', error);
        historySection.innerHTML = `
            <div class="error-message">
                <p>Error al cargar el historial. Por favor, inténtalo de nuevo más tarde.</p>
            </div>
        `;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Configurar el formulario
    const form = document.getElementById('download-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Cargar historial si estamos en la página de historial
    if (window.location.pathname === '/history') {
        loadHistory();
    }
    
    // Manejar navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('/')) {
                e.preventDefault();
                window.location.href = link.getAttribute('href');
            }
        });
    });
}); 