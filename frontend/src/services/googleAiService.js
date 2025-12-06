import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuración de Google AI
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Solo mostrar warning en desarrollo
if (!GOOGLE_API_KEY && import.meta.env.DEV) {
  console.warn('Google API key no configurada. El chatbot usará el servicio de IA local.');
}

const genAI = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null;

// Lista de modelos a probar en orden de preferencia
// Se prueban diferentes variantes para asegurar compatibilidad con la API Key
const MODELS_TO_TRY = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.0-pro'];

const googleAiService = {
  /**
   * Helper privado para intentar generar contenido con múltiples modelos
   * @param {string} prompt - Prompt para la IA
   * @returns {Promise<any>} - Resultado de generateContent
   */
  _tryGenerate: async (prompt) => {
    if (!genAI) throw new Error('Google AI no configurada');

    let lastError = null;

    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result;
      } catch (error) {
        console.warn(`Fallo con modelo ${modelName}:`, error.message);
        lastError = error;
        // Si es 404 (modelo no encontrado) o 400, seguimos probando el siguiente
        continue;
      }
    }
    throw lastError || new Error('Todos los modelos de IA fallaron');
  },

  /**
   * Genera una respuesta de chat usando Google Gemini
   * @param {string} message - Mensaje del usuario
   * @param {Array} context - Contexto de la conversación previa
   * @returns {Promise<string>} - Respuesta generada
   */
  generateChatResponse: async (message, context = []) => {
    if (!genAI) {
      throw new Error('Google AI no está configurada');
    }

    try {
      // Prompt de sistema especializado en electrónica y circuitos
      const systemPrompt = `Eres el Asistente IA de InnovCircuit, experto en electrónica, diseño de circuitos, microcontroladores, sensores, IoT y hardware en general.

TUS CAPACIDADES:
1. Explicar conceptos de electrónica (ley de Ohm, fuentes conmutadas, filtros, amplificadores, reguladores, etc.)
2. Sugerir topologías de circuitos, componentes recomendados y buenas prácticas de diseño
3. Ayudar a depurar problemas de circuitos (ruido, alimentación, disipación térmica, interferencias, etc.)
4. Recomendar microcontroladores y plataformas según el proyecto (Arduino, ESP32, STM32, Raspberry Pi, etc.)
5. Asesorar sobre sensores, actuadores y protocolos de comunicación (I2C, SPI, UART, etc.)

INSTRUCCIONES:
- Responde siempre en español, de forma amigable y profesional
- Cuando expliques conceptos técnicos, usa ejemplos numéricos cuando sea útil
- Si el usuario pregunta por diseños disponibles en la tienda (como "muéstrame proyectos de Arduino", "sensores de temperatura disponibles"), responde de forma útil pero aclara que los resultados concretos dependen del catálogo. Sugiere: "Puedes buscar 'Arduino' o filtrar por categoría 'Microcontroladores' en el catálogo de InnovCircuit"
- Si la pregunta no es de electrónica (por ejemplo "cuánto es 1+1"), responde de forma breve y clara
- Mantén respuestas concisas pero completas`;

      // Construir historial de conversación
      let conversationHistory = '';
      if (context.length > 0) {
        conversationHistory = context.map(msg =>
          `${msg.sender === 'user' ? 'Usuario' : 'Asistente'}: ${msg.text}`
        ).join('\n') + '\n';
      }

      const fullPrompt = `${systemPrompt}\n\n${conversationHistory}Usuario: ${message}\nAsistente:`;

      const result = await googleAiService._tryGenerate(fullPrompt);
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
    if (!genAI) {
      return { intent: 'general', entities: {} };
    }

    try {
      const intentPrompt = `Analiza este mensaje y clasifica el intent:\n"${message}"\n\nCategorías de intent:\n- buscar_producto: busca productos o diseños específicos\n- precio: pregunta sobre precios\n- categoria: pregunta por categorías\n- disponibilidad: pregunta si hay stock o disponibilidad\n- ayuda: solicita ayuda general\n- general: otros temas\n\nResponde SOLO con un JSON así:\n{"intent": "categoría", "entities": {"producto": "nombre si hay", "categoria": "categoría si hay"}}`;

      const result = await googleAiService._tryGenerate(intentPrompt);
      const response = await result.response;
      const text = response.text().trim();

      try {
        // Limpiar bloques de código markdown si los hay
        const jsonText = text.replace(/```json\n?|\n?```/g, '');
        return JSON.parse(jsonText);
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
    if (!genAI) {
      return [];
    }

    try {
      const suggestionsPrompt = `Basándome en este mensaje: "${message}", genera 3 sugerencias de búsqueda relevantes para productos electrónicos o diseños de hardware.\n\nResponde SOLO con un array JSON así:\n["sugerencia 1", "sugerencia 2", "sugerencia 3"]`;

      const result = await googleAiService._tryGenerate(suggestionsPrompt);
      const response = await result.response;
      const text = response.text().trim();

      try {
        const jsonText = text.replace(/```json\n?|\n?```/g, '');
        return JSON.parse(jsonText);
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
    return !!genAI;
  },

  /**
   * Debug helper para verificar configuración (solo desarrollo)
   * @returns {Object}
   */
  debug: () => {
    return {
      hasApiKey: !!GOOGLE_API_KEY,
      clientCreated: !!genAI,
      keyPrefix: GOOGLE_API_KEY ? GOOGLE_API_KEY.substring(0, 10) + '...' : 'N/A',
      modelsConfigured: MODELS_TO_TRY
    };
  }
};

export default googleAiService;