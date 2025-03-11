# 🎬 Descargador de Videos - Instagram, TikTok y Facebook

Una aplicación web para descargar videos de Instagram, TikTok y Facebook utilizando yt-dlp.

## 📋 Características

- ✅ Descarga videos de Instagram (reels, posts)
- ✅ Descarga videos de TikTok
- ✅ Descarga videos de Facebook (reels, videos normales)
- ✅ Interfaz web moderna y responsive
- ✅ Selección de calidad de video (alta, media, baja)
- ✅ Historial de descargas
- ✅ Reproducción de videos en el navegador
- ✅ Información detallada de los videos (tamaño, duración, etc.)

## 🔧 Requisitos

- Python 3.6 o superior
- Flask y Flask-CORS
- yt-dlp

## 💻 Instalación

1. Clona este repositorio:
```bash
git clone https://github.com/yourusername/video-downloader.git
cd video-downloader
```

2. Instala las dependencias:
```bash
pip install -r backend/requirements.txt
```

3. Ejecuta la aplicación:
```bash
cd backend
python app.py
```

La aplicación estará disponible en http://localhost:5000.

## 🚀 Uso

1. Abre tu navegador y ve a http://localhost:5000
2. Pega la URL del video que deseas descargar
3. Selecciona la calidad deseada
4. Haz clic en "Descargar Video"
5. Una vez completada la descarga, podrás ver y descargar el video

## 📁 Estructura del proyecto

```
video-downloader/
├── backend/
│   ├── downloaders/
│   │   ├── __init__.py
│   │   ├── instagram.py
│   │   ├── tiktok.py
│   │   └── facebook.py
│   ├── static/
│   │   ├── css/
│   │   │   └── styles.css
│   │   ├── js/
│   │   │   └── app.js
│   │   └── downloads/
│   ├── templates/
│   │   ├── index.html
│   │   ├── 404.html
│   │   └── 500.html
│   ├── app.py
│   ├── requirements.txt
│   └── run.py
└── README.md
```

## ⚠️ Notas importantes

- Esta aplicación utiliza yt-dlp, que se mantiene actualizado con los cambios en las plataformas.
- Para videos de Facebook e Instagram que requieren autenticación, la aplicación intentará usar las cookies de Chrome.
- Las plataformas pueden cambiar su estructura o implementar medidas anti-scraping, lo que podría afectar la funcionalidad.
- Utiliza esta herramienta de manera responsable y respeta los términos de servicio de las plataformas.

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 🙏 Agradecimientos

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) por proporcionar una excelente herramienta para descargar videos.
- [Flask](https://flask.palletsprojects.com/) por el framework web para Python.
- [Font Awesome](https://fontawesome.com/) por los iconos utilizados en la interfaz. 