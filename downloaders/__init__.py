from .instagram import download_instagram_video
from .tiktok import download_tiktok_video
from .facebook import download_facebook_video
import re
import requests

def normalize_url(url):
    """
    Normaliza la URL para manejar diferentes formatos y acortadores.
    
    Args:
        url (str): URL original
        
    Returns:
        str: URL normalizada
    """
    print(f"🔗 Normalizando URL: {url}")
    
    # Manejar URLs acortadas
    if "vm.tiktok.com" in url or "vt.tiktok.com" in url:
        try:
            print(f"🔄 Expandiendo URL acortada de TikTok: {url}")
            response = requests.head(url, allow_redirects=True, timeout=10)
            expanded_url = response.url
            print(f"🔄 URL expandida: {expanded_url}")
            return expanded_url
        except Exception as e:
            print(f"❌ Error al expandir URL acortada: {e}")
            return url
    
    # Limpiar parámetros innecesarios
    if "instagram.com" in url:
        # Mantener solo la parte esencial de la URL de Instagram
        match = re.search(r'(https?://(?:www\.)?instagram\.com/(?:p|reel)/[^/?]+)', url)
        if match:
            clean_url = match.group(1)
            print(f"🧹 URL de Instagram limpiada: {clean_url}")
            return clean_url
    
    # Devolver la URL original si no se aplica ninguna normalización
    return url

def download_video(url, output_path=None, quality='best'):
    """
    Función principal que detecta el tipo de URL y llama a la función correspondiente.
    
    Args:
        url (str): URL del video (Instagram, TikTok, Facebook)
        output_path (str, optional): Ruta donde guardar el video
        quality (str): Calidad del video ('best', 'medium', 'worst')
        
    Returns:
        dict: Información sobre el video descargado
    """
    print(f"📥 Iniciando descarga desde URL: {url}")
    
    # Normalizar la URL
    normalized_url = normalize_url(url)
    if normalized_url != url:
        print(f"🔄 URL normalizada: {normalized_url}")
        url = normalized_url
    
    # Detectar el tipo de URL
    if "instagram.com" in url or "instagr.am" in url:
        print("📱 Detectado enlace de Instagram")
        try:
            return download_instagram_video(url, output_path, quality)
        except Exception as e:
            print(f"❌ Error al descargar video de Instagram: {e}")
            return {
                'success': False,
                'message': f'Error al descargar video de Instagram: {str(e)}',
                'platform': 'Instagram',
                'url': url
            }
    elif "tiktok.com" in url or "vm.tiktok.com" in url or "vt.tiktok.com" in url:
        print("📱 Detectado enlace de TikTok")
        try:
            return download_tiktok_video(url, output_path, quality)
        except Exception as e:
            print(f"❌ Error al descargar video de TikTok: {e}")
            return {
                'success': False,
                'message': f'Error al descargar video de TikTok: {str(e)}',
                'platform': 'TikTok',
                'url': url
            }
    elif "facebook.com" in url or "fb.com" in url or "fb.watch" in url:
        print("📱 Detectado enlace de Facebook")
        try:
            return download_facebook_video(url, output_path, quality)
        except Exception as e:
            print(f"❌ Error al descargar video de Facebook: {e}")
            return {
                'success': False,
                'message': f'Error al descargar video de Facebook: {str(e)}',
                'platform': 'Facebook',
                'url': url
            }
    else:
        print(f"❌ URL no soportada: {url}")
        return {
            'success': False,
            'message': 'URL no soportada. Por favor, proporciona un enlace de Instagram, TikTok o Facebook.',
            'platform': 'Unknown',
            'url': url
        } 