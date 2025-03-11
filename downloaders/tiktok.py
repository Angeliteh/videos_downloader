import os
import uuid
import yt_dlp
import requests
import re
import json
import time

def download_tiktok_video(video_url, output_path=None, quality='best'):
    """
    Descarga un video de TikTok usando múltiples métodos.
    
    Args:
        video_url (str): URL del video de TikTok
        output_path (str, optional): Ruta donde guardar el video
        quality (str): Calidad del video ('best', 'medium', 'worst')
        
    Returns:
        dict: Información sobre el video descargado
    """
    print(f"🔍 Procesando URL de TikTok: {video_url}")
    
    # Generar un nombre de archivo único
    if not output_path:
        output_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'downloads')
    
    os.makedirs(output_path, exist_ok=True)
    unique_id = uuid.uuid4().hex[:8]
    output_template = os.path.join(output_path, f"tiktok_{unique_id}.mp4")
    
    # Intentar múltiples métodos en orden
    methods = [
        download_with_yt_dlp,
        download_with_tiktok_api,
        download_with_alternative_api
    ]
    
    last_error = None
    for method_index, method in enumerate(methods):
        try:
            print(f"🔄 Intentando método {method_index + 1} para TikTok...")
            result = method(video_url, output_template, quality)
            if result and result.get('success'):
                print(f"✅ Descarga exitosa con método {method_index + 1}")
                return result
        except Exception as e:
            print(f"❌ Error en método {method_index + 1}: {str(e)}")
            last_error = str(e)
    
    # Si llegamos aquí, todos los métodos fallaron
    return {
        'success': False,
        'message': f'No se pudo descargar el video de TikTok después de intentar múltiples métodos. Último error: {last_error}',
        'platform': 'TikTok',
        'url': video_url
    }

def download_with_yt_dlp(video_url, output_template, quality):
    """Método 1: Usar yt-dlp con configuración optimizada"""
    print(f"📥 Intentando descargar con yt-dlp: {video_url}")
    
    # Determinar el formato según la calidad seleccionada
    if quality == 'best':
        format_option = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
    elif quality == 'medium':
        format_option = 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]'
    elif quality == 'worst':
        format_option = 'worst[ext=mp4]'
    else:
        format_option = 'best[ext=mp4]/best'
    
    # Configuración actualizada para TikTok 2023
    ydl_opts = {
        'format': format_option,
        'outtmpl': output_template,
        'quiet': False,
        'no_warnings': False,
        'ignoreerrors': True,
        'geo_bypass': True,
        'cookiefile': None,  # No usar cookies para evitar problemas de autenticación
        'extractor_args': {
            'tiktok': {
                'embed_api': 'https://www.tiktok.com/embed',
                'api_hostname': 'api22-normal-c-useast1a.tiktokv.com',
                'app_version': '2023.06.01',
                'manifest_app_version': '2023.06.01',
            }
        },
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Referer': 'https://www.tiktok.com/',
            'Cookie': '',  # Cookies vacías para evitar problemas
        },
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=True)
        
        if not info:
            print("⚠️ No se pudo obtener información del video con yt-dlp")
            return None
        
        filename = ydl.prepare_filename(info)
        
        # Verificar que el archivo existe y tiene un tamaño razonable
        if os.path.exists(filename) and os.path.getsize(filename) > 100000:  # > 100KB
            # Obtener información del video
            title = info.get('title', 'Video de TikTok')
            description = info.get('description', '')
            thumbnail = info.get('thumbnail', '')
            duration = info.get('duration', 0)
            uploader = info.get('uploader', '')
            
            # Calcular tamaño del archivo
            file_size = os.path.getsize(filename) / (1024 * 1024)  # MB
            
            # Obtener la ruta relativa para servir el archivo
            relative_path = os.path.relpath(filename, os.path.join(os.path.dirname(__file__), '..', 'static'))
            download_url = f"/static/{relative_path.replace(os.sep, '/')}"
            
            return {
                'success': True,
                'message': 'Video descargado exitosamente con yt-dlp',
                'filename': os.path.basename(filename),
                'filepath': filename,
                'download_url': download_url,
                'file_size': f"{file_size:.2f} MB",
                'title': title,
                'description': description,
                'thumbnail': thumbnail,
                'duration': duration,
                'uploader': uploader,
                'platform': 'TikTok'
            }
    
    return None

