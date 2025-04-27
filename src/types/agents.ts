export interface BaseAgent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  memory: AgentMemory;
}

export interface AgentMemory {
  userPreferences: UserPreferences;
  pastInteractions: Interaction[];
  learnedPatterns: Pattern[];
}

export interface UserPreferences {
  mood: string;
  budget: number;
  ecoPreferences: EcoPreferences;
  travelStyle: string;
  interests: string[];
}

export interface EcoPreferences {
  isEcoMode: boolean;
  preferredTransport: string[];
  carbonFootprintLimit: number;
}

export interface Interaction {
  timestamp: Date;
  userInput: string;
  agentResponse: string;
  outcome: string;
}

export interface Pattern {
  type: string;
  frequency: number;
  lastUpdated: Date;
  confidence: number;
}

// Specific Agent Types
export interface MainAgent extends BaseAgent {
  type: 'main';
  subAgents: string[]; // IDs of sub-agents
  coordinationStrategy: string;
}

export interface EcoAgent extends BaseAgent {
  type: 'eco';
  sustainabilityMetrics: SustainabilityMetrics;
}

export interface BudgetAgent extends BaseAgent {
  type: 'budget';
  financialConstraints: FinancialConstraints;
}

export interface LocalAgent extends BaseAgent {
  type: 'local';
  locationData: LocationData;
  eventData: EventData[];
}

// Supporting Types
export interface SustainabilityMetrics {
  carbonFootprint: number;
  ecoScore: number;
  greenAlternatives: string[];
}

export interface FinancialConstraints {
  maxBudget: number;
  preferredPriceRange: string;
  savingsTargets: SavingsTarget[];
}

export interface LocationData {
  currentLocation: string;
  nearbyLocations: string[];
  travelTimes: Record<string, number>;
}

export interface EventData {
  id: string;
  name: string;
  date: Date;
  location: string;
  cost: number;
  ecoRating: number;
}

export interface SavingsTarget {
  category: string;
  targetAmount: number;
  currentAmount: number;
} 