import React, { useState } from 'react';
import iaService from '../services/iaService';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import DisenoCard from './DisenoCard';

const IaSearchModal = ({ open, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await iaService.buscarAsistido({ prompt });
      setResults(response.data || []);
    } catch (err) {
      setError('Error al realizar la búsqueda asistida.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="w-[90%] sm:w-[800px] p-4">
      <DialogHeader>
        <DialogTitle>Búsqueda asistida por IA</DialogTitle>
        <DialogDescription>
          Describe tu diseño ideal y te sugeriremos opciones del catálogo.
        </DialogDescription>
      </DialogHeader>

      <div className="flex w-full gap-2 my-4">
        <Input
          placeholder="Describe tu diseño ideal..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handleSearch} disabled={loading || !prompt.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
        </Button>
      </div>

      {error && (
        <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="max-h-[50vh] overflow-y-auto hide-scrollbar p-1">
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((diseno) => (
              <DisenoCard key={diseno.id} diseno={diseno} />
            ))}
          </div>
        ) : (
          !loading && (
            <p className="text-sm text-gray-500 text-center">
              No se encontraron resultados para esta búsqueda.
            </p>
          )
        )}
      </div>
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onClose}>Cerrar</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default IaSearchModal;