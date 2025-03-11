from flask import Flask, request, jsonify, send_from_directory, render_template, redirect, url_for
from flask_cors import CORS
import os
import time
import json
import datetime
from downloaders import download_video

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)  # Habilitar CORS para todas las rutas

# Configuración de Jinja2
app.jinja_env.auto_reload = True
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # Deshabilitar caché para desarrollo

# Configuración
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max
app.config['DOWNLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'static', 'downloads')
app.config['HISTORY_FILE'] = os.path.join(os.path.dirname(__file__), 'static', 'download_history.json')
app.config['APP_FOLDER'] = os.path.join(os.path.dirname(__file__), 'static', 'app')

# Asegurar que existan las carpetas necesarias
os.makedirs(app.config['DOWNLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['APP_FOLDER'], exist_ok=True)

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

# Endpoint para verificar si el servidor está disponible
@app.route('/api/ping', methods=['GET'])
def ping():
    """Endpoint para verificar si el servidor está disponible"""
    return jsonify({
        'status': 'ok',
        'message': 'Server is running',
        'timestamp': time.time()
    })

# Ruta principal - Redirigir a la interfaz web
@app.route('/')
def index():
    return render_template('index.html', now=datetime.datetime.now(), current_path='/')

# Ruta para la página de historial
@app.route('/history')
def history_page():
    return render_template('index.html', now=datetime.datetime.now(), current_path='/history')

# Ruta para la página de la app móvil
@app.route('/app')
def app_page():
    return render_template('app.html', now=datetime.datetime.now(), current_path='/app')

# Ruta para la página de pagos
@app.route('/payment')
def payment_page():
    return render_template('payment.html', now=datetime.datetime.now(), current_path='/payment')

# Ruta para descargar la app gratuita
@app.route('/download/app/free')
def download_free_app():
    # Aquí podrías implementar lógica para registrar la descarga
    # o cualquier otra acción necesaria
    return send_from_directory(
        app.config['APP_FOLDER'],
        'video_downloader_free.apk',
        as_attachment=True,
        mimetype='application/vnd.android.package-archive'
    )

# Ruta para descargar la app premium (después del pago)
@app.route('/download/app/premium/<token>')
def download_premium_app(token):
    # Aquí deberías verificar que el token sea válido
    # y corresponda a un pago realizado
    if verify_payment_token(token):
        return send_from_directory(
            app.config['APP_FOLDER'],
            'video_downloader_premium.apk',
            as_attachment=True,
            mimetype='application/vnd.android.package-archive'
        )
    else:
        return redirect(url_for('payment_page'))

# Función para verificar el token de pago
def verify_payment_token(token):
    # Esta es una implementación de ejemplo
    # En un entorno real, deberías verificar contra tu base de datos
    # o servicio de pagos
    valid_tokens = ['test_token', 'payment_completed']
    return token in valid_tokens

# API para procesar pagos
@app.route('/api/process-payment', methods=['POST'])
def process_payment():
    data = request.json
    
    if not data or 'payment_method' not in data:
        return jsonify({'success': False, 'message': 'Método de pago no proporcionado'}), 400
    
    # Aquí implementarías la integración con tu pasarela de pagos
    # Este es solo un ejemplo
    payment_method = data['payment_method']
    amount = data.get('amount', 4.99)
    
    # Simulación de procesamiento de pago
    if payment_method == 'card':
        # Verificar datos de tarjeta
        if 'card_number' not in data or 'expiry' not in data or 'cvv' not in data:
            return jsonify({'success': False, 'message': 'Datos de tarjeta incompletos'}), 400
        
        # En un entorno real, aquí procesarías el pago con tu pasarela
        payment_success = True
        payment_token = 'payment_completed'
    else:
        # Otros métodos de pago
        payment_success = False
        payment_token = None
    
    if payment_success:
        return jsonify({
            'success': True,
            'message': 'Pago procesado correctamente',
            'download_url': url_for('download_premium_app', token=payment_token)
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Error al procesar el pago'
        }), 400

# API para descargar videos
@app.route('/api/download', methods=['POST'])
def api_download():
    data = request.json
    print(f"[API] Solicitud de descarga recibida: {data}")
    
    if not data or 'url' not in data:
        print("[API] Error: URL no proporcionada")
        return jsonify({'success': False, 'message': 'URL no proporcionada'}), 400
    
    url = data['url']
    quality = data.get('quality', 'best')  # Calidad por defecto: best
    
    # Validar URL
    if not url.startswith(('http://', 'https://')):
        print(f"[API] Error: URL inválida: {url}")
        return jsonify({'success': False, 'message': 'URL inválida. Debe comenzar con http:// o https://'}), 400
    
    # Validar calidad
    if quality not in ['best', 'medium', 'worst']:
        print(f"[API] Calidad inválida: {quality}, usando 'best' por defecto")
        quality = 'best'
    
    try:
        # Registrar tiempo de inicio
        start_time = time.time()
        print(f"[API] Iniciando descarga de: {url} con calidad: {quality}")
        
        # Descargar el video
        result = download_video(url, app.config['DOWNLOAD_FOLDER'], quality)
        
        # Calcular tiempo de descarga
        download_time = time.time() - start_time
        result['download_time'] = f"{download_time:.2f} segundos"
        
        print(f"[API] Resultado de la descarga: {result['success']} - {result.get('message', 'No message')}")
        
        # Corregir la URL de descarga para que apunte al servidor correcto
        if result['success'] and 'filepath' in result:
            # Obtener la ruta relativa dentro de la carpeta static
            static_path = os.path.relpath(result['filepath'], os.path.dirname(app.config['DOWNLOAD_FOLDER']))
            # Construir la URL correcta
            result['download_url'] = f"/api/download/file/{os.path.basename(result['filepath'])}"
            print(f"[API] URL de descarga generada: {result['download_url']}")
        
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
            print(f"[API] Video guardado en historial: {result.get('title', 'Sin título')}")
        
        return jsonify(result)
    
    except Exception as e:
        error_message = f"Error al procesar la solicitud: {str(e)}"
        print(f"[API] {error_message}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': error_message
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

# Configuración para servir archivos estáticos
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(app.static_folder, filename)

# Servir favicon.ico
@app.route('/favicon.ico')
def favicon():
    try:
        return send_from_directory(os.path.join(app.static_folder), 'favicon.ico', mimetype='image/vnd.microsoft.icon')
    except:
        return '', 204  # No content

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