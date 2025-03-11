import React from 'react';
import { Box, Container, Typography, Link, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {currentYear}
            {' '}
            <Link color="inherit" href="/">
              Descargador de Videos
            </Link>
            {' - Todos los derechos reservados.'}
          </Typography>

          <Box sx={{ mt: { xs: 2, md: 0 } }}>
            <IconButton
              color="primary"
              aria-label="GitHub"
              component="a"
              href="https://github.com/yourusername/video-downloader"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
            </IconButton>
            <IconButton
              color="primary"
              aria-label="LinkedIn"
              component="a"
              href="https://linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInIcon />
            </IconButton>
            <IconButton
              color="primary"
              aria-label="Twitter"
              component="a"
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Esta aplicación utiliza yt-dlp para descargar videos. No almacenamos ningún contenido protegido por derechos de autor.
            Utiliza esta herramienta de manera responsable y respeta los términos de servicio de las plataformas.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 