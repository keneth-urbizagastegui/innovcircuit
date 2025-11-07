import React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';

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
    <Dialog open={open} onClose={onCancel}>
      {title && (
        <DialogHeader>
          <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
        </DialogHeader>
      )}
      {message && (
        <DialogDescription>{message}</DialogDescription>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} aria-label={cancelText}>
          {cancelText}
        </Button>
        <Button variant="destructive" onClick={onConfirm} aria-label={confirmText}>
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ConfirmDialog;