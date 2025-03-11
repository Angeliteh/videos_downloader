import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteIcon from '@mui/icons-material/Delete';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { toast } from 'react-toastify';
import { getHistory, deleteFromHistory } from '../utils/api';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Error al obtener el historial:', err);
      setError('Error al cargar el historial. Por favor, inténtalo de nuevo más tarde.');
      toast.error('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (video) => {
    setSelectedVideo(video);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVideo) return;
    
    try {
      await deleteFromHistory(selectedVideo.filename);
      setHistory(history.filter(item => item.filename !== selectedVideo.filename));
      toast.success('Video eliminado del historial');
    } catch (err) {
      console.error('Error al eliminar el video:', err);
      toast.error('Error al eliminar el video');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedVideo(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedVideo(null);
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Historial de Descargas
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Aquí puedes ver todos los videos que has descargado anteriormente.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : history.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No hay videos en el historial
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Los videos que descargues aparecerán aquí para que puedas acceder a ellos fácilmente.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {history.map((video, index) => (
            <Grid item xs={12} key={video.filename || index}>
              <Card sx={{ mb: 2 }}>
                <Grid container>
                  <Grid item xs={12} sm={3}>
                    <CardMedia
                      component="img"
                      height="100%"
                      image={video.thumbnail || 'https://via.placeholder.com/400x400?text=Video'}
                      alt={video.title || 'Video descargado'}
                      sx={{ 
                        objectFit: 'cover',
                        height: { xs: '180px', sm: '100%' },
                        minHeight: { sm: '180px' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            icon={getPlatformIcon(video.platform)} 
                            label={video.platform || 'Video'} 
                            color="primary" 
                            size="small" 
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {video.date}
                          </Typography>
                        </Box>
                        <IconButton 
                          color="error" 
                          size="small" 
                          onClick={() => handleDeleteClick(video)}
                          aria-label="eliminar"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="h6" component="h3" gutterBottom>
                        {video.title || 'Video descargado'}
                      </Typography>
                      
                      {video.description && (
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {video.description.length > 100 
                            ? `${video.description.substring(0, 100)}...` 
                            : video.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ mt: 'auto' }}>
                        <Divider sx={{ my: 1 }} />
                        
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Tamaño:</strong> {video.file_size}
                            </Typography>
                            {video.duration && (
                              <Typography variant="body2" color="text.secondary">
                                <strong>Duración:</strong> {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                            <Button 
                              variant="outlined" 
                              startIcon={<PlayArrowIcon />}
                              href={video.download_url} 
                              target="_blank"
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              Ver
                            </Button>
                            <Button 
                              variant="contained" 
                              startIcon={<GetAppIcon />}
                              href={video.download_url} 
                              download
                              size="small"
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
            </Grid>
          ))}
        </Grid>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas eliminar este video del historial? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HistoryPage; 