from .instagram import download_instagram_video
from .tiktok import download_tiktok_video
from .facebook import download_facebook_video

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
    # Detectar el tipo de URL
    if "instagram.com" in url or "instagr.am" in url:
        print("📱 Detectado enlace de Instagram")
        return download_instagram_video(url, output_path, quality)
    elif "tiktok.com" in url or "vm.tiktok.com" in url:
        print("📱 Detectado enlace de TikTok")
        return download_tiktok_video(url, output_path, quality)
    elif "facebook.com" in url or "fb.com" in url or "fb.watch" in url:
        print("📱 Detectado enlace de Facebook")
        return download_facebook_video(url, output_path, quality)
    else:
        return {
            'success': False,
            'message': 'URL no soportada. Por favor, proporciona un enlace de Instagram, TikTok o Facebook.',
            'platform': 'Unknown'
        } 