import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import iaService from '../services/iaService';
import googleAiService from '../services/googleAiService';
import { toast } from 'sonner';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Función auxiliar para usar el servicio local (búsqueda de diseños)
  const useLocalAIService = async (message) => {
    try {
      const response = await iaService.buscarAsistido({ prompt: message });

      let botResponse;
      if (response.data && response.data.length > 0) {
        const disenos = response.data.slice(0, 3);
        botResponse = {
          id: Date.now() + 1,
          text: `¡Encontré ${response.data.length} diseños relacionados! Aquí te muestro algunos:\n\n${disenos.map(d => `• ${d.nombre} - $${d.precio}${d.gratuito ? ' (Gratis)' : ''}`).join('\n')}\n\n💡 Usa el buscador del catálogo para ver más resultados.`,
          sender: 'bot',
          timestamp: new Date(),
          disenos: disenos
        };
      } else {
        botResponse = {
          id: Date.now() + 1,
          text: 'No encontré diseños exactos con esa descripción. Prueba a buscar en el catálogo usando términos como "Arduino", "sensor", o filtrando por categorías.',
          sender: 'bot',
          timestamp: new Date()
        };
      }

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      // Manejar errores de autenticación específicamente
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        const authErrorResponse = {
          id: Date.now() + 1,
          text: 'Para buscar diseños en el catálogo necesitas iniciar sesión. Mientras tanto, puedo responder preguntas técnicas sobre electrónica.',
          sender: 'bot',
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, authErrorResponse]);
        return;
      }

      throw error;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Debug: verificar disponibilidad de Google AI
      console.log('Google AI available?', googleAiService.isAvailable());

      // Verificar si Google AI está disponible
      if (googleAiService.isAvailable()) {
        try {
          // Analizar intención del mensaje
          const intentResult = await googleAiService.analyzeIntent(currentInput);
          const intent = intentResult?.intent || 'general';

          // Intenciones de búsqueda de productos → usar servicio local
          const searchIntents = ['buscar_producto', 'precio', 'categoria', 'disponibilidad'];

          if (searchIntents.includes(intent)) {
            // Búsqueda de productos → usar backend local
            await useLocalAIService(currentInput);
          } else {
            // Preguntas generales/técnicas → usar Google AI
            const context = [...messages.slice(-6), userMessage];
            const aiResponse = await googleAiService.generateChatResponse(currentInput, context);

            const botResponse = {
              id: Date.now() + 1,
              text: aiResponse,
              sender: 'bot',
              timestamp: new Date()
            };

            setMessages(prev => [...prev, botResponse]);
          }
        } catch (googleError) {
          console.warn('Google AI falló, usando servicio local:', googleError.message);
          // Fallback al servicio local
          await useLocalAIService(currentInput);
        }
      } else {
        // Google AI no disponible → usar servicio local
        await useLocalAIService(currentInput);
      }
    } catch (error) {
      // Mensaje de error genérico para otros problemas
      const errorResponse = {
        id: Date.now() + 1,
        text: 'Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickResponses = [
    '¿Qué diseños de Arduino tienen?',
    'Explícame la ley de Ohm',
    '¿Cómo medir temperatura con un sensor?',
    '¿Cuánto es 1+1?'
  ];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110 ${isOpen
            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600'
            } text-white`}
          title="Asistente IA de InnovCircuit"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 h-[28rem] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <h3 className="font-semibold">Asistente IA</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-teal-100 mt-1">
              Experto en electrónica y circuitos
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3">
            {/* Mensaje de bienvenida */}
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-4">
                <Bot className="h-12 w-12 mx-auto mb-3 text-teal-500" />
                <p className="text-sm mb-2">¡Hola! Soy tu asistente de InnovCircuit</p>
                <p className="text-xs text-gray-400 mb-3">
                  Puedo ayudarte con electrónica, circuitos y diseños
                </p>
                <div className="space-y-2">
                  {quickResponses.map((response, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(response)}
                      className="block w-full text-left text-xs bg-gray-100 hover:bg-gray-200 rounded-lg p-2 transition-colors"
                    >
                      {response}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${message.sender === 'user'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
                    : message.isError
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'bot' && (
                      <Bot className={`h-4 w-4 mt-0.5 flex-shrink-0 ${message.isError ? 'text-amber-500' : 'text-teal-500'}`} />
                    )}
                    <div>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                    </div>
                    {message.sender === 'user' && (
                      <User className="h-4 w-4 text-white opacity-70 mt-0.5 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-teal-500" />
                    <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                    <span className="text-sm text-gray-600">Pensando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input - siempre visible (chat abierto para todos) */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-2 hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
