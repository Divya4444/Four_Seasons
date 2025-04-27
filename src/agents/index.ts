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

// Get API key from environment variables
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log(apiKey);
    
    const prompt = `As Ava, the main travel assistant, process this user input: "${input}"
    Consider the following context:
    - User Preferences: ${JSON.stringify(this.memory.userPreferences)}
    - Past Interactions: ${this.memory.pastInteractions.length} recorded
    - Learned Patterns: ${this.memory.learnedPatterns.length} identified
    
    Provide a helpful response that:
    1. Acknowledges the user's input
    2. Suggests relevant actions
    3. Maintains a friendly, helpful tone
    4. Considers the user's preferences and history`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  updateMemory(interaction: Interaction) {
    this.memory.pastInteractions.push(interaction);
    this.analyzePatterns(interaction);
  }

  private analyzePatterns(interaction: Interaction) {
    // Implement pattern analysis logic
    const newPattern: Pattern = {
      type: 'interaction',
      frequency: 1,
      lastUpdated: new Date(),
      confidence: 0.8
    };
    this.memory.learnedPatterns.push(newPattern);
  }
}

export class EcoAssistant implements EcoAgent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  memory: AgentMemory;
  type: 'eco';
  sustainabilityMetrics: SustainabilityMetrics;

  constructor() {
    this.id = 'eco-agent';
    this.name = 'Eco Assistant';
    this.role = 'Sustainability Advisor';
    this.capabilities = [
      'Carbon Footprint Calculation',
      'Eco-friendly Alternatives',
      'Sustainability Scoring',
      'Green Route Planning'
    ];
    this.memory = this.initializeMemory();
    this.type = 'eco';
    this.sustainabilityMetrics = {
      carbonFootprint: 0,
      ecoScore: 0,
      greenAlternatives: []
    };
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

  async calculateCarbonFootprint(activity: string): Promise<number> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Calculate the carbon footprint for this activity: "${activity}"
    Consider:
    - Transportation mode
    - Distance
    - Duration
    - Number of participants
    
    Return only the estimated CO2 emissions in kg.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseFloat(response.text());
  }

  async suggestEcoAlternatives(activity: string): Promise<string[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Suggest eco-friendly alternatives for this activity: "${activity}"
    Consider:
    - Lower carbon footprint
    - Sustainable practices
    - Local resources
    - Environmental impact
    
    Return a list of 3-5 alternatives.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().split('\n').filter(Boolean);
  }
}

export class BudgetManager implements BudgetAgent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  memory: AgentMemory;
  type: 'budget';
  financialConstraints: FinancialConstraints;

  constructor() {
    this.id = 'budget-agent';
    this.name = 'Budget Manager';
    this.role = 'Financial Advisor';
    this.capabilities = [
      'Budget Planning',
      'Cost Optimization',
      'Expense Tracking',
      'Savings Recommendations'
    ];
    this.memory = this.initializeMemory();
    this.type = 'budget';
    this.financialConstraints = {
      maxBudget: 0,
      preferredPriceRange: 'medium',
      savingsTargets: []
    };
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

  async optimizeBudget(activities: string[], budget: number): Promise<string[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Optimize these activities within a budget of $${budget}:
    ${activities.join('\n')}
    
    Consider:
    - Cost-effectiveness
    - Value for money
    - Alternative options
    - Priority of activities
    
    Return a list of optimized activities with estimated costs.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().split('\n').filter(Boolean);
  }
}

export class LocalGuide implements LocalAgent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  memory: AgentMemory;
  type: 'local';
  locationData: {
    currentLocation: string;
    nearbyLocations: string[];
    travelTimes: Record<string, number>;
  };
  eventData: EventData[];

  constructor() {
    this.id = 'local-agent';
    this.name = 'Local Guide';
    this.role = 'Local Expert';
    this.capabilities = [
      'Local Event Discovery',
      'Location-based Recommendations',
      'Travel Time Estimation',
      'Local Culture Insights'
    ];
    this.memory = this.initializeMemory();
    this.type = 'local';
    this.locationData = {
      currentLocation: '',
      nearbyLocations: [],
      travelTimes: {}
    };
    this.eventData = [];
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

  async findLocalEvents(location: string, date: Date): Promise<EventData[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Find local events in ${location} around ${date.toISOString()}
    Consider:
    - Cultural events
    - Local markets
    - Community activities
    - Seasonal events
    
    Return a list of events with:
    - Name
    - Date
    - Location
    - Cost
    - Eco-rating`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  }

  async estimateTravelTimes(from: string, to: string): Promise<number> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Estimate travel time from ${from} to ${to}
    Consider:
    - Distance
    - Transportation options
    - Traffic conditions
    - Time of day
    
    Return the estimated time in minutes.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseFloat(response.text());
  }
} 