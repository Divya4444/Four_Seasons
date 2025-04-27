import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  MainAgent,
  EcoAgent,
  BudgetAgent,
  LocalAgent,
  AgentMemory,
  UserPreferences,
  Interaction,
  Pattern,
  EventData,
  SustainabilityMetrics,
  FinancialConstraints
} from '../types/agents';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Gemini API key is not configured. Please check your .env file.');
}

const genAI = new GoogleGenerativeAI(apiKey);

export class Ava implements MainAgent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  memory: AgentMemory;
  type: 'main';
  subAgents: string[];
  coordinationStrategy: string;

  constructor() {
    this.id = 'ava-main';
    this.name = 'Ava';
    this.role = 'Main Travel Assistant';
    this.capabilities = [
      'Itinerary Planning',
      'Preference Learning',
      'Multi-Agent Coordination',
      'User Interaction',
      'Decision Making'
    ];
    this.memory = this.initializeMemory();
    this.type = 'main';
    this.subAgents = ['eco-agent', 'budget-agent', 'local-agent'];
    this.coordinationStrategy = 'hierarchical';
  }

  private initializeMemory(): AgentMemory {
    return {
      userPreferences: {
        mood: '',
        budget: 0,
        ecoPreferences: {
          isEcoMode: false,
          preferredTransport: [],
          carbonFootprintLimit: 0
        },
        travelStyle: '',
        interests: []
      },
      pastInteractions: [],
      learnedPatterns: []
    };
  }

  async processUserInput(input: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log(apiKey);
    return "Not implemented yet";
  }
    
}