import React, { useState } from 'react';
import { Container, Typography, Box, Card, CardContent, CardMedia, Button, Grid, Divider, Chip } from '@mui/material';
import VideoForm from '../components/VideoForm';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GetAppIcon from '@mui/icons-material/GetApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const HomePage = () => {
  const [downloadedVideo, setDownloadedVideo] = useState(null);

  const handleDownloadSuccess = (videoData) => {
    setDownloadedVideo(videoData);
    // Desplazar a la sección de resultados
    setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return <InstagramIcon />;
      case 'facebook':
        return <FacebookIcon />;
      case 'tiktok':
        return <MusicNoteIcon />;
      default:
        return <GetAppIcon />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Descarga Videos de Redes Sociales
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Descarga videos de Instagram, TikTok y Facebook fácilmente y sin marcas de agua
        </Typography>
      </Box>

      <VideoForm onDownloadSuccess={handleDownloadSuccess} />

      {downloadedVideo && (
        <Box id="result-section" sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Video Descargado
          </Typography>
          
          <Card sx={{ mb: 4 }}>
            <Grid container>
              <Grid item xs={12} md={4}>
                <CardMedia
                  component="img"
                  height="100%"
                  image={downloadedVideo.thumbnail || 'https://via.placeholder.com/400x400?text=Video+Descargado'}
                  alt={downloadedVideo.title || 'Video descargado'}
                  sx={{ 
                    objectFit: 'cover',
                    height: { xs: '200px', md: '100%' },
                    borderTopLeftRadius: { md: 8 },
                    borderBottomLeftRadius: { md: 8 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip 
                      icon={getPlatformIcon(downloadedVideo.platform)} 
                      label={downloadedVideo.platform || 'Video'} 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {downloadedVideo.date}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" component="h3" gutterBottom>
                    {downloadedVideo.title || 'Video descargado exitosamente'}
                  </Typography>
                  
                  {downloadedVideo.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {downloadedVideo.description.length > 150 
                        ? `${downloadedVideo.description.substring(0, 150)}...` 
                        : downloadedVideo.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 'auto' }}>
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Tamaño:</strong> {downloadedVideo.file_size}
                        </Typography>
                        {downloadedVideo.duration && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Duración:</strong> {Math.floor(downloadedVideo.duration / 60)}:{(downloadedVideo.duration % 60).toString().padStart(2, '0')}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                        <Button 
                          variant="outlined" 
                          startIcon={<PlayArrowIcon />}
                          href={downloadedVideo.download_url} 
                          target="_blank"
                          sx={{ mr: 1 }}
                        >
                          Ver
                        </Button>
                        <Button 
                          variant="contained" 
                          startIcon={<GetAppIcon />}
                          href={downloadedVideo.download_url} 
                          download
                        >
                          Descargar
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Box>
      )}

      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom textAlign="center">
          ¿Cómo funciona?
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  1. Pega la URL
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Copia la URL del video de Instagram, TikTok o Facebook que deseas descargar y pégala en el campo de texto.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  2. Selecciona la calidad
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Elige la calidad del video que deseas descargar. Recomendamos la mejor calidad para obtener resultados óptimos.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  3. Descarga el video
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Haz clic en el botón de descarga y espera a que el proceso termine. Luego podrás ver y descargar el video.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage; 