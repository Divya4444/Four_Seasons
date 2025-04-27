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

    const prompt = `Generate 3 unique outdoor adventure recommendations for ${location} that highlight seasonal natural phenomena. 
For each recommendation, provide:

1. Title and Description: A captivating title and detailed description of the experience
2. Activities: 3-5 specific activities or viewing tips
3. Timing: Best time to experience (including specific months or conditions)
4. Environmental Impact:
   - Carbon footprint estimate
   - Specific ways this activity helps the environment
   - Local conservation efforts it supports
   - How it contributes to biodiversity
5. Community Impact:
   - Local businesses and artisans supported
   - Cultural heritage preserved
   - Community initiatives benefited
   - Educational opportunities created
6. Health Benefits:
   - Physical health improvements
   - Mental wellness aspects
   - Stress reduction elements
   - Connection with nature benefits
7. Sustainable Practices:
   - Leave No Trace principles specific to this location
   - Eco-friendly transportation options
   - Waste reduction strategies
   - Resource conservation tips
8. Booking: Optional booking link for guided experiences

Format the response as a JSON array with these properties:
{
  "title": string,
  "description": string,
  "activities": string[],
  "estimatedDuration": string,
  "carbonFootprint": string,
  "ecoFriendlyTips": string[],
  "localPartners": string[],
  "healthBenefits": string[],
  "personalizedTips": string[],
  "nextSteps": Array<{
    "action": string,
    "priority": "low" | "medium" | "high",
    "estimatedTime": number,
    "automationAvailable": boolean
  }>,
  "bookingLink"?: string
}

Focus on creating recommendations that:
- Showcase unique seasonal aspects of ${location}
- Highlight sustainable tourism practices
- Support local communities and conservation
- Promote physical and mental well-being
- Educate about environmental stewardship
- Create meaningful connections with nature`;

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
  