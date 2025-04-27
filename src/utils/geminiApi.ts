import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiClient } from './butterflyClient';

// Types for our preferences
export type ActivityType = 'grocery' | 'food' | 'leisure';
export type Interest = 'outdoors' | 'food' | 'events' | 'relaxation';
export type WorkflowType = 'personal' | 'business' | 'hybrid';

// DAIN platform integration types
export interface DAINAnalytics {
  sessionId: string;
  userId: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  timestamp: string;
  engagementScore: number;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    workflowType: WorkflowType;
    taskStatus: 'pending' | 'in-progress' | 'completed' | 'failed';
  }>;
  workflowMetrics: {
    tasksCompleted: number;
    averageCompletionTime: number;
    successRate: number;
    userSatisfaction: number;
  };
}

export interface DAINMonetization {
  tier: 'free' | 'premium' | 'enterprise';
  creditsUsed: number;
  revenueGenerated: number;
  conversionRate: number;
  subscriptionStatus: 'active' | 'trial' | 'expired';
  pricingModel: {
    basePrice: number;
    usageBased: boolean;
    featureTiers: string[];
  };
}

export interface DAINBusinessMetrics {
  customerLifetimeValue: number;
  averageOrderValue: number;
  retentionRate: number;
  churnRate: number;
  marketPenetration: number;
  competitivePosition: string;
  growthMetrics: {
    monthlyActiveUsers: number;
    userAcquisitionCost: number;
    viralCoefficient: number;
  };
}

export interface DAINWorkflow {
  id: string;
  type: WorkflowType;
  steps: Array<{
    id: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    dependencies: string[];
    estimatedTime: number;
    actualTime?: number;
  }>;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  assignedTo?: string;
}

export interface AdventurePreferences {
  location: string;
  activityType: ActivityType;
  interests: Interest[];
  // DAIN platform fields
  analytics: DAINAnalytics;
  monetization: DAINMonetization;
  businessMetrics: DAINBusinessMetrics;
  workflow: DAINWorkflow;
  // Business integration fields
  budget?: number;
  groupSize?: number;
  specialRequirements?: string[];
  conversationContext?: string;
  // Autonomous assistance fields
  automationLevel: 'basic' | 'advanced' | 'full';
  integrationPreferences: {
    calendar: boolean;
    email: boolean;
    messaging: boolean;
    payment: boolean;
  };
}

export interface AdventureRecommendation {
  title: string;
  description: string;
  activities: string[];
  estimatedDuration: string;
  carbonFootprint: string;
  ecoFriendlyTips: string[];
  estimatedCost: string;
  bookingLink?: string;
  localPartners: string[];
  premiumFeatures: string[];
  automationOptions: {
    autoBooking: boolean;
    paymentProcessing: boolean;
    reminderSetup: boolean;
    groupCoordination: boolean;
  };
  followUpQuestions?: string[];
  personalizedTips?: string[];
  nextSteps?: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    estimatedTime: number;
    automationAvailable: boolean;
  }>;
}

// Get API key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Gemini API key is not configured. Please check your .env file.');
}

const genAI = new GoogleGenerativeAI(apiKey);

// DAIN platform analytics helper
function createDAINAnalytics(userId: string = 'anonymous'): DAINAnalytics {
  return {
    sessionId: crypto.randomUUID(),
    userId,
    deviceType: 'desktop',
    timestamp: new Date().toISOString(),
    engagementScore: 0.85,
    conversationHistory: [],
    workflowMetrics: {
      tasksCompleted: 0,
      averageCompletionTime: 0,
      successRate: 1.0,
      userSatisfaction: 0.9
    }
  };
}

// DAIN platform monetization helper
function createDAINMonetization(): DAINMonetization {
  return {
    tier: 'free',
    creditsUsed: 1,
    revenueGenerated: 0,
    conversionRate: 0.15,
    subscriptionStatus: 'trial',
    pricingModel: {
      basePrice: 0,
      usageBased: true,
      featureTiers: ['basic', 'premium', 'enterprise']
    }
  };
}

// DAIN business metrics helper
function createDAINBusinessMetrics(): DAINBusinessMetrics {
  return {
    customerLifetimeValue: 0,
    averageOrderValue: 0,
    retentionRate: 0.85,
    churnRate: 0.15,
    marketPenetration: 0.1,
    competitivePosition: 'emerging',
    growthMetrics: {
      monthlyActiveUsers: 0,
      userAcquisitionCost: 0,
      viralCoefficient: 0
    }
  };
}

// DAIN workflow helper
function createDAINWorkflow(): DAINWorkflow {
  return {
    id: crypto.randomUUID(),
    type: 'personal',
    steps: [],
    priority: 'medium'
  };
}

// Default integration preferences
const defaultIntegrationPreferences = {
  calendar: false,
  email: false,
  messaging: false,
  payment: false
};

export async function getAdventureRecommendations(
  userId: string,
  location: string
): Promise<AdventureRecommendation[]> {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    // Track user interaction
    await geminiClient.trackUserInteraction(userId, {
      type: 'location_search',
      details: { location }
    });

    const currentTime = new Date();
    const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6;
    const isEvening = currentTime.getHours() >= 17;
    const currentMonth = currentTime.getMonth() + 1;

    const prompt = `As an AI concierge, suggest personalized seasonal activities in ${location}. Consider:

Seasonal Context:
- Current Month: ${currentMonth}
- Time: ${isWeekend ? 'Weekend' : 'Weekday'} ${isEvening ? 'Evening' : 'Daytime'}
- Location: ${location}

Focus on:
1. Seasonal natural phenomena (blooms, migrations, wildlife activity)
2. Local seasonal events and festivals
3. Best times to observe specific natural features
4. Eco-friendly ways to experience the season
5. Local conservation efforts and volunteer opportunities

IMPORTANT: Return ONLY a valid JSON array, without any markdown formatting or additional text. The response should start with [ and end with ].

Format your response as a JSON array (minimum 3 items, maximum 5 items). Each item must include:
{
  "title": "Seasonal Event/Activity name",
  "description": "Detailed description of the seasonal phenomenon and its significance",
  "activities": ["Specific viewing tips 1", "Specific viewing tips 2", "Specific viewing tips 3"],
  "estimatedDuration": "Best time window for viewing",
  "carbonFootprint": "High / Medium / Low with brief reason",
  "ecoFriendlyTips": ["Conservation tip 1", "Conservation tip 2", "Conservation tip 3"],
  "estimatedCost": "Cost range (if any)",
  "bookingLink": "URL for guided tours or events if available",
  "localPartners": ["Local expert 1", "Local organization 2"],
  "premiumFeatures": ["Feature 1", "Feature 2"],
  "automationOptions": {
    "autoBooking": true,
    "paymentProcessing": true,
    "reminderSetup": true,
    "groupCoordination": true
  },
  "followUpQuestions": ["Question 1", "Question 2"],
  "personalizedTips": ["Viewing tip 1", "Viewing tip 2"],
  "nextSteps": [
    {
      "action": "Specific action to take",
      "priority": "low",
      "estimatedTime": 30,
      "automationAvailable": true
    }
  ]
}`;

    const response = await geminiClient.generateRecommendation(prompt);
    
    // Clean the response to ensure valid JSON
    const cleanedResponse = response
      .trim()
      .replace(/^```json\s*/, '')
      .replace(/```\s*$/, '')
      .replace(/^\s*\[/, '[')
      .replace(/\]\s*$/, ']');

    try {
      const recommendations = JSON.parse(cleanedResponse) as AdventureRecommendation[];
      
      if (!Array.isArray(recommendations) || recommendations.length < 3 || recommendations.length > 5) {
        throw new Error('Invalid number of recommendations received');
      }

      // Track recommendations
      await geminiClient.trackRecommendation(userId, recommendations);

      return recommendations;
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      console.error('Raw response:', response);
      throw new Error('Failed to parse recommendations. Please try again.');
    }
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}
  