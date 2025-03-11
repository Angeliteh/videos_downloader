import os
import uuid
import yt_dlp

def download_facebook_video(video_url, output_path=None, quality='best'):
    """
    Descarga un video de Facebook usando yt-dlp.
    
    Args:
        video_url (str): URL del video de Facebook
        output_path (str, optional): Ruta donde guardar el video
        quality (str): Calidad del video ('best', 'medium', 'worst')
        
    Returns:
        dict: Información sobre el video descargado
    """
    try:
        print(f"✅ Descargando video de Facebook: {video_url}")
        
        # Determinar el formato según la calidad seleccionada
        if quality == 'best':
            format_option = 'bestvideo+bestaudio/best'
        elif quality == 'medium':
            format_option = 'bestvideo[height<=720]+bestaudio/best[height<=720]'
        elif quality == 'worst':
            format_option = 'worst'
        else:
            format_option = 'bestvideo+bestaudio/best'
        
        # Generar un nombre de archivo único
        if not output_path:
            output_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'downloads')
        
        os.makedirs(output_path, exist_ok=True)
        unique_id = uuid.uuid4().hex[:8]
        output_template = os.path.join(output_path, f"facebook_{unique_id}_%(id)s.%(ext)s")
        
        # Configurar opciones de yt-dlp
        ydl_opts = {
            'format': format_option,
            'merge_output_format': 'mp4',  # Forzar salida en formato MP4
            'outtmpl': output_template,
            'quiet': False,
            'no_warnings': False,
            'ignoreerrors': True,
            'geo_bypass': True,
            'socket_timeout': 30,
            # No usar cookies para evitar errores
            # 'cookiesfrombrowser': ('chrome',),
        }
        
        # Descargar el video
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            if info:
                filename = ydl.prepare_filename(info)
                
                # Obtener información del video
                title = info.get('title', 'Video de Facebook')
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
                    'platform': 'Facebook'
                }
            else:
                return {
                    'success': False,
                    'message': 'No se pudo obtener información del video',
                    'platform': 'Facebook'
                }
    
    except Exception as e:
        print(f"❌ Error al descargar el video de Facebook: {str(e)}")
        
        # Intentar con método alternativo
        try:
            print("🔄 Intentando método alternativo...")
            
            alt_opts = {
                'format': 'best',
                'outtmpl': output_template.replace("facebook_", "facebook_alt_"),
                'quiet': False,
                'no_warnings': False,
                'ignoreerrors': True,
            }
            
            with yt_dlp.YoutubeDL(alt_opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
                if info:
                    filename = ydl.prepare_filename(info)
                    
                    # Obtener información del video
                    title = info.get('title', 'Video de Facebook')
                    description = info.get('description', '')
                    thumbnail = info.get('thumbnail', '')
                    duration = info.get('duration', 0)
                    uploader = info.get('uploader', '')
                    
                    # Calcular tamaño del archivo
                    file_size = os.path.getsize(filename) / (1024 * 1024)  # MB
                    
                    print(f"✅ Video descargado con método alternativo: {filename}")
                    
                    # Obtener la ruta relativa para servir el archivo
                    relative_path = os.path.relpath(filename, os.path.join(os.path.dirname(__file__), '..', 'static'))
                    download_url = f"/static/{relative_path.replace(os.sep, '/')}"
                    
                    return {
                        'success': True,
                        'message': 'Video descargado exitosamente (método alternativo)',
                        'filename': os.path.basename(filename),
                        'filepath': filename,
                        'download_url': download_url,
                        'file_size': f"{file_size:.2f} MB",
                        'title': title,
                        'description': description,
                        'thumbnail': thumbnail,
                        'duration': duration,
                        'uploader': uploader,
                        'platform': 'Facebook'
                    }
        except Exception as alt_error:
            print(f"❌ También falló el método alternativo: {str(alt_error)}")
        
        return {
            'success': False,
            'message': f'Error: {str(e)}',
            'platform': 'Facebook'
        } 