def download_with_tiktok_api(video_url, output_template, quality):
    """Método 2: Usar la API no oficial de TikTok"""
    print(f"📥 Intentando descargar con API no oficial: {video_url}")
    
    # Extraer el ID del video de la URL
    video_id = None
    patterns = [
        r'tiktok\.com/.*?/video/(\d+)',
        r'vm\.tiktok\.com/(\w+)',
        r'vt\.tiktok\.com/(\w+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, video_url)
        if match:
            if 'vm.tiktok.com' in video_url or 'vt.tiktok.com' in video_url:
                # Para URLs acortadas, seguir la redirección para obtener la URL real
                try:
                    response = requests.head(video_url, allow_redirects=True, timeout=10)
                    real_url = response.url
                    print(f"🔄 URL expandida: {real_url}")
                    
                    # Intentar extraer el ID de la URL real
                    for p in patterns:
                        m = re.search(p, real_url)
                        if m and 'video' in p:
                            video_id = m.group(1)
                            break
                except Exception as e:
                    print(f"⚠️ Error al expandir URL acortada: {e}")
            else:
                video_id = match.group(1)
            break
    
    if not video_id:
        print("⚠️ No se pudo extraer el ID del video de la URL")
        return None
    
    print(f"🔍 ID del video: {video_id}")
    
    # Intentar obtener el video sin marca de agua
    api_url = f"https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id={video_id}"
    headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.tiktok.com/"
    }
    
    try:
        response = requests.get(api_url, headers=headers, timeout=15)
        if response.status_code != 200:
            print(f"⚠️ API respondió con código {response.status_code}")
            return None
        
        data = response.json()
        aweme_list = data.get('aweme_list', [])
        
        if not aweme_list:
            print("⚠️ No se encontraron datos del video en la API")
            return None
        
        video_data = aweme_list[0]
        
        # Obtener URL del video según la calidad
        video_urls = []
        if 'video' in video_data and 'play_addr' in video_data['video']:
            play_addr = video_data['video']['play_addr']
            if 'url_list' in play_addr and play_addr['url_list']:
                video_urls = play_addr['url_list']
        
        if not video_urls:
            print("⚠️ No se encontraron URLs de video")
            return None
        
        # Seleccionar URL según calidad
        video_url_to_download = video_urls[0]  # Por defecto, usar la primera URL
        
        # Descargar el video
        video_response = requests.get(video_url_to_download, headers=headers, timeout=30)
        if video_response.status_code != 200:
            print(f"⚠️ Error al descargar el video: {video_response.status_code}")
            return None
        
        with open(output_template, 'wb') as f:
            f.write(video_response.content)
        
        # Verificar que el archivo existe y tiene un tamaño razonable
        if os.path.exists(output_template) and os.path.getsize(output_template) > 100000:  # > 100KB
            # Obtener información del video
            title = video_data.get('desc', 'Video de TikTok')
            author = video_data.get('author', {}).get('nickname', 'Usuario de TikTok')
            
            # Obtener thumbnail
            thumbnail = ''
            if 'cover' in video_data and 'url_list' in video_data['cover'] and video_data['cover']['url_list']:
                thumbnail = video_data['cover']['url_list'][0]
            
            # Calcular tamaño del archivo
            file_size = os.path.getsize(output_template) / (1024 * 1024)  # MB
            
            # Obtener la ruta relativa para servir el archivo
            relative_path = os.path.relpath(output_template, os.path.join(os.path.dirname(__file__), '..', 'static'))
            download_url = f"/static/{relative_path.replace(os.sep, '/')}"
            
            return {
                'success': True,
                'message': 'Video descargado exitosamente con API no oficial',
                'filename': os.path.basename(output_template),
                'filepath': output_template,
                'download_url': download_url,
                'file_size': f"{file_size:.2f} MB",
                'title': title,
                'description': title,
                'thumbnail': thumbnail,
                'duration': 0,  # No tenemos esta información
                'uploader': author,
                'platform': 'TikTok'
            }
    except Exception as e:
        print(f"❌ Error al usar API no oficial: {str(e)}")
    
    return None

def download_with_alternative_api(video_url, output_template, quality):
    """Método 3: Usar una API alternativa"""
    print(f"📥 Intentando descargar con API alternativa: {video_url}")
    
    # Usar una API pública para TikTok (esto es un ejemplo, podría necesitar ajustes)
    api_url = "https://tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com/vid/index"
    
    querystring = {"url": video_url}
    
    headers = {
        "X-RapidAPI-Key": "SIGN-UP-FOR-KEY",  # Necesitarías registrarte para obtener una clave
        "X-RapidAPI-Host": "tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com"
    }
    
    try:
        # Simular descarga directa para pruebas
        # En un caso real, necesitarías una API válida o implementar un scraper
        print("⚠️ Método de API alternativa es solo un ejemplo y requiere configuración adicional")
        
        # Crear un archivo de prueba (solo para demostración)
        with open(output_template, 'wb') as f:
            f.write(b'Este es un archivo de prueba')
        
        # En un caso real, descargarías el video así:
        # response = requests.get(api_url, headers=headers, params=querystring)
        # data = response.json()
        # video_url = data['video_url']
        # video_response = requests.get(video_url)
        # with open(output_template, 'wb') as f:
        #     f.write(video_response.content)
        
        # Este método es solo un ejemplo y no funcionará sin configuración adicional
        return None
    except Exception as e:
        print(f"❌ Error al usar API alternativa: {str(e)}")
    
    return None 