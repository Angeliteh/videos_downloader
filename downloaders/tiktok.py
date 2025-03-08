import os
import uuid
import yt_dlp

def download_tiktok_video(video_url, output_path=None, quality='best'):
    """
    Descarga un video de TikTok usando yt-dlp.
    
    Args:
        video_url (str): URL del video de TikTok
        output_path (str, optional): Ruta donde guardar el video
        quality (str): Calidad del video ('best', 'medium', 'worst')
        
    Returns:
        dict: Información sobre el video descargado
    """
    try:
        print(f"✅ Descargando video de TikTok: {video_url}")
        
        # Generar un nombre de archivo único
        if not output_path:
            output_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'downloads')
        
        os.makedirs(output_path, exist_ok=True)
        unique_id = uuid.uuid4().hex[:8]
        output_template = os.path.join(output_path, f"tiktok_{unique_id}_%(id)s.%(ext)s")
        
        # Determinar el formato según la calidad seleccionada
        if quality == 'best':
            format_option = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
        elif quality == 'medium':
            format_option = 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]'
        elif quality == 'worst':
            format_option = 'worst[ext=mp4]'
        else:
            format_option = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
        
        # Configurar opciones de yt-dlp específicas para TikTok
        ydl_opts = {
            'format': format_option,
            'merge_output_format': 'mp4',  # Forzar salida en formato MP4
            'outtmpl': output_template,
            'quiet': False,
            'no_warnings': False,
            'ignoreerrors': True,
            'geo_bypass': True,
            # Opciones adicionales para TikTok
            'extractor_args': {
                'tiktok': {
                    'embed_api': 'https://www.tiktok.com/embed',
                    'api_hostname': 'api22-normal-c-useast1a.tiktokv.com',
                    'app_version': '2022.07.11',
                    'manifest_app_version': '2022.07.11',
                }
            },
            # Usar un user-agent de móvil para mejor compatibilidad
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                'Referer': 'https://www.tiktok.com/'
            },
        }
        
        # Descargar el video
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            if info:
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
                    
                    print(f"✅ Video descargado exitosamente como: {filename}")
                    
                    # Obtener la ruta relativa para servir el archivo
                    relative_path = os.path.relpath(filename, os.path.join(os.path.dirname(__file__), '..', 'static'))
                    download_url = f"/static/{relative_path.replace(os.sep, '/')}"
                    
                    return {
                        'success': True,
                        'message': 'Video descargado exitosamente',
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
                else:
                    print("⚠️ El archivo descargado parece ser muy pequeño o solo contiene audio.")
                    
                    # Intentar con método alternativo
                    print("🔄 Intentando método alternativo...")
                    alt_opts = ydl_opts.copy()
                    alt_opts['format'] = 'best'  # Usar formato 'best' como alternativa
                    
                    # Cambiar el nombre para no sobrescribir
                    alt_template = output_template.replace("tiktok_", "tiktok_alt_")
                    alt_opts['outtmpl'] = alt_template
                    
                    with yt_dlp.YoutubeDL(alt_opts) as alt_ydl:
                        alt_info = alt_ydl.extract_info(video_url, download=True)
                        if alt_info:
                            alt_filename = alt_ydl.prepare_filename(alt_info)
                            
                            # Obtener información del video
                            title = alt_info.get('title', 'Video de TikTok')
                            description = alt_info.get('description', '')
                            thumbnail = alt_info.get('thumbnail', '')
                            duration = alt_info.get('duration', 0)
                            uploader = alt_info.get('uploader', '')
                            
                            # Calcular tamaño del archivo
                            file_size = os.path.getsize(alt_filename) / (1024 * 1024)  # MB
                            
                            print(f"✅ Video descargado con método alternativo: {alt_filename}")
                            
                            # Obtener la ruta relativa para servir el archivo
                            relative_path = os.path.relpath(alt_filename, os.path.join(os.path.dirname(__file__), '..', 'static'))
                            download_url = f"/static/{relative_path.replace(os.sep, '/')}"
                            
                            return {
                                'success': True,
                                'message': 'Video descargado exitosamente (método alternativo)',
                                'filename': os.path.basename(alt_filename),
                                'filepath': alt_filename,
                                'download_url': download_url,
                                'file_size': f"{file_size:.2f} MB",
                                'title': title,
                                'description': description,
                                'thumbnail': thumbnail,
                                'duration': duration,
                                'uploader': uploader,
                                'platform': 'TikTok'
                            }
            
            return {
                'success': False,
                'message': 'No se pudo obtener información del video',
                'platform': 'TikTok'
            }
    
    except Exception as e:
        print(f"❌ Error al descargar el video de TikTok: {str(e)}")
        
        # Intentar con método de respaldo usando solo 'best'
        try:
            print("🔄 Intentando método de respaldo...")
            
            backup_template = os.path.join(output_path, f"tiktok_backup_{uuid.uuid4().hex[:8]}.%(ext)s")
            backup_opts = {
                'format': 'best',
                'outtmpl': backup_template,
                'quiet': False,
            }
            
            with yt_dlp.YoutubeDL(backup_opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
                if info:
                    filename = ydl.prepare_filename(info)
                    
                    # Obtener información del video
                    title = info.get('title', 'Video de TikTok')
                    description = info.get('description', '')
                    thumbnail = info.get('thumbnail', '')
                    duration = info.get('duration', 0)
                    uploader = info.get('uploader', '')
                    
                    # Calcular tamaño del archivo
                    file_size = os.path.getsize(filename) / (1024 * 1024)  # MB
                    
                    print(f"✅ Video descargado con método de respaldo: {filename}")
                    
                    # Obtener la ruta relativa para servir el archivo
                    relative_path = os.path.relpath(filename, os.path.join(os.path.dirname(__file__), '..', 'static'))
                    download_url = f"/static/{relative_path.replace(os.sep, '/')}"
                    
                    return {
                        'success': True,
                        'message': 'Video descargado exitosamente (método de respaldo)',
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
        except Exception as backup_error:
            print(f"❌ También falló el método de respaldo: {str(backup_error)}")
        
        return {
            'success': False,
            'message': f'Error: {str(e)}',
            'platform': 'TikTok'
        } 