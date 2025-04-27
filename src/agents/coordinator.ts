import { Ava, EcoAssistant, BudgetManager, LocalGuide } from './index';
import { Interaction, UserPreferences } from '../types/agents';

export class AgentCoordinator {
  private ava: Ava;
  private ecoAssistant: EcoAssistant;
  private budgetManager: BudgetManager;
  private localGuide: LocalGuide;

  constructor() {
    this.ava = new Ava();
    this.ecoAssistant = new EcoAssistant();
    this.budgetManager = new BudgetManager();
    this.localGuide = new LocalGuide();
  }

  async processUserRequest(input: string, preferences: UserPreferences): Promise<string> {
    // Update all agents with current preferences
    this.updateAgentPreferences(preferences);

    // Main agent processes the request
    const avaResponse = await this.ava.processUserInput(input);

    // Coordinate with specialized agents based on the request
    const specializedResponses = await this.coordinateSpecializedAgents(input);

    // Combine responses
    return this.combineResponses(avaResponse, specializedResponses);
  }

  private updateAgentPreferences(preferences: UserPreferences) {
    this.ava.memory.userPreferences = preferences;
    this.ecoAssistant.memory.userPreferences = preferences;
    this.budgetManager.memory.userPreferences = preferences;
    this.localGuide.memory.userPreferences = preferences;
  }

  private async coordinateSpecializedAgents(input: string): Promise<Record<string, string[]>> {
    const responses: Record<string, string[]> = {};

    // Check if the input relates to eco-friendly activities
    if (input.toLowerCase().includes('eco') || input.toLowerCase().includes('sustainable')) {
      const ecoAlternatives = await this.ecoAssistant.suggestEcoAlternatives(input);
      responses.eco = ecoAlternatives;
    }

    // Check if the input relates to budget or costs
    if (input.toLowerCase().includes('budget') || input.toLowerCase().includes('cost')) {
      const budgetOptimization = await this.budgetManager.optimizeBudget([input], 100); // Default budget
      responses.budget = budgetOptimization;
    }

    // Check if the input relates to local events or locations
    if (input.toLowerCase().includes('local') || input.toLowerCase().includes('nearby')) {
      const localEvents = await this.localGuide.findLocalEvents('current location', new Date());
      responses.local = localEvents.map(event => event.name);
    }

    return responses;
  }

  private combineResponses(mainResponse: string, specializedResponses: Record<string, string[]>): string {
    let combinedResponse = mainResponse + '\n\n';

    if (specializedResponses.eco) {
      combinedResponse += '🌱 Eco-friendly alternatives:\n';
      combinedResponse += specializedResponses.eco.join('\n') + '\n\n';
    }

    if (specializedResponses.budget) {
      combinedResponse += '💰 Budget-friendly options:\n';
      combinedResponse += specializedResponses.budget.join('\n') + '\n\n';
    }

    if (specializedResponses.local) {
      combinedResponse += '📍 Local events and activities:\n';
      combinedResponse += specializedResponses.local.join('\n') + '\n\n';
    }

    return combinedResponse;
  }

  async calculateCarbonFootprint(activity: string): Promise<number> {
    return this.ecoAssistant.calculateCarbonFootprint(activity);
  }

  async findLocalEvents(location: string, date: Date) {
    return this.localGuide.findLocalEvents(location, date);
  }

  async optimizeBudget(activities: string[], budget: number) {
    return this.budgetManager.optimizeBudget(activities, budget);
  }
} 