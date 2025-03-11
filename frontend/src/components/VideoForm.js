import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { toast } from 'react-toastify';
import { downloadVideo } from '../utils/api';

const VideoForm = ({ onDownloadSuccess }) => {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('best');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) {
      setError('Por favor, ingresa una URL válida');
      return;
    }

    // Validar que la URL sea de una plataforma soportada
    const supportedPlatforms = ['instagram.com', 'tiktok.com', 'facebook.com', 'fb.com', 'fb.watch'];
    const isSupported = supportedPlatforms.some(platform => url.includes(platform));
    
    if (!isSupported) {
      setError('URL no soportada. Por favor, ingresa una URL de Instagram, TikTok o Facebook');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await downloadVideo(url, quality);
      
      if (result.success) {
        toast.success('¡Video descargado exitosamente!');
        setUrl('');
        if (onDownloadSuccess) {
          onDownloadSuccess(result);
        }
      } else {
        setError(result.message || 'Error al descargar el video');
        toast.error('Error al descargar el video');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al conectar con el servidor. Por favor, inténtalo de nuevo más tarde.');
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 4, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Descarga videos de Instagram, TikTok y Facebook
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Simplemente pega la URL del video que deseas descargar y haz clic en el botón de descarga.
          Soportamos videos de Instagram, TikTok y Facebook.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="url"
            label="URL del video"
            name="url"
            autoComplete="off"
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="quality-label">Calidad</InputLabel>
            <Select
              labelId="quality-label"
              id="quality"
              value={quality}
              label="Calidad"
              onChange={(e) => setQuality(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="best">Mejor calidad</MenuItem>
              <MenuItem value="medium">Calidad media</MenuItem>
              <MenuItem value="worst">Calidad baja</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <DownloadIcon />}
            disabled={loading || !url}
            sx={{ py: 1.5 }}
          >
            {loading ? 'Descargando...' : 'Descargar Video'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VideoForm; 