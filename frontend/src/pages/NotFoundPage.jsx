import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
      <p className="text-sm text-muted-foreground mb-4">La ruta solicitada no existe.</p>
      <Link to="/" className="text-primary hover:underline">Volver al catálogo</Link>
    </div>
  )
}

export default NotFoundPage
