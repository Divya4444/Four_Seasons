import React, { useState, useEffect } from 'react';
import { getAdventureRecommendations } from './utils/geminiApi';
import { geminiClient } from './utils/butterflyClient';
import { ExperienceFeedback } from './components/ExperienceFeedback';
import { ExperienceGallery } from './components/ExperienceGallery';
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
  healthBenefits?: string[];
}

interface Feedback {
  images: File[];
  description: string;
  weather: string;
  crowdLevel: 'low' | 'medium' | 'high';
  tips: string;
  timestamp: string;
}

function App() {
  const [location, setLocation] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(() => crypto.randomUUID());
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

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

  const handleFeedbackSubmit = (feedback: Feedback) => {
    setFeedbacks([...feedbacks, feedback]);
  };

  const getCurrentLocation = async () => {
    setIsLocating(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      
      // Use Google Maps Geocoding API to get city name
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        const cityComponent = addressComponents.find(
          (component: any) => component.types.includes('locality')
        );
        
        if (cityComponent) {
          const cityName = cityComponent.long_name;
          setCurrentLocation(cityName);
          setLocation(cityName);
          // Automatically trigger the search
          await handleSubmit(new Event('submit') as any);
        }
      }
    } catch (err) {
      console.error('Error getting location:', err);
      setError('Unable to get your current location. Please enter it manually.');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>4 Seasons</h1>
        <p>{getSeasonalGreeting()}. Let's discover the seasonal wonders around you.</p>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="location-form">
          <h2>Where would you like to explore nature's seasonal magic?</h2>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="What's up with you?"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Discovering...' : 'Find Seasonal Wonders'}
          </button>
          
          <button 
            type="button" 
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="location-button"
          >
            {isLocating 
              ? 'Detecting Location...' 
              : `Search My Location: ${currentLocation || 'Click to Detect'}`}
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
                <div className="card-header">
                  <h3>{rec.title}</h3>
                  <div className="seasonal-badge">
                    <span className="season-icon">🌿</span>
                    <span>{getSeasonalGreeting()}</span>
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="main-content">
                    <div className="description-section">
                      <p className="description">{rec.description}</p>
                      <div className="activities-section">
                        <h4>Activities & Tips</h4>
                        <ul>
                          {rec.activities.map((activity, i) => (
                            <li key={i}>
                              <span className="activity-icon">✨</span>
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="impact-section">
                      <div className="impact-card environment">
                        <div className="impact-header">
                          <span className="impact-icon">🌱</span>
                          <h6>Environmental Impact</h6>
                        </div>
                        <div className="carbon-footprint">
                          <span>Carbon Footprint:</span>
                          <span className="footprint-value">{rec.carbonFootprint}</span>
                        </div>
                        <ul>
                          {rec.ecoFriendlyTips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="impact-card community">
                        <div className="impact-header">
                          <span className="impact-icon">🤝</span>
                          <h6>Community Support</h6>
                        </div>
                        <ul>
                          {rec.localPartners.map((partner, i) => (
                            <li key={i}>Supporting {partner}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="impact-card health">
                        <div className="impact-header">
                          <span className="impact-icon">💪</span>
                          <h6>Health Benefits</h6>
                        </div>
                        <ul>
                          {rec.healthBenefits?.map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="action-section">
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
                    <button 
                      className="share-experience-button"
                      onClick={() => setSelectedActivity(rec.title)}
                    >
                      Share Your Experience
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedActivity && (
          <ExperienceFeedback
            location={location}
            activity={selectedActivity}
            onFeedbackSubmit={handleFeedbackSubmit}
          />
        )}

        {feedbacks.length > 0 && selectedActivity && (
          <ExperienceGallery
            location={location}
            activity={selectedActivity}
            feedbacks={feedbacks}
          />
        )}
      </main>
    </div>
  );
}

export default App;
