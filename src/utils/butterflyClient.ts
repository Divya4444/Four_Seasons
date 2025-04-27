import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiClient {
  private static instance: GeminiClient;
  private genAI: GoogleGenerativeAI;
  private conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }> = [];

  private constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  public static getInstance(): GeminiClient {
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient();
    }
    return GeminiClient.instance;
  }

  public async trackUserInteraction(
    userId: string,
    interaction: {
      type: string;
      details: any;
      timestamp?: string;
    }
  ): Promise<void> {
    this.conversationHistory.push({
      role: 'user',
      content: JSON.stringify(interaction),
      timestamp: interaction.timestamp || new Date().toISOString()
    });
  }

  public async trackRecommendation(
    userId: string,
    recommendation: any
  ): Promise<void> {
    this.conversationHistory.push({
      role: 'assistant',
      content: JSON.stringify(recommendation),
      timestamp: new Date().toISOString()
    });
  }

  public getConversationHistory() {
    return this.conversationHistory;
  }

  public async generateRecommendation(prompt: string) {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}

export const geminiClient = GeminiClient.getInstance(); 