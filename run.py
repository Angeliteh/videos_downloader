from app import app
import socket
import os

def get_local_ip():
    """Obtiene la dirección IP local del dispositivo"""
    try:
        # Crear un socket para determinar la IP local
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

if __name__ == '__main__':
    host = '0.0.0.0'
    port = 5000
    
    local_ip = get_local_ip()
    
    print("\n" + "="*60)
    print(f"🚀 Servidor de descarga de videos iniciado")
    print("="*60)
    print(f"📱 Accede desde tu dispositivo móvil usando:")
    print(f"   http://{local_ip}:{port}")
    print("\n📋 Endpoints disponibles:")
    print(f"   - API de descarga:     http://{local_ip}:{port}/api/download")
    print(f"   - API de historial:    http://{local_ip}:{port}/api/history")
    print(f"   - API de verificación: http://{local_ip}:{port}/api/ping")
    print("\n💡 Configura la app Flutter con esta URL en constants.dart:")
    print(f"   static const String apiBaseUrl = 'http://{local_ip}:{port}';")
    print("="*60 + "\n")
    
    # Crear carpeta de descargas si no existe
    downloads_folder = os.path.join(os.path.dirname(__file__), 'static', 'downloads')
    os.makedirs(downloads_folder, exist_ok=True)
    
    app.run(debug=True, host=host, port=port) 