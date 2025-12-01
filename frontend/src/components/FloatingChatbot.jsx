import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import iaService from '../services/iaService';
import googleAiService from '../services/googleAiService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { isAuthenticated } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Función auxiliar para usar el servicio local como fallback
  const useLocalAIService = async (message) => {
    try {
      const response = await iaService.buscarAsistido({ prompt: message });
      
      let botResponse;
      if (response.data && response.data.length > 0) {
        const disenos = response.data.slice(0, 3);
        botResponse = {
          id: Date.now() + 1,
          text: `¡Encontré ${response.data.length} diseños relacionados! Aquí te muestro algunos:\n\n${disenos.map(d => `• ${d.nombre} - $${d.precio}${d.gratuito ? ' (Gratis)' : ''}`).join('\n')}`,
          sender: 'bot',
          timestamp: new Date(),
          disenos: disenos
        };
      } else {
        botResponse = {
          id: Date.now() + 1,
          text: 'No encontré diseños exactos con esa descripción, pero puedo ayudarte a explorar nuestras categorías o buscar algo más específico. ¿Qué tipo de proyecto electrónico estás buscando?',
          sender: 'bot',
          timestamp: new Date()
        };
      }
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error en useLocalAIService:', error);

      throw error;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!isAuthenticated) {
      toast.error('Por favor inicia sesión para usar el chatbot');
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Primero intentar con Google AI si está disponible
      if (googleAiService.isAvailable()) {
        try {
          // Obtener contexto de mensajes previos (últimos 5 mensajes)
          const context = messages.slice(-5);
          const aiResponse = await googleAiService.generateChatResponse(inputMessage, context);
          
          const botResponse = {
            id: Date.now() + 1,
            text: aiResponse,
            sender: 'bot',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botResponse]);
        } catch (googleError) {
          console.warn('Google AI falló, usando servicio local:', googleError);
          // Fallback al servicio local
          await useLocalAIService(inputMessage);
        }
      } else {
        // Usar servicio local si Google AI no está disponible
        await useLocalAIService(inputMessage);
      }
    } catch (error) {
      const errorResponse = {
        id: Date.now() + 1,
        text: 'Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo o contacta a soporte si el problema persiste.',
        sender: 'bot',
        timestamp: new Date()
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
    '¿Qué diseños tienes de Arduino?',
    'Muéstrame sensores de temperatura',
    '¿Tienes proyectos de IoT?',
    'Diseños gratuitos por favor'
  ];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110 ${
            isOpen 
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
              : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600'
          } text-white`}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
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
            <p className="text-xs text-teal-100 mt-1">Pregúntame sobre diseños electrónicos</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <Bot className="h-12 w-12 mx-auto mb-3 text-teal-500" />
                <p className="text-sm mb-4">¡Hola! Soy tu asistente de InnovCircuit</p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Puedes preguntarme:</p>
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
                  className={`max-w-xs rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'bot' && (
                      <Bot className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
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
                    <span className="text-sm text-gray-600">Buscando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
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