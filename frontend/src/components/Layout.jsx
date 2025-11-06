import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Button, CssBaseline, Badge, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Layout = () => {
  const auth = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          {/* Título/Logo */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, color: 'white', textDecoration: 'none' }}
          >
            InnovCircuit
          </Typography>
          {/* Lógica de Autenticación */}
          {auth.isAuthenticated() ? (
            <>
              {/* Enlace al Dashboard para Cliente y Proveedor */}
              {(auth.user?.rol === 'CLIENTE' || auth.user?.rol === 'PROVEEDOR') && (
                <Button color="inherit" component={Link} to="/dashboard" sx={{ mr: 2 }}>
                  Mi Panel
                </Button>
              )}
              {/* Enlace visible para proveedores */}
              {auth.user?.rol === 'PROVEEDOR' && (
                <Button color="inherit" component={Link} to="/subir-diseno" sx={{ mr: 2 }}>
                  Subir Diseño
                </Button>
              )}
              {/* Enlace visible para clientes con ícono y badge */}
              {auth.user?.rol === 'CLIENTE' && (
                <IconButton color="inherit" component={Link} to="/carrito" sx={{ mr: 2 }}>
                  <Badge badgeContent={items?.length || 0} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
              )}
              {/* Enlace visible solo para administradores */}
              {auth.user?.rol === 'ADMINISTRADOR' && (
                <Button color="inherit" component={Link} to="/admin" sx={{ mr: 2 }}>
                  Panel de Admin
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Registro
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      {/* Contenedor principal donde se renderizarán las páginas */}
      <Container component="main" sx={{ mt: 4, mb: 4 }}>
        <Box>
          <Outlet />
        </Box>
      </Container>
    </>
  );
};

export default Layout;