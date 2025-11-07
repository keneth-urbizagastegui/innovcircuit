import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

/**
 * Reusable confirmation dialog
 * Props:
 * - open: boolean
 * - title: string
 * - message: string (supports plain text)
 * - confirmText: string (default: 'Confirmar')
 * - cancelText: string (default: 'Cancelar')
 * - onConfirm: function
 * - onCancel: function
 */
const ConfirmDialog = ({ open, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="confirm-dialog-title">
      {title && <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>}
      {message && (
        <DialogContent>
          <Typography variant="body1">{message}</Typography>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onCancel} color="inherit">{cancelText}</Button>
        <Button onClick={onConfirm} variant="contained" color="error">{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;