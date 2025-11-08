import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import categoriaService from '../services/categoriaService'
import disenoService from '../services/disenoService'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Select } from '../components/ui/select'
import { Loader2 } from 'lucide-react'

const EditarDisenoPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState(0.0)
  const [gratuito, setGratuito] = useState(false)
  const [categoriaId, setCategoriaId] = useState('')

  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Cargar categorías para el dropdown
  useEffect(() => {
    categoriaService
      .listarCategorias()
      .then((response) => setCategorias(response.data))
      .catch(() => setError('No se pudieron cargar las categorías.'))
  }, [])

  // Cargar datos del diseño existente
  useEffect(() => {
    if (!id) return
    setPageLoading(true)
    disenoService
      .getDisenoById(id)
      .then((response) => {
        const diseno = response.data
        setNombre(diseno?.nombre ?? '')
        setDescripcion(diseno?.descripcion ?? '')
        setPrecio(Number(diseno?.precio ?? 0))
        setGratuito(Boolean(diseno?.gratuito))

        // Intentar mapear la categoría por nombre si está disponible
        if (categorias && categorias.length > 0 && diseno?.nombreCategoria) {
          const cat = categorias.find((c) => c.nombre === diseno.nombreCategoria)
          if (cat) setCategoriaId(cat.id)
        }
        setPageLoading(false)
      })
      .catch(() => {
        setError('Error al cargar los datos del diseño.')
        setPageLoading(false)
      })
  }, [id, categorias])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Construir DTO para edición
    const disenoDTO = {
      nombre,
      descripcion,
      precio: gratuito ? 0 : precio,
      gratuito,
      categoriaId,
    }

    try {
      const response = await disenoService.editarDiseno(id, disenoDTO)
      setSuccess(`¡Diseño '${response.data.nombre}' actualizado!`)
      setLoading(false)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Error al actualizar el diseño.'
      setError(msg)
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-2 text-slate-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando diseño…</span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[600px] mx-auto p-6 bg-white rounded-xl border border-border shadow-sm space-y-4">
      <h1 className="text-2xl font-semibold">Editar Diseño</h1>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Nombre del Diseño</label>
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <Textarea rows={8} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Precio</label>
        <Input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(parseFloat(e.target.value))}
          required
          disabled={gratuito}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="gratuito"
          type="checkbox"
          checked={gratuito}
          onChange={(e) => {
            const isFree = e.target.checked
            setGratuito(isFree)
            if (isFree) setPrecio(0)
          }}
          className="h-4 w-4 rounded border-slate-300"
        />
        <label htmlFor="gratuito" className="text-sm">Es gratuito (precio será 0)</label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Categoría</label>
        <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
          <option value="" disabled>Seleccione una categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </Select>
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full" loading={loading}>
          Guardar Cambios
        </Button>
      </div>
    </form>
  )
}

export default EditarDisenoPage