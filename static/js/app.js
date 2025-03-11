/**
 * Descargador de Videos - Funciones JavaScript
 */

// Variables globales
const API_BASE_URL = window.location.origin;
let currentVideo = null;

/**
 * Función para descargar un video
 * @param {string} url - URL del video a descargar
 * @param {string} quality - Calidad del video (best, medium, worst)
 * @returns {Promise} - Promesa con el resultado de la descarga
 */
async function downloadVideo(url, quality = 'best') {
    try {
        showNotification('Iniciando descarga...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/api/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, quality }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al descargar el video');
        }
        
        if (!data.success) {
            throw new Error(data.message || 'Error al procesar el video');
        }
        
        showNotification('Video descargado correctamente', 'success');
        return data;
    } catch (error) {
        console.error('Error al descargar el video:', error);
        showNotification(`Error: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * Función para obtener el historial de descargas
 * @returns {Promise} - Promesa con el historial de descargas
 */
async function getHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/history`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al obtener el historial');
        }
        
        return data;
    } catch (error) {
        console.error('Error al obtener el historial:', error);
        showNotification(`Error: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * Función para eliminar un video del historial
 * @param {string} filename - Nombre del archivo a eliminar
 * @returns {Promise} - Promesa con el resultado de la eliminación
 */
async function deleteFromHistory(filename) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/history/${filename}`, {
            method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al eliminar el video');
        }
        
        showNotification('Video eliminado del historial', 'success');
        return data;
    } catch (error) {
        console.error('Error al eliminar el video:', error);
        showNotification(`Error: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * Función para mostrar notificaciones
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 */
function showNotification(message, type = 'success') {
    // Crear elemento de notificación si no existe
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Limpiar clases anteriores
    notification.className = 'notification';
    notification.classList.add(type);
    
    // Establecer icono según el tipo
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        case 'info':
            icon = '<i class="fas fa-info-circle"></i>';
            break;
    }
    
    // Establecer contenido
    notification.innerHTML = `${icon} ${message}`;
    
    // Mostrar notificación
    notification.classList.add('show');
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Función para obtener el icono de la plataforma
 * @param {string} platform - Nombre de la plataforma
 * @returns {string} - Clase de FontAwesome para el icono
 */
function getPlatformIcon(platform) {
    switch (platform.toLowerCase()) {
        case 'instagram':
            return 'fab fa-instagram';
        case 'tiktok':
            return 'fab fa-tiktok';
        case 'facebook':
            return 'fab fa-facebook';
        case 'youtube':
            return 'fab fa-youtube';
        default:
            return 'fas fa-video';
    }
}

/**
 * Función para formatear la duración en segundos a formato mm:ss
 * @param {number} seconds - Duración en segundos
 * @returns {string} - Duración formateada
 */
function formatDuration(seconds) {
    if (!seconds) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Función para crear una tarjeta de video
 * @param {Object} video - Datos del video
 * @returns {HTMLElement} - Elemento HTML con la tarjeta del video
 */
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    const platformIcon = getPlatformIcon(video.platform);
    const duration = formatDuration(video.duration);
    const date = new Date(video.timestamp * 1000).toLocaleDateString();
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail || '/static/img/placeholder.jpg'}" alt="${video.title}" onerror="this.src='/static/img/placeholder.jpg'">
        </div>
        <div class="video-info">
            <div class="video-header">
                <span class="platform-badge">
                    <i class="${platformIcon}"></i> ${video.platform}
                </span>
                <span class="video-date">${date}</span>
                <button class="delete-btn" data-filename="${video.filename}" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <h3 class="video-title">${video.title || 'Video sin título'}</h3>
            <p class="video-description">${video.description || 'Sin descripción'}</p>
            <div class="video-meta">
                <div class="video-details">
                    <p><i class="fas fa-clock"></i> ${duration}</p>
                    <p><i class="fas fa-film"></i> ${video.resolution || 'Desconocida'}</p>
                    <p><i class="fas fa-file"></i> ${(video.filesize / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <div class="video-actions">
                    <a href="${API_BASE_URL}/api/download/file/${video.filename}" class="btn btn-primary" download>
                        <i class="fas fa-download"></i> Descargar
                    </a>
                    <button class="btn btn-outline share-btn" data-url="${video.url}" data-title="${video.title}">
                        <i class="fas fa-share-alt"></i> Compartir
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Agregar evento para eliminar el video
    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async function() {
            if (confirm('¿Estás seguro de que deseas eliminar este video del historial?')) {
                try {
                    const filename = this.getAttribute('data-filename');
                    await deleteFromHistory(filename);
                    card.remove();
                    
                    // Verificar si no hay más videos
                    const historySection = document.getElementById('history-section');
                    if (historySection && historySection.querySelectorAll('.video-card').length === 0) {
                        showEmptyHistory();
                    }
                } catch (error) {
                    console.error('Error al eliminar el video:', error);
                }
            }
        });
    }
    
    // Agregar evento para compartir el video
    const shareBtn = card.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            const title = this.getAttribute('data-title');
            shareVideo(url, title);
        });
    }
    
    return card;
}

/**
 * Función para manejar el envío del formulario de descarga
 * @param {Event} event - Evento de envío del formulario
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const urlInput = document.getElementById('video-url');
    const qualitySelect = document.getElementById('video-quality');
    const submitBtn = document.getElementById('submit-btn');
    const resultSection = document.getElementById('result-section');
    
    if (!urlInput || !qualitySelect || !submitBtn || !resultSection) {
        console.error('Elementos del formulario no encontrados');
        return;
    }
    
    const url = urlInput.value.trim();
    const quality = qualitySelect.value;
    
    if (!url) {
        showNotification('Por favor, ingresa la URL del video', 'warning');
        urlInput.focus();
        return;
    }
    
    // Validar URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        showNotification('La URL debe comenzar con http:// o https://', 'warning');
        urlInput.focus();
        return;
    }
    
    // Deshabilitar botón y mostrar spinner
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Descargando...';
    
    // Limpiar sección de resultados
    resultSection.innerHTML = '';
    resultSection.classList.remove('d-none');
    
    try {
        // Mostrar spinner en la sección de resultados
        resultSection.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="min-height: 200px;">
                <div class="spinner">
                    <i class="fas fa-spinner fa-spin fa-3x"></i>
                </div>
                <p class="ml-3">Descargando video...</p>
            </div>
        `;
        
        // Descargar video
        const videoData = await downloadVideo(url, quality);
        
        // Mostrar resultado
        if (videoData.success) {
            currentVideo = videoData;
            showVideoResult(videoData);
        } else {
            showErrorResult(videoData.message || 'Error al descargar el video');
        }
    } catch (error) {
        console.error('Error al descargar el video:', error);
        showErrorResult(error.message);
    } finally {
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-download"></i> Descargar Video';
    }
}

/**
 * Función para cargar el historial de descargas
 */
async function loadHistory() {
    const historySection = document.getElementById('history-section');
    
    if (!historySection) {
        console.error('Sección de historial no encontrada');
        return;
    }
    
    try {
        // Mostrar spinner
        historySection.innerHTML = `
            <div class="d-flex justify-content-center">
                <div class="spinner">
                    <i class="fas fa-spinner fa-spin fa-3x"></i>
                </div>
            </div>
        `;
        
        // Obtener historial
        const history = await getHistory();
        
        // Limpiar sección
        historySection.innerHTML = '';
        
        if (history.length === 0) {
            showEmptyHistory();
            return;
        }
        
        // Ordenar por fecha (más reciente primero)
        history.sort((a, b) => b.timestamp - a.timestamp);
        
        // Crear tarjetas de video
        history.forEach(video => {
            const card = createVideoCard(video);
            historySection.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar el historial:', error);
        historySection.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error al cargar el historial: ${error.message}</p>
                <button class="btn btn-primary" onclick="loadHistory()">
                    <i class="fas fa-sync"></i> Reintentar
                </button>
            </div>
        `;
    }
}

/**
 * Función para mostrar el mensaje de historial vacío
 */
function showEmptyHistory() {
    const historySection = document.getElementById('history-section');
    
    if (!historySection) {
        console.error('Sección de historial no encontrada');
        return;
    }
    
    historySection.innerHTML = `
        <div class="empty-history">
            <i class="fas fa-history fa-4x" style="color: var(--gray-400); margin-bottom: 1rem;"></i>
            <h3>No hay descargas en tu historial</h3>
            <p>Los videos que descargues aparecerán aquí para que puedas acceder a ellos fácilmente.</p>
            <a href="/" class="btn btn-primary">
                <i class="fas fa-download"></i> Descargar videos
            </a>
        </div>
    `;
}

/**
 * Función para configurar el formulario de descarga
 */
function setupDownloadForm() {
    const downloadForm = document.getElementById('download-form');
    
    if (downloadForm) {
        downloadForm.addEventListener('submit', handleFormSubmit);
    }
}

/**
 * Función para mostrar el resultado de la descarga
 * @param {Object} videoData - Datos del video descargado
 */
function showVideoResult(videoData) {
    const resultSection = document.getElementById('result-section');
    
    if (!resultSection) {
        console.error('Sección de resultados no encontrada');
        return;
    }
    
    const platformIcon = getPlatformIcon(videoData.platform);
    const duration = formatDuration(videoData.duration);
    
    resultSection.innerHTML = `
        <div class="video-card">
            <div class="video-thumbnail">
                <img src="${videoData.thumbnail || '/static/img/placeholder.jpg'}" alt="${videoData.title}" onerror="this.src='/static/img/placeholder.jpg'">
            </div>
            <div class="video-info">
                <div class="video-header">
                    <span class="platform-badge">
                        <i class="${platformIcon}"></i> ${videoData.platform}
                    </span>
                </div>
                <h3 class="video-title">${videoData.title || 'Video sin título'}</h3>
                <p class="video-description">${videoData.description || 'Sin descripción'}</p>
                <div class="video-meta">
                    <div class="video-details">
                        <p><i class="fas fa-clock"></i> ${duration}</p>
                        <p><i class="fas fa-film"></i> ${videoData.resolution || 'Desconocida'}</p>
                        <p><i class="fas fa-file"></i> ${(videoData.filesize / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <div class="video-actions">
                        <a href="${API_BASE_URL}/api/download/file/${videoData.filename}" class="btn btn-primary" download>
                            <i class="fas fa-download"></i> Descargar
                        </a>
                        <button class="btn btn-outline share-btn" data-url="${videoData.url}" data-title="${videoData.title}">
                            <i class="fas fa-share-alt"></i> Compartir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Agregar evento para compartir el video
    const shareBtn = resultSection.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            const title = this.getAttribute('data-title');
            shareVideo(url, title);
        });
    }
}

/**
 * Función para mostrar un error en la sección de resultados
 * @param {string} message - Mensaje de error
 */
function showErrorResult(message) {
    const resultSection = document.getElementById('result-section');
    
    if (!resultSection) {
        console.error('Sección de resultados no encontrada');
        return;
    }
    
    resultSection.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="error-message">
                    <i class="fas fa-exclamation-circle fa-3x" style="margin-bottom: 1rem;"></i>
                    <h3>Error al descargar el video</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="retryDownload()">
                        <i class="fas fa-sync"></i> Reintentar
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Función para reintentar la descarga
 */
function retryDownload() {
    const urlInput = document.getElementById('video-url');
    const submitBtn = document.getElementById('submit-btn');
    
    if (urlInput && submitBtn) {
        urlInput.focus();
        submitBtn.click();
    }
}

/**
 * Función para compartir un video
 * @param {string} url - URL del video
 * @param {string} title - Título del video
 */
function shareVideo(url, title) {
    if (navigator.share) {
        navigator.share({
            title: title || 'Video compartido',
            text: 'Mira este video que encontré',
            url: url
        })
        .then(() => console.log('Video compartido exitosamente'))
        .catch(error => console.error('Error al compartir:', error));
    } else {
        // Fallback para navegadores que no soportan Web Share API
        const tempInput = document.createElement('input');
        document.body.appendChild(tempInput);
        tempInput.value = url;
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        showNotification('URL copiada al portapapeles', 'success');
    }
}

/**
 * Función para formatear la fecha
 * @param {number} timestamp - Timestamp en segundos
 * @returns {string} - Fecha formateada
 */
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
}

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    // Configurar el menú móvil
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navbarNav = document.getElementById('navbar-nav');
    
    if (mobileMenuBtn && navbarNav) {
        mobileMenuBtn.addEventListener('click', function() {
            navbarNav.classList.toggle('show');
        });
    }
    
    // Actualizar año en el footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        const year = new Date().getFullYear();
        currentYearElement.textContent = year;
    }
    
    // Configurar formulario de descarga en la página principal
    const downloadForm = document.getElementById('download-form');
    if (downloadForm) {
        setupDownloadForm();
    }
    
    // Cargar historial en la página de historial
    const historySection = document.getElementById('history-section');
    if (historySection) {
        loadHistory();
    }
    
    // Configurar elementos FAQ
    const faqItems = document.querySelectorAll('.faq-question');
    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            const faqItem = this.parentElement;
            faqItem.classList.toggle('active');
        });
    });
    
    // Configurar formulario de pago
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulación de procesamiento de pago
            const submitBtn = document.getElementById('submit-payment');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
                
                setTimeout(() => {
                    // Mostrar modal de éxito
                    const modal = document.getElementById('payment-success-modal');
                    if (modal) {
                        modal.style.display = 'flex';
                    }
                    
                    // Restaurar botón
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-lock"></i> Pagar $4.99';
                }, 2000);
            }
        });
    }
});

/**
 * Función para cerrar el modal
 */
function closeModal() {
    const modal = document.getElementById('payment-success-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Función para seleccionar el método de pago
 * @param {HTMLElement} element - Elemento del método de pago
 */
function selectPaymentMethod(element) {
    // Remover clase active de todos los métodos
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('active');
    });
    
    // Agregar clase active al método seleccionado
    element.classList.add('active');
    
    // Mostrar/ocultar campos según el método seleccionado
    const method = element.getAttribute('data-method');
    if (method === 'card') {
        document.getElementById('card-payment-fields').style.display = 'block';
        document.getElementById('paypal-payment-fields').style.display = 'none';
    } else if (method === 'paypal') {
        document.getElementById('card-payment-fields').style.display = 'none';
        document.getElementById('paypal-payment-fields').style.display = 'block';
    }
}

/**
 * Función para alternar elementos FAQ
 * @param {HTMLElement} element - Elemento de la pregunta
 */
function toggleFaq(element) {
    const faqItem = element.parentElement;
    faqItem.classList.toggle('active');
} 