import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import categoriaService from '../services/categoriaService';
import apiClient from '../services/api';
import { TextField, Button, Checkbox, FormControlLabel, Select, MenuItem, InputLabel, FormControl, Typography, Box, CircularProgress, Alert } from '@mui/material';

const SubirDisenoPage = () => {
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState(0.0);
  const [gratuito, setGratuito] = useState(false);
  const [categoriaId, setCategoriaId] = useState('');
  const [imagenFile, setImagenFile] = useState(null);
  const [esquematicoFile, setEsquematicoFile] = useState(null);

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Cargar categorías para el dropdown
  useEffect(() => {
    categoriaService
      .listarCategorias()
      .then((response) => setCategorias(response.data))
      .catch(() => setError('No se pudieron cargar las categorías.'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!imagenFile || !esquematicoFile) {
      setError('Debes subir ambos archivos (imagen y esquemático).');
      setLoading(false);
      return;
    }

    // 1. Crear el DTO (JSON como string)
    const disenoDTO = JSON.stringify({
      nombre,
      descripcion,
      precio: gratuito ? 0 : precio,
      gratuito,
      categoriaId,
    });

    // 2. Crear el FormData
    const formData = new FormData();
    formData.append('disenoDTO', disenoDTO);
    formData.append('imagenFile', imagenFile);
    formData.append('esquematicoFile', esquematicoFile);

    try {
      // 3. Enviar con apiClient (el interceptor añade el token)
      // Importante: NO establecer manualmente Content-Type para FormData, axios lo gestiona con boundary
      const response = await apiClient.post('/disenos', formData);

      setSuccess(`¡Diseño '${response.data.nombre}' subido! Estado: ${response.data.estado}.`);
      setLoading(false);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Error al subir el diseño.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Subir Nuevo Diseño
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <TextField
        label="Nombre del Diseño"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        fullWidth
        required
        margin="normal"
      />

      <TextField
        label="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        fullWidth
        multiline
        rows={4}
        margin="normal"
      />

      <TextField
        label="Precio"
        type="number"
        value={precio}
        onChange={(e) => setPrecio(parseFloat(e.target.value))}
        fullWidth
        required
        margin="normal"
        disabled={gratuito}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={gratuito}
            onChange={(e) => {
              const isFree = e.target.checked;
              setGratuito(isFree);
              if (isFree) setPrecio(0);
            }}
          />
        }
        label="Es gratuito (precio será 0)"
      />

      <FormControl fullWidth margin="normal" required>
        <InputLabel>Categoría</InputLabel>
        <Select value={categoriaId} label="Categoría" onChange={(e) => setCategoriaId(e.target.value)}>
          {categorias.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" component="label" fullWidth sx={{ my: 1 }}>
        {imagenFile ? `Imagen: ${imagenFile.name}` : 'Subir Imagen Principal (PNG/JPG)'}
        <input type="file" accept="image/*" hidden onChange={(e) => setImagenFile(e.target.files[0])} />
      </Button>

      <Button variant="contained" component="label" fullWidth sx={{ my: 1 }}>
        {esquematicoFile ? `Esquemático: ${esquematicoFile.name}` : 'Subir Archivo de Diseño (ZIP/RAR)'}
        <input type="file" accept=".zip,.rar" hidden onChange={(e) => setEsquematicoFile(e.target.files[0])} />
      </Button>

      <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ mt: 2 }} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Subir Diseño'}
      </Button>
    </Box>
  );
};

export default SubirDisenoPage;