import OpenAI from 'openai';

/**
 * MosaiaService - A service class for interacting with the Mosaia AI API
 * This class provides methods to analyze tokens and chat with the Mosaia AI model
 */
class MosaiaService {
  /**
   * Creates a new instance of MosaiaService
   * @param {string} apiKey - The API key for authenticating with Mosaia AI
   * @throws {Error} If API key is not provided
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.apiKey = apiKey;
    this.baseURL = 'https://api.mosaia.ai/v1/agent';
    this.model = "6864318466e2110d1be2d0a7";
    // Initialize OpenAI client with proper configuration
    this.openai = new OpenAI({
      apiKey: apiKey,
      baseURL: this.baseURL,
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Analyzes a token or message using the Mosaia AI model
   * @param {string} message - The message to analyze
   * @returns {Promise<Object>} A promise that resolves to the analysis result
   */
  async analyzeToken(message) {
    try {
      if (!message || !message.trim()) {
        return {
          success: false,
          error: 'Message cannot be empty'
        };
      }
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      if (!completion.choices || !completion.choices[0]) {
        return {
          success: false,
          error: 'Invalid response from API'
        };
      }
      return {
        success: true,
        response: completion.choices[0].message.content,
        rawResponse: completion
      };
    } catch (error) {
      console.error('Mosaia API Error:', error);
      let errorMessage = 'Failed to analyze token';
      if (error.status === 400) {
        errorMessage = 'Bad request. Please check your input parameters.';
      } else if (error.status === 401 || error.status === 403) {
        errorMessage = 'Authentication failed. Please check your API key.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found. Please check the API endpoint or model ID.';
      } else if (error.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      return {
        success: false,
        error: error.message || errorMessage,
        status: error.status,
        details: error.response?.data || {}
      };
    }
  }

  /**
   * Conducts a chat conversation with the Mosaia AI model
   * @param {Array<Object>} messages - Array of message objects with role and content
   * @returns {Promise<Object>} A promise that resolves to the chat response
   */
  async chat(messages) {
    try {
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return {
          success: false,
          error: 'Messages array cannot be empty'
        };
      }
      for (const message of messages) {
        if (!message.role || !message.content) {
          return {
            success: false,
            error: 'Each message must have a role and content'
          };
        }
      }
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      });
      if (!completion.choices || !completion.choices[0]) {
        return {
          success: false,
          error: 'Invalid response from API'
        };
      }
      return {
        success: true,
        response: completion.choices[0].message.content,
        rawResponse: completion
      };
    } catch (error) {
      console.error('Mosaia API Error:', error);
      let errorMessage = 'Failed to get response';
      if (error.status === 400) {
        errorMessage = 'Bad request. Please check your input parameters.';
      } else if (error.status === 401 || error.status === 403) {
        errorMessage = 'Authentication failed. Please check your API key.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found. Please check the API endpoint or model ID.';
      } else if (error.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      return {
        success: false,
        error: error.message || errorMessage,
        status: error.status,
        details: error.response?.data || {}
      };
    }
  }

  /**
   * Gets the current configuration of the service
   * @returns {Object} The current configuration
   */
  getConfig() {
    return {
      baseURL: this.baseURL,
      model: this.model,
      hasApiKey: !!this.apiKey
    };
  }
}

export default MosaiaService; 