import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import disenoService from '../services/disenoService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Avatar } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Heart, Download, Loader2 } from 'lucide-react';
import resenaService from '../services/resenaService';
import { resolveImageUrl, resolveAvatarUrl, buildUiAvatar, FALLBACK_IMAGE, FALLBACK_AVATAR, onErrorSetSrc } from '../utils/imageUtils';
import { formatCurrencyPEN } from '../utils/currency';
import iaService from '../services/iaService';
import preguntaService from '../services/preguntaService';
import { Textarea } from '../components/ui/textarea';

// Simple componente para mostrar calificación con estrellas
const StarRating = ({ value }) => {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className="text-yellow-500 text-sm">{'★'.repeat(v)}{'☆'.repeat(5 - v)}</span>
  );
};

const DisenoDetallePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const cart = useCart();
  const [diseno, setDiseno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Reseñas
  const [resenas, setResenas] = useState([]);
  const [resenasLoading, setResenasLoading] = useState(true);
  const [resenasError, setResenasError] = useState('');
  // Responder reseñas (Proveedor)
  const [respuestaInputs, setRespuestaInputs] = useState({}); // { [resenaId]: string }
  const [responding, setResponding] = useState({}); // { [resenaId]: boolean }
  // Formulario nueva reseña (solo CLIENTE)
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Q&A
  const [preguntas, setPreguntas] = useState([]);
  const [preguntasLoading, setPreguntasLoading] = useState(true);
  const [preguntasError, setPreguntasError] = useState('');
  // Formulario nueva pregunta (solo AUTENTICADO)
  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [submittingPregunta, setSubmittingPregunta] = useState(false);
  // Responder preguntas (PROVEEDOR)
  const [respuestaPreguntaInputs, setRespuestaPreguntaInputs] = useState({});
  const [respondingPregunta, setRespondingPregunta] = useState({});

  // IA Chatbot modal state
  const [iaOpen, setIaOpen] = useState(false);
  const [iaMessages, setIaMessages] = useState([]); // { sender: 'user'|'ai', text }
  const [iaQuestion, setIaQuestion] = useState('');
  const [iaSending, setIaSending] = useState(false);
  const [iaError, setIaError] = useState('');

  const cargarDiseno = () => {
    setLoading(true);
    disenoService.getDisenoById(id)
      .then(response => setDiseno(response.data))
      .catch(() => setError('Error al cargar el diseño.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarDiseno();
    cargarResenas();
    cargarPreguntas();
  }, [id]);

  const handleLike = () => {
    disenoService.darLike(id)
      .then(() => cargarDiseno())
      .catch(() => setError("Error al procesar el 'like'"));
  };

  const handleDownload = () => {
    disenoService.descargar(id)
      .then(response => {
        const url = response?.data?.url;
        if (url) {
          window.open(url, '_blank');
        } else {
          setError('Este diseño no tiene archivo para descargar.');
        }
        cargarDiseno();
      })
      .catch(() => setError('Error al registrar la descarga.'));
  };

  const cargarResenas = () => {
    setResenasLoading(true);
    setResenasError('');
    resenaService.getResenasPorDiseno(id)
      .then(response => {
        setResenas(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => setResenasError('Error al cargar las reseñas.'))
      .finally(() => setResenasLoading(false));
  };

  const cargarPreguntas = () => {
    setPreguntasLoading(true);
    setPreguntasError('');
    preguntaService.getPreguntasPorDiseno(id)
      .then(response => {
        setPreguntas(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => setPreguntasError('Error al cargar las preguntas.'))
      .finally(() => setPreguntasLoading(false));
  };

  const handleResponderResena = async (resenaId) => {
    const texto = (respuestaInputs[resenaId] || '').trim();
    if (!texto) return;
    setResponding(prev => ({ ...prev, [resenaId]: true }));
    try {
      await resenaService.responderResena(resenaId, { respuesta: texto });
      // Limpia input y recarga reseñas
      setRespuestaInputs(prev => ({ ...prev, [resenaId]: '' }));
      cargarResenas();
    } catch (err) {
      console.error('Error al responder reseña', err);
    } finally {
      setResponding(prev => ({ ...prev, [resenaId]: false }));
    }
  };

  const handleCrearResena = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const payload = { disenoId: Number(id), calificacion, comentario };
    resenaService.crearResena(payload)
      .then(() => {
        setComentario('');
        setCalificacion(0);
        cargarResenas();
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Error al crear la reseña.';
        setError(msg);
      })
      .finally(() => setSubmitting(false));
  };

  const handleCrearPregunta = (e) => {
    e.preventDefault();
    if (!nuevaPregunta.trim()) return;
    setSubmittingPregunta(true);
    setPreguntasError('');
    const payload = { disenoId: Number(id), textoPregunta: nuevaPregunta };
    preguntaService.crearPregunta(payload)
      .then(() => {
        setNuevaPregunta('');
        cargarPreguntas(); // Recargar lista
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Error al enviar la pregunta.';
        setPreguntasError(msg);
      })
      .finally(() => setSubmittingPregunta(false));
  };

  const handleResponderPregunta = async (preguntaId) => {
    const texto = (respuestaPreguntaInputs[preguntaId] || '').trim();
    if (!texto) return;
    setRespondingPregunta(prev => ({ ...prev, [preguntaId]: true }));
    try {
      await preguntaService.responderPregunta(preguntaId, { textoRespuesta: texto });
      setRespuestaPreguntaInputs(prev => ({ ...prev, [preguntaId]: '' }));
      cargarPreguntas(); // Recargar lista
    } catch (err) {
      console.error('Error al responder pregunta', err);
    } finally {
      setRespondingPregunta(prev => ({ ...prev, [preguntaId]: false }));
    }
  };

  const handleAddToCart = () => {
    if (diseno) cart.addItem(diseno);
  };

  const handleOpenIa = () => {
    setIaOpen(true);
    setIaError('');
  };

  const handleCloseIa = () => {
    setIaOpen(false);
  };

  const handleIaSend = async () => {
    const pregunta = iaQuestion.trim();
    if (!pregunta) return;
    setIaSending(true);
    setIaError('');
    // Añade mensaje del usuario
    setIaMessages((prev) => [...prev, { sender: 'user', text: pregunta }]);
    try {
      const response = await iaService.chatbotDiseno(id, { pregunta });
      const texto = response?.data?.respuesta || 'Sin respuesta.';
      setIaMessages((prev) => [...prev, { sender: 'ai', text: texto }]);
      setIaQuestion('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al consultar el asistente de diseño.';
      setIaError(msg);
    } finally {
      setIaSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3">
        {error}
      </div>
    );
  }
  if (!diseno) {
    return <div>Diseño no encontrado.</div>;
  }

  const proveedor = diseno.proveedor || { nombre: 'N/A', avatarUrl: '' };
  const mainImageSrc = resolveImageUrl(diseno.imagenUrl) || FALLBACK_IMAGE;
  const avatarSrc = resolveAvatarUrl(proveedor.avatarUrl, proveedor.nombre, 40, { rounded: true });
  const popular = Number(diseno.descargasCount || 0) >= 25;
  const isGratis = Boolean(diseno.gratuito) || Number(diseno.precio || 0) === 0;

  return (
      <div className="mx-auto max-w-7xl px-4 py-6">
    <Card className="p-4 md:p-6">
      <CardContent className="p-0">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Columna Izquierda (Imagen) */}
          <div>
            <img
              className="w-full aspect-[4/3] object-cover rounded-md bg-gray-100"
              alt={diseno.nombre}
              src={mainImageSrc}
              loading="lazy"
              onError={onErrorSetSrc(FALLBACK_IMAGE)}
            />
          </div>

          {/* Columna Derecha (Info) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{diseno.nombre}</h1>
              {popular && <Badge variant="secondary">Popular</Badge>}
            </div>

            {/* Info del Proveedor */}
            <Link to={`/store/${proveedor.id}`} className="flex items-center mb-3 group">
              <Avatar className="mr-2 border" src={avatarSrc} alt={proveedor.nombre}>
                {(proveedor.nombre || 'N/A').slice(0, 2).toUpperCase()}
              </Avatar>
              <div className="text-lg font-semibold group-hover:underline">{proveedor.nombre}</div>
            </Link>

            {/* Estadísticas */}
            <div className="flex gap-4 mb-4">
              <Button variant="outline" onClick={handleLike}>
                <Heart className="mr-2 h-4 w-4" /> {diseno.likesCount} Likes
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> {diseno.descargasCount} Descargas
              </Button>
            </div>

            {/* Precio */}
  <div className={`text-2xl font-bold my-2 ${isGratis ? 'text-green-600' : 'text-slate-800'}`}>
    {isGratis ? 'Gratis' : formatCurrencyPEN(diseno.precio)}
  </div>

            {/* Botones de Acción (solo para Clientes) */}
            {user?.rol === 'CLIENTE' && (
              <Button className="w-full" onClick={handleAddToCart}>
                Añadir al Carrito
              </Button>
            )}

            {/* Botón Asistente de Diseño (IA) - requiere autenticación */}
            {user && (
              <Button variant="secondary" className="w-full mt-2" onClick={handleOpenIa}>
                Asistente de Diseño (IA)
              </Button>
            )}
          </div>
        </div>

        {/* Especificaciones */}
        <div className="mt-6 md:w-1/2">
          <h2 className="text-lg font-semibold">Especificaciones</h2>
          <div className="my-2 h-px bg-gray-200" />
          <ul className="space-y-1 text-sm">
            {diseno?.nombreCategoria && (
              <li className="flex justify-between"><span className="font-medium">Categoría</span><span>{diseno.nombreCategoria}</span></li>
            )}
            {diseno?.estado && (
              <li className="flex justify-between"><span className="font-medium">Estado</span><span>{diseno.estado}</span></li>
            )}
            <li className="flex justify-between"><span className="font-medium">Tipo</span><span>{isGratis ? 'Gratis' : 'De pago'}</span></li>
            <li className="flex justify-between"><span className="font-medium">Likes</span><span>{String(diseno.likesCount || 0)}</span></li>
            <li className="flex justify-between"><span className="font-medium">Descargas</span><span>{String(diseno.descargasCount || 0)}</span></li>
          </ul>
        </div>

        {/* Descripción (Abajo) */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Descripción</h2>
          <div className="my-2 h-px bg-gray-200" />
          <p className="text-sm leading-6">
            {diseno.descripcion || 'Este diseño no tiene descripción.'}
          </p>
        </div>

        {/* Reseñas */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Reseñas</h2>
          <div className="my-2 h-px bg-gray-200" />

          {resenasLoading ? (
            <div className="flex justify-center mt-2"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : resenasError ? (
            <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3">{resenasError}</div>
          ) : resenas.length === 0 ? (
            <div className="text-sm text-gray-600">Aún no hay reseñas para este diseño.</div>
          ) : (
            <ul className="space-y-4">
              {resenas.map((r) => (
                <li key={r.id} className="">
                  <div className="flex items-start gap-3">
                    <Avatar src={buildUiAvatar(r?.clienteNombre || 'Usuario', 32, { rounded: true })} alt={r?.clienteNombre || 'Usuario'}>
                      {(r?.clienteNombre || 'US').slice(0,2).toUpperCase()}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{r?.nombreCliente || r?.clienteNombre || 'Cliente'}</div>
                        <StarRating value={r?.calificacion} />
                      </div>
                      <div className="text-sm text-gray-700">{r?.comentario || ''}</div>

                      {/* Respuesta del proveedor existente */}
                      {r?.respuestaProveedor && (
                        <div className="mt-2 ml-4 p-2 border-l-4 border-slate-300 bg-gray-50 rounded">
                          <div className="text-sm font-semibold">Respuesta del proveedor:</div>
                          <div className="text-sm">{r.respuestaProveedor}</div>
                        </div>
                      )}

                      {/* Formulario de respuesta para el proveedor dueño del diseño */}
                      {user?.id === diseno?.proveedor?.id && !r?.respuestaProveedor && (
                        <div className="mt-2 ml-4 flex gap-2">
                          <Input
                            placeholder="Escribe tu respuesta..."
                            value={respuestaInputs[r.id] || ''}
                            onChange={(e) => setRespuestaInputs(prev => ({ ...prev, [r.id]: e.target.value }))}
                          />
                          <Button onClick={() => handleResponderResena(r.id)} disabled={responding[r.id]}>
                            {responding[r.id] ? 'Enviando...' : 'Responder'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Formulario de Nueva Reseña - Solo CLIENTE */}
        {user?.rol === 'CLIENTE' && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Escribir una Reseña</h3>
            <div className="my-2 h-px bg-gray-200" />
            {error && (
              <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3 mb-2">{error}</div>
            )}
            <form onSubmit={handleCrearResena} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Calificación:</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={calificacion}
                  onChange={(e) => setCalificacion(Number(e.target.value))}
                >
                  <option value={0}>Selecciona</option>
                  {[1,2,3,4,5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Comentario</label>
                <textarea
                  className="border rounded px-3 py-2 text-sm min-h-[100px]"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={submitting || calificacion === 0}>
                {submitting ? 'Enviando...' : 'Enviar Reseña'}
              </Button>
            </form>
          </div>
        )}
        {/* ----- INICIO SECCIÓN Q&A ----- */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Preguntas y Respuestas</h2>
          <div className="my-2 h-px bg-gray-200" />
          {preguntasLoading ? (
            <div className="flex justify-center mt-2"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : preguntasError ? (
            <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3">{preguntasError}</div>
          ) : (
            <ul className="space-y-4">
              {preguntas.length === 0 && (
                <div className="text-sm text-gray-600">Aún no hay preguntas para este diseño.</div>
              )}
              {preguntas.map((p) => (
                <li key={p.id} className="">
                  <div className="flex items-start gap-3">
                    <Avatar src={buildUiAvatar(p?.nombreUsuarioPregunta || p?.clienteNombre || 'U', 32, { rounded: true })} alt={p?.nombreUsuarioPregunta || p?.clienteNombre || 'Usuario'}>
                      {(p?.nombreUsuarioPregunta || p?.clienteNombre || 'US').slice(0,2).toUpperCase()}
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{p?.nombreUsuarioPregunta || p?.clienteNombre || 'Usuario'}</div>
                      <div className="text-sm text-gray-700">{p?.textoPregunta || ''}</div>
                      {/* Respuesta del proveedor */}
                      {p?.textoRespuesta ? (
                        <div className="mt-2 ml-4 p-2 border-l-4 border-slate-300 bg-gray-50 rounded">
                          <div className="text-sm font-semibold">Respuesta de {p?.nombreProveedorRespuesta || p?.proveedorNombre || 'Proveedor'}:</div>
                          <div className="text-sm">{p.textoRespuesta}</div>
                        </div>
                      ) : (
                        /* Formulario de respuesta para el proveedor dueño */
                        user?.id === diseno?.proveedor?.id && (
                          <div className="mt-2 ml-4 flex gap-2">
                            <Input
                              placeholder="Escribe tu respuesta..."
                              value={respuestaPreguntaInputs[p.id] || ''}
                              onChange={(e) => setRespuestaPreguntaInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                            />
                            <Button onClick={() => handleResponderPregunta(p.id)} disabled={respondingPregunta[p.id]}>
                              {respondingPregunta[p.id] ? '...' : 'Responder'}
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Formulario de Nueva Pregunta - Solo AUTENTICADOS */}
        {user && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Haz una Pregunta</h3>
            <div className="my-2 h-px bg-gray-200" />
            <form onSubmit={handleCrearPregunta} className="flex flex-col gap-3">
              <Textarea
                rows={3}
                value={nuevaPregunta}
                onChange={(e) => setNuevaPregunta(e.target.value)}
                placeholder="Escribe tu pregunta técnica sobre el diseño..."
              />
              <Button type="submit" disabled={submittingPregunta || !nuevaPregunta.trim()} className="self-start">
                {submittingPregunta ? 'Enviando...' : 'Enviar Pregunta'}
              </Button>
            </form>
          </div>
        )}
        {/* ----- FIN SECCIÓN Q&A ----- */}

      </CardContent>
    </Card>
    {/* Dialog: Asistente de Diseño (IA) */}
    <Dialog open={iaOpen} onClose={handleCloseIa} className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Asistente de Diseño (IA)</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        {iaError && (
          <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3 mb-2">{iaError}</div>
        )}
        <div className="border rounded p-3 h-[300px] overflow-y-auto mb-3 bg-gray-50">
          {iaMessages.length === 0 ? (
            <div className="text-sm text-gray-600">Inicia la conversación con una pregunta técnica sobre este diseño.</div>
          ) : (
            iaMessages.map((m, idx) => (
              <div key={idx} className={`flex mb-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded ${m.sender === 'user' ? 'bg-slate-100' : 'bg-gray-200'}`}>
                  <div className="text-sm">{m.text}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogDescription>
      <DialogFooter>
        <div className="flex w-full gap-2">
          <Input
            placeholder="Escribe tu pregunta..."
            value={iaQuestion}
            onChange={(e) => setIaQuestion(e.target.value)}
            disabled={iaSending}
          />
          <Button onClick={handleIaSend} disabled={iaSending || !iaQuestion.trim()}>
            {iaSending ? 'Enviando...' : 'Enviar'}
          </Button>
          <Button variant="outline" onClick={handleCloseIa}>Cerrar</Button>
        </div>
      </DialogFooter>
    </Dialog>
    </div>
  );
};

export default DisenoDetallePage;