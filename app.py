from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import os
import time
import json
import datetime
from downloaders import download_video

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)  # Habilitar CORS para todas las rutas

# Configuración
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max
app.config['DOWNLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'static', 'downloads')
app.config['HISTORY_FILE'] = os.path.join(os.path.dirname(__file__), 'static', 'download_history.json')

# Asegurar que exista la carpeta de descargas
os.makedirs(app.config['DOWNLOAD_FOLDER'], exist_ok=True)

# Función para cargar el historial de descargas
def load_history():
    if os.path.exists(app.config['HISTORY_FILE']):
        try:
            with open(app.config['HISTORY_FILE'], 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error al cargar el historial: {e}")
    return []

# Función para guardar el historial de descargas
def save_history(history):
    try:
        with open(app.config['HISTORY_FILE'], 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error al guardar el historial: {e}")

# Ruta principal - Redirigir a la interfaz web
@app.route('/')
def index():
    return render_template('index.html', now=datetime.datetime.now())

# Ruta para la página de historial
@app.route('/history')
def history_page():
    return render_template('index.html', now=datetime.datetime.now())

# API para descargar videos
@app.route('/api/download', methods=['POST'])
def api_download():
    data = request.json
    
    if not data or 'url' not in data:
        return jsonify({'success': False, 'message': 'URL no proporcionada'}), 400
    
    url = data['url']
    quality = data.get('quality', 'best')  # Calidad por defecto: best
    
    # Validar calidad
    if quality not in ['best', 'medium', 'worst']:
        quality = 'best'
    
    try:
        # Registrar tiempo de inicio
        start_time = time.time()
        
        # Descargar el video
        result = download_video(url, app.config['DOWNLOAD_FOLDER'], quality)
        
        # Calcular tiempo de descarga
        download_time = time.time() - start_time
        result['download_time'] = f"{download_time:.2f} segundos"
        
        # Corregir la URL de descarga para que apunte al servidor correcto
        if result['success'] and 'filepath' in result:
            # Obtener la ruta relativa dentro de la carpeta static
            static_path = os.path.relpath(result['filepath'], os.path.dirname(app.config['DOWNLOAD_FOLDER']))
            # Construir la URL correcta
            result['download_url'] = f"/api/download/file/{os.path.basename(result['filepath'])}"
        
        # Si la descarga fue exitosa, agregar al historial
        if result['success']:
            history = load_history()
            
            # Agregar timestamp
            result['timestamp'] = time.time()
            result['date'] = time.strftime('%Y-%m-%d %H:%M:%S')
            
            # Agregar al historial (limitar a 50 entradas)
            history.insert(0, result)
            if len(history) > 50:
                history = history[:50]
            
            save_history(history)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al procesar la solicitud: {str(e)}'
        }), 500

# Ruta para descargar archivos directamente
@app.route('/api/download/file/<filename>')
def download_file(filename):
    """Sirve el archivo de video directamente para descargar"""
    return send_from_directory(
        app.config['DOWNLOAD_FOLDER'], 
        filename, 
        as_attachment=True,
        mimetype='video/mp4'
    )

# API para obtener el historial de descargas
@app.route('/api/history', methods=['GET'])
def api_history():
    history = load_history()
    
    # Actualizar las URLs de descarga para todos los elementos del historial
    for item in history:
        if item.get('success') and 'filepath' in item:
            item['download_url'] = f"/api/download/file/{os.path.basename(item['filepath'])}"
    
    return jsonify(history)

# API para eliminar un video del historial
@app.route('/api/history/<filename>', methods=['DELETE'])
def api_delete_history(filename):
    history = load_history()
    
    # Buscar el elemento en el historial
    for item in history:
        if item.get('filename') == filename:
            # Intentar eliminar el archivo
            try:
                filepath = item.get('filepath')
                if filepath and os.path.exists(filepath):
                    os.remove(filepath)
            except Exception as e:
                print(f"Error al eliminar el archivo {filename}: {e}")
            
            # Eliminar del historial
            history = [h for h in history if h.get('filename') != filename]
            save_history(history)
            
            return jsonify({'success': True, 'message': f'Video {filename} eliminado'})
    
    return jsonify({'success': False, 'message': 'Video no encontrado'}), 404

# Servir archivos estáticos
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# Manejador de errores 404
@app.errorhandler(404)
def not_found(e):
    return render_template('404.html', now=datetime.datetime.now()), 404

# Manejador de errores 500
@app.errorhandler(500)
def server_error(e):
    return render_template('500.html', now=datetime.datetime.now()), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 