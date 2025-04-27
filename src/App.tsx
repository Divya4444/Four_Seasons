import React, { useState, useEffect } from 'react';
import { getAdventureRecommendations } from './utils/geminiApi';
import { geminiClient } from './utils/butterflyClient';
import './App.css';

interface Recommendation {
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

function App() {
  const [location, setLocation] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    // Initialize tracking
    geminiClient.trackUserInteraction(userId, {
      type: 'app_initialized',
      details: { timestamp: new Date().toISOString() }
    });
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      // Track form submission
      await geminiClient.trackUserInteraction(userId, {
        type: 'form_submitted',
        details: { location }
      });

      const recs = await getAdventureRecommendations(userId, location);
      setRecommendations(recs);

      // Track successful recommendations
      await geminiClient.trackUserInteraction(userId, {
        type: 'recommendations_received',
        details: { count: recs.length }
      });
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');

      // Track error
      await geminiClient.trackUserInteraction(userId, {
        type: 'error_occurred',
        details: { error: err instanceof Error ? err.message : 'Unknown error' }
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeasonalGreeting = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "Spring's gentle touch brings new life";
    if (month >= 6 && month <= 8) return "Summer's warmth invites adventure";
    if (month >= 9 && month <= 11) return "Autumn's colors paint the landscape";
    return "Winter's quiet beauty awaits";
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Nature's Calendar</h1>
        <p>{getSeasonalGreeting()}. Let's discover the seasonal wonders around you.</p>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="location-form">
          <h2>Where would you like to explore nature's seasonal magic?</h2>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter a city, park, or natural area..."
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Discovering...' : 'Find Seasonal Wonders'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {loading && (
          <div className="loading">
            <p>Exploring {location} for seasonal wonders...</p>
            <p>Discovering nature's hidden treasures...</p>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="recommendations">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-card">
                <h3>{rec.title}</h3>
                <p className="description">{rec.description}</p>
                
                <div className="seasonal-highlight">
                  <h4>Best Time to Experience</h4>
                  <p>{rec.estimatedDuration}</p>
                </div>
                
                <div className="details">
                  <h4>Viewing Tips</h4>
                  <ul>
                    {rec.activities.map((activity, i) => (
                      <li key={i}>{activity}</li>
                    ))}
                  </ul>
                </div>

                <div className="eco-friendly-tips">
                  <h4>Eco-Friendly Tips</h4>
                  <ul>
                    {rec.ecoFriendlyTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {rec.bookingLink && (
                  <a 
                    href={rec.bookingLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="booking-link"
                  >
                    Book Guided Experience
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
