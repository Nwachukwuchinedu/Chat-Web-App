import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { GitHub } from '@mui/icons-material';

const BuiltByTag = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 25px rgba(0, 0, 0, 0.4)',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
        },
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 500,
          fontSize: '0.875rem',
        }}
      >
        Built by
      </Typography>
      <Link
        href="https://github.com/Nwachukwuchinedu"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          color: '#fff',
          textDecoration: 'none',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          fontSize: '0.875rem',
          '&:hover': {
            color: '#64B5F6',
            textDecoration: 'none',
          },
        }}
      >
        <GitHub sx={{ fontSize: '1rem' }} />
        Nwachukwuchinedu
      </Link>
    </Box>
  );
};

export default BuiltByTag; 