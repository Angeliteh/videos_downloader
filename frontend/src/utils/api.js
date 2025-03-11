import axios from 'axios';

// Configuración base de axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Funciones para interactuar con la API
export const downloadVideo = async (url, quality = 'best') => {
  try {
    const response = await api.post('/download', { url, quality });
    return response.data;
  } catch (error) {
    console.error('Error al descargar el video:', error);
    throw error;
  }
};

export const getHistory = async () => {
  try {
    const response = await api.get('/history');
    return response.data;
  } catch (error) {
    console.error('Error al obtener el historial:', error);
    throw error;
  }
};

export const deleteFromHistory = async (filename) => {
  try {
    const response = await api.delete(`/history/${filename}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar del historial:', error);
    throw error;
  }
};

export default api; 