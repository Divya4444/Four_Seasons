import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAdventureRecommendations, Mood as GeminiMood, Interest } from '../utils/geminiApi';
import AdventureRecommendations from './AdventureRecommendations';
import WeatherDisplay from './WeatherDisplay';
import LocalMarketInfo from './LocalMarketInfo';

type Mood = 'adventurous' | 'relaxed' | 'social' | 'creative' | 'romantic';
type ActivityType = 'grocery' | 'food' | 'leisure';
type Distance = 'short' | 'medium' | 'long';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  precipitation: number;
}

interface LocalMarket {
  name: string;
  day: string;
  time: string;
  description: string;
  seasonalProduce: string[];
}

interface SeasonalEvent {
  name: string;
  description: string;
  month: string;
  location: string;
  whyRecommended: string;
}

const CALIFORNIA_CITIES = [
  'San Francisco',
  'Los Angeles',
  'San Diego',
  'Sacramento',
  'Santa Barbara',
  'Monterey',
  'Napa',
  'Santa Cruz',
  'Palm Springs',
  'Lake Tahoe'
];

const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'adventurous', label: 'Adventurous', emoji: '🏃‍♂️' },
  { value: 'relaxed', label: 'Relaxed', emoji: '😌' },
  { value: 'social', label: 'Social', emoji: '👥' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'romantic', label: 'Romantic', emoji: '💕' }
];

const ACTIVITY_TYPES: { value: ActivityType; label: string; emoji: string }[] = [
  { value: 'grocery', label: 'Grocery & Markets', emoji: '🛒' },
  { value: 'food', label: 'Food & Dining', emoji: '🍽️' },
  { value: 'leisure', label: 'Leisure & Events', emoji: '🎭' }
];

const DISTANCE_OPTIONS: { value: Distance; label: string }[] = [
  { value: 'short', label: 'Short (Local)' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long Drive' }
];

export default function AdventureForm() {
  const [location, setLocation] = useState('');
  const [mood, setMood] = useState<Mood>('adventurous');
  const [activityType, setActivityType] = useState<ActivityType>('leisure');
  const [distance, setDistance] = useState<Distance>('medium');
  const [isEcoMode, setIsEcoMode] = useState(false);
  const [interests, setInterests] = useState<Interest[]>(['outdoors', 'food']);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [localMarkets, setLocalMarkets] = useState<LocalMarket[]>([]);
  const [seasonalEvents, setSeasonalEvents] = useState<SeasonalEvent[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (city: string) => {
    try {
      // First get coordinates for the city
      const geocodeResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      const geocodeData = await geocodeResponse.json();
      
      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error('City not found');
      }

      const { latitude, longitude } = geocodeData.results[0];
      
      // Then get weather data
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`
      );
      const weatherData = await weatherResponse.json();

      // Map weather codes to human-readable conditions
      const weatherCodeMap: { [key: number]: string } = {
        0: 'Clear',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing Rime Fog',
        51: 'Light Drizzle',
        53: 'Moderate Drizzle',
        55: 'Dense Drizzle',
        61: 'Slight Rain',
        63: 'Moderate Rain',
        65: 'Heavy Rain',
        71: 'Slight Snow',
        73: 'Moderate Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Slight Rain Showers',
        81: 'Moderate Rain Showers',
        82: 'Violent Rain Showers',
        85: 'Slight Snow Showers',
        86: 'Heavy Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Slight Hail',
        99: 'Thunderstorm with Heavy Hail'
      };

      setWeather({
        temperature: Math.round(weatherData.current.temperature_2m),
        condition: weatherCodeMap[weatherData.current.weather_code] || 'Unknown',
        icon: '', // We'll handle icons in the WeatherDisplay component
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        feelsLike: Math.round(weatherData.current.apparent_temperature),
        precipitation: weatherData.current.precipitation
      });
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to fetch weather data');
    }
  };

  const fetchSeasonalEvents = async (city: string) => {
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Generate a list of seasonal events and natural phenomena happening in ${city}, California in the current month.
      Focus on rare, time-limited events that would make for unique experiences.
      Include:
      - Event name
      - Description
      - Why it's special
      - Best viewing times/locations
      
      Format as JSON array of objects with these properties:
      {
        "name": string,
        "description": string,
        "month": string,
        "location": string,
        "whyRecommended": string
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const events = JSON.parse(response.text());
      setSeasonalEvents(events);
    } catch (err) {
      console.error('Error fetching seasonal events:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations([]); // Clear previous recommendations

    try {
      if (!location) {
        throw new Error('Please select a location');
      }

      console.log('Generating recommendations with:', {
        location,
        mood,
        activityType,
        distance,
        isEcoMode,
        interests,
        weather: weather ? `${weather.temperature}°C, ${weather.condition}` : undefined,
        seasonalEvents
      });

      const recommendations = await getAdventureRecommendations({
        location,
        mood: mood as GeminiMood,
        activityType,
        distance,
        isEcoMode,
        interests,
        weather: weather ? `${weather.temperature}°C, ${weather.condition}` : undefined,
        seasonalEvents
      });

      console.log('Received recommendations:', recommendations);
      
      if (!recommendations || recommendations.length === 0) {
        throw new Error('No recommendations were generated. Please try again.');
      }

      setRecommendations(recommendations);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchWeather(location);
      fetchSeasonalEvents(location);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            WanderBloom
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Discover curated adventures in California
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🌆 Select City
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                  required
                >
                  <option value="">Choose a city...</option>
                  {CALIFORNIA_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {weather && <WeatherDisplay weather={weather} location={location} />}

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🎯 What type of adventure?
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {ACTIVITY_TYPES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setActivityType(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        activityType === option.value
                          ? 'border-green-500 bg-green-50 shadow-sm'
                          : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-3xl mb-2 block">{option.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🚗 How far are you willing to go?
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {DISTANCE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDistance(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        distance === option.value
                          ? 'border-green-500 bg-green-50 shadow-sm'
                          : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-700">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center p-4 bg-green-50 rounded-xl border border-green-100">
                <label htmlFor="ecoMode" className="ml-3 block text-sm text-gray-700">
                  🌱 We prioritize eco-friendly options and carbon-saving trips
                </label>
              </div>
            </div>
          </div>

          {activityType === 'grocery' && localMarkets.length > 0 && (
            <LocalMarketInfo
              marketName={localMarkets[0].name}
              day={localMarkets[0].day}
              time={localMarkets[0].time}
              description={localMarkets[0].description}
              seasonalProduce={localMarkets[0].seasonalProduce}
            />
          )}

          {seasonalEvents.length > 0 && (
            <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-100 p-8">
              <h3 className="text-xl font-serif font-semibold text-amber-800 mb-6">
                🌸 Seasonal Highlights
              </h3>
              <div className="space-y-6">
                {seasonalEvents.map((event, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-amber-50">
                    <h4 className="font-medium text-amber-700 text-lg">{event.name}</h4>
                    <p className="text-gray-600 mt-2">{event.description}</p>
                    <p className="text-amber-600 mt-3">
                      <span className="font-medium">Why we recommend this:</span>{' '}
                      {event.whyRecommended}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Recommendations...
              </span>
            ) : (
              'Find My Plan✨ '
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
            ⚠️ {error}
          </div>
        )}

        <AdventureRecommendations
          recommendations={recommendations}
          isLoading={loading}
          error={error}
        />
      </div>
    </div>
  );
} 