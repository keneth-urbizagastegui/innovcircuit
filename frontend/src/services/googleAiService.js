import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuración de Google AI
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.warn('Google API key no configurada. El chatbot usará el servicio de IA local.');
}

const genAI = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null;

// Modelo de Gemini para conversaciones
const model = genAI?.getGenerativeModel({ model: 'gemini-pro' });

const googleAiService = {
  /**
   * Genera una respuesta de chat usando Google Gemini
   * @param {string} message - Mensaje del usuario
   * @param {Array} context - Contexto de la conversación previa
   * @returns {Promise<string>} - Respuesta generada
   */
  generateChatResponse: async (message, context = []) => {
    if (!model) {
      throw new Error('Google AI no está configurada');
    }

    try {
      // Construir el prompt con contexto del sistema
      const systemPrompt = `Eres un asistente especializado en electrónica y diseños de hardware para InnovCircuit. 
      Ayudas a los usuarios a encontrar diseños electrónicos, proyectos DIY, sensores, microcontroladores, y otros componentes.
      Responde de manera amigable, profesional y en español.
      Si te preguntan sobre productos específicos, menciona que pueden explorar el catálogo.
      Mantén respuestas concisas pero útiles.`;

      // Construir historial de conversación
      let conversationHistory = '';
      if (context.length > 0) {
        conversationHistory = context.map(msg => 
          `${msg.sender === 'user' ? 'Usuario' : 'Asistente'}: ${msg.text}`
        ).join('\n') + '\n';
      }

      const fullPrompt = `${systemPrompt}\n\n${conversationHistory}Usuario: ${message}\nAsistente:`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return text.trim();
    } catch (error) {
      console.error('Error generando respuesta con Google AI:', error);
      throw new Error('No se pudo generar la respuesta');
    }
  },

  /**
   * Analiza el intent del mensaje del usuario
   * @param {string} message - Mensaje del usuario
   * @returns {Promise<Object>} - Objeto con intent y entidades
   */
  analyzeIntent: async (message) => {
    if (!model) {
      return { intent: 'general', entities: {} };
    }

    try {
      const intentPrompt = `Analiza este mensaje y clasifica el intent:\n"${message}"\n\nCategorías de intent:\n- buscar_producto: busca productos o diseños específicos\n- precio: pregunta sobre precios\n- categoria: pregunta por categorías\n- disponibilidad: pregunta si hay stock o disponibilidad\n- ayuda: solicita ayuda general\n- general: otros temas\n\nResponde SOLO con un JSON así:\n{"intent": "categoría", "entities": {"producto": "nombre si hay", "categoria": "categoría si hay"}}`;

      const result = await model.generateContent(intentPrompt);
      const response = await result.response;
      const text = response.text().trim();

      try {
        return JSON.parse(text);
      } catch {
        return { intent: 'general', entities: {} };
      }
    } catch (error) {
      console.error('Error analizando intent:', error);
      return { intent: 'general', entities: {} };
    }
  },

  /**
   * Genera sugerencias de búsqueda basadas en el mensaje
   * @param {string} message - Mensaje del usuario
   * @returns {Promise<Array>} - Array de sugerencias
   */
  generateSearchSuggestions: async (message) => {
    if (!model) {
      return [];
    }

    try {
      const suggestionsPrompt = `Basándome en este mensaje: "${message}", genera 3 sugerencias de búsqueda relevantes para productos electrónicos o diseños de hardware.\n\nResponde SOLO con un array JSON así:\n["sugerencia 1", "sugerencia 2", "sugerencia 3"]`;

      const result = await model.generateContent(suggestionsPrompt);
      const response = await result.response;
      const text = response.text().trim();

      try {
        return JSON.parse(text);
      } catch {
        return [];
      }
    } catch (error) {
      console.error('Error generando sugerencias:', error);
      return [];
    }
  },

  /**
   * Verifica si Google AI está disponible
   * @returns {boolean}
   */
  isAvailable: () => {
    return !!model;
  }
};

export default googleAiService;