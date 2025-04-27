import React, { useState } from 'react';
import { getAdventureRecommendations } from './utils/geminiApi';
import './App.css';

export interface Recommendation {
  title: string;
  description: string;
  activities: string[];
  estimatedDuration: string;
  carbonFootprint: string;
  ecoFriendlyTips: string[];
  estimatedCost: string;
  imagePrompt?: string;
  image?: string;
  waypoints: Array<{
    name: string;
    type: 'attraction' | 'restaurant';
    description: string;
    estimatedDuration: string;
    seasonal: boolean;
    seasonalDetails?: string;
    seasonalImagePrompt?: string;
    seasonalImage?: string;
  }>;
  bookingLink?: string;
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
  greenBusinesses?: Array<{
    name: string;
    type: 'farmers-market' | 'bike-rental' | 'eco-tour' | 'sustainable-shop';
    certification: string;
    discount: string;
    description: string;
    location: string;
  }>;
}

interface PlanDetails {
  startingTime: string;
  waypoints: Array<{
    name: string;
    type: 'attraction' | 'restaurant';
    description: string;
    estimatedDuration: string;
    seasonal: boolean;
  }>;
}

function App() {
  const [location, setLocation] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(() => crypto.randomUUID());
  const [selectedPlan, setSelectedPlan] = useState<{ recommendation: Recommendation; details: PlanDetails } | null>(null);
  const [savedPlans, setSavedPlans] = useState<{ recommendation: Recommendation; details: PlanDetails }[]>([]);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [travelDuration, setTravelDuration] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      console.log('Fetching recommendations for location:', location);
      const recs = await getAdventureRecommendations(userId, location);
      console.log('Received recommendations:', recs);
      
      if (!recs || recs.length === 0) {
        throw new Error('No recommendations found for this location');
      }
      
      setRecommendations(recs);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
      setRecommendations([]);
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

  const handleSelectPlan = (recommendation: Recommendation) => {
    setSelectedPlan({
      recommendation,
      details: {
        startingTime: new Date().toISOString().slice(0, 16), // Current date and time
        waypoints: []
      }
    });
  };

  const handleSavePlan = () => {
    if (!selectedPlan) return;
    
    const newSavedPlans = [...savedPlans, selectedPlan];
    setSavedPlans(newSavedPlans);
    
    // Save to localStorage
    localStorage.setItem('savedPlans', JSON.stringify(newSavedPlans));
    
    // Show success message
    alert('Plan saved successfully!');
  };

  const handleSharePlan = async () => {
    if (!selectedPlan) return;
    
    try {
      // Create a shareable link
      const planData = {
        recommendation: selectedPlan.recommendation,
        details: selectedPlan.details,
        timestamp: new Date().toISOString()
      };
      
      // In a real app, you would send this to your backend to generate a shareable link
      // For now, we'll create a local shareable link
      const shareableData = btoa(JSON.stringify(planData));
      const shareLink = `${window.location.origin}/share/${shareableData}`;
      
      setShareLink(shareLink);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareLink);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing plan:', error);
      alert('Failed to share plan. Please try again.');
    }
  };

  const calculateTravelDuration = async (origin: string, destination: string) => {
    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found');
      return null;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch travel duration');
      }

      const data = await response.json();
      
      if (data.rows[0]?.elements[0]?.duration) {
        return data.rows[0].elements[0].duration.text;
      }
      
      return null;
    } catch (error) {
      console.error('Error calculating travel duration:', error);
      return null;
    }
  };

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = e.target.value;
    setLocation(newLocation);

    if (selectedPlan && newLocation) {
      const firstWaypoint = selectedPlan.recommendation.waypoints[0];
      if (firstWaypoint) {
        const duration = await calculateTravelDuration(newLocation, firstWaypoint.name);
        setTravelDuration(duration);
      }
    }
  };

  const PlanDetailsView = () => {
    if (!selectedPlan) return null;

    return (
      <div className="plan-details">
        <div className="plan-header">
          <h2>Plan Your Adventure</h2>
          <button className="close-button" onClick={() => setSelectedPlan(null)}>×</button>
        </div>
        
        <div className="plan-content">
          <div className="location-section">
            <h3>Starting Location</h3>
            <div className="location-input">
              <input
                type="text"
                value={location}
                onChange={handleLocationChange}
                placeholder="Enter your starting location"
              />
            </div>
            {travelDuration && (
              <div className="travel-info">
                <p>Travel time to first destination: <span className="travel-duration">{travelDuration}</span></p>
              </div>
            )}
          </div>

          <div className="time-section">
            <h3>Starting Time</h3>
            <input
              type="datetime-local"
              value={selectedPlan.details.startingTime}
              onChange={(e) => setSelectedPlan({
                ...selectedPlan,
                details: {
                  ...selectedPlan.details,
                  startingTime: e.target.value
                }
              })}
            />
          </div>

          <div className="timeline-section">
            <h3>Adventure Timeline</h3>
            <div className="timeline">
              {selectedPlan.recommendation.waypoints.map((waypoint, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="waypoint-header">
                      <h4>{waypoint.name}</h4>
                      <div className="waypoint-meta">
                        <span className="type-badge">{waypoint.type}</span>
                        <span className="duration">{waypoint.estimatedDuration}</span>
                        {waypoint.seasonal && <span className="seasonal-badge">Seasonal</span>}
                      </div>
                    </div>
                    {waypoint.seasonalImage && (
                      <div className="waypoint-image">
                        <img 
                          src={waypoint.seasonalImage} 
                          alt={`${waypoint.name} in season`}
                          className="seasonal-image"
                        />
                      </div>
                    )}
                    <p className="waypoint-description">{waypoint.description}</p>
                    {waypoint.seasonalDetails && (
                      <p className="seasonal-details">{waypoint.seasonalDetails}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="plan-actions">
            <button 
              className="save-plan" 
              onClick={handleSavePlan}
              disabled={savedPlans.some(plan => 
                plan.recommendation.title === selectedPlan.recommendation.title
              )}
            >
              {savedPlans.some(plan => 
                plan.recommendation.title === selectedPlan.recommendation.title
              ) ? 'Already Saved' : 'Save Plan'}
            </button>
            <button 
              className="share-plan" 
              onClick={handleSharePlan}
            >
              Share Plan
            </button>
          </div>

          {shareLink && (
            <div className="share-link-container">
              <p>Share this link with others:</p>
              <div className="share-link">
                <input 
                  type="text" 
                  value={shareLink} 
                  readOnly 
                  className="share-link-input"
                />
                <button 
                  className="copy-link-button"
                  onClick={() => navigator.clipboard.writeText(shareLink)}
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="flex flex-col items-center justify-center space-y-4">
          <img 
            src="/images/C1192866-220A-4144-B7B1-AB21C7BD784B.png" 
            alt="Four Seasons Logo" 
            className="h-48 w-48 object-contain mb-2"
          />
          <div className="text-center">
            <p className="text-lg text-gray-600 !font-bold">{getSeasonalGreeting()}. Let's discover the seasonal wonders around you. Where would you like to explore nature's seasonal magic?</p>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <form onSubmit={handleSubmit} className="location-form">
          <div className="flex flex-row gap-4 items-center justify-center">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter a location"
              required
              className='flex-1'
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Discovering...' : 'Find Seasonal Wonders'}
            </button>
          </div>
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
                <div className="main-content">
                  {rec.image && (
                    <div className="recommendation-image">
                      <img 
                        src={rec.image} 
                        alt={`${rec.title} during ${getSeasonalGreeting()}`}
                        className="seasonal-image"
                      />
                    </div>
                  )}
                  <div className="description-section">
                    <p className="description">{rec.description}</p>
                  </div>
                  
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

                  <div className="impact-section">
                    <div className="impact-card environment">
                      <div className="impact-header">
                        <span className="impact-icon">🌱</span>
                        <h6>Environmental Impact</h6>
                      </div>
                      <ul>
                        <li className="carbon-footprint">
                          <span>Carbon Footprint:</span>
                          <span className="footprint-value">{rec.carbonFootprint}</span>
                        </li>
                        {rec.ecoFriendlyTips.map((tip, i) => (
                          <li key={i}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="details">
                    <div className="detail-item">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{rec.estimatedDuration}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Estimated Cost</span>
                      <span className="detail-value">{rec.estimatedCost}</span>
                    </div>
                  </div>

                  <div className="action-section">
                    {rec.bookingLink && (
                      <a href={rec.bookingLink} target="_blank" rel="noopener noreferrer" className="booking-link">
                        Book Now
                      </a>
                    )}
                    <button 
                      className="select-plan-button"
                      onClick={() => handleSelectPlan(rec)}
                    >
                      Select Plan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedPlan && <PlanDetailsView />}
      </main>
    </div>
  );
}

export default App;
