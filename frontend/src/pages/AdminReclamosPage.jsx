import React, { useEffect, useState } from 'react'
import adminService from '../services/adminService'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Loader2 } from 'lucide-react'

const AdminReclamosPage = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resolvingId, setResolvingId] = useState(null)

  const cargar = () => {
    setLoading(true)
    setError('')
    adminService.getReclamos()
      .then(res => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Error al cargar reclamos.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const resolver = (id, aceptar) => {
    setError('')
    setResolvingId(id)
    adminService.resolverReclamo(id, aceptar)
      .then(() => cargar())
      .catch(() => setError('No se pudo resolver el reclamo.'))
      .finally(() => setResolvingId(null))
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Reclamos de Clientes (En revisión)</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando reclamos...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Reclamos de Clientes (En revisión)</CardTitle>
        </CardHeader>
        {error && (
          <div className="mx-4 mb-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        <CardContent className="p-0">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">ID</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Fecha Compra</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Diseño</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Cliente</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Proveedor</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Monto</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Motivo del Reclamo</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-3 py-4 text-center text-slate-500">No hay reclamos.</td>
                  </tr>
                )}
                {items.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">{r.id}</td>
                    <td className="px-3 py-2">{r.fechaVenta ? new Date(r.fechaVenta).toLocaleDateString() : '-'}</td>
                    <td className="px-3 py-2">{r.disenoNombre || '-'}</td>
                    <td className="px-3 py-2">{r.clienteNombre || '-'}</td>
                    <td className="px-3 py-2">{r.proveedorNombre || '-'}</td>
                    <td className="px-3 py-2">S/{Number(r.montoProveedor || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 max-w-lg break-words">{r.motivoReclamo || '-'}</td>
                    <td className="px-3 py-2 text-right space-x-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={resolvingId === r.id}
                        onClick={() => resolver(r.id, true)}
                      >
                        {resolvingId === r.id ? 'Procesando...' : 'Aceptar Reembolso'}
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        disabled={resolvingId === r.id}
                        onClick={() => resolver(r.id, false)}
                      >
                        {resolvingId === r.id ? 'Procesando...' : 'Rechazar Reclamo'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminReclamosPage
