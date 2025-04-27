import React from 'react';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  precipitation: number;
}

interface WeatherDisplayProps {
  weather: WeatherData;
  location: string;
}

export default function WeatherDisplay({ weather, location }: WeatherDisplayProps) {
  const getWeatherEmoji = (condition: string) => {
    const emojiMap: Record<string, string> = {
      'Clear': '☀️',
      'Mainly Clear': '🌤️',
      'Partly Cloudy': '⛅',
      'Overcast': '☁️',
      'Fog': '🌫️',
      'Depositing Rime Fog': '🌫️',
      'Light Drizzle': '🌦️',
      'Moderate Drizzle': '🌦️',
      'Dense Drizzle': '🌧️',
      'Slight Rain': '🌧️',
      'Moderate Rain': '🌧️',
      'Heavy Rain': '🌧️',
      'Slight Snow': '🌨️',
      'Moderate Snow': '🌨️',
      'Heavy Snow': '🌨️',
      'Snow Grains': '🌨️',
      'Slight Rain Showers': '🌦️',
      'Moderate Rain Showers': '🌧️',
      'Violent Rain Showers': '⛈️',
      'Slight Snow Showers': '🌨️',
      'Heavy Snow Showers': '🌨️',
      'Thunderstorm': '⛈️',
      'Thunderstorm with Slight Hail': '⛈️',
      'Thunderstorm with Heavy Hail': '⛈️',
      'Unknown': '❓'
    };

    return emojiMap[condition] || '❓';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {location} Weather
          </h2>
          <div className="flex items-center justify-center md:justify-start">
            <span className="text-6xl mr-4">
              {getWeatherEmoji(weather.condition)}
            </span>
            <div>
              <span className="text-5xl font-bold text-gray-900">
                {weather.temperature}°C
              </span>
              <span className="text-gray-500 ml-2 text-lg">
                Feels like {weather.feelsLike}°C
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center md:text-right">
          <div className="bg-white/50 p-4 rounded-xl border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">Humidity</p>
            <p className="text-xl font-medium text-gray-900">
              {weather.humidity}%
            </p>
          </div>
          <div className="bg-white/50 p-4 rounded-xl border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">Wind</p>
            <p className="text-xl font-medium text-gray-900">
              {weather.windSpeed} km/h
            </p>
          </div>
          {weather.precipitation > 0 && (
            <div className="bg-white/50 p-4 rounded-xl border border-blue-100 col-span-2">
              <p className="text-sm text-gray-500 mb-1">Precipitation</p>
              <p className="text-xl font-medium text-gray-900">
                {weather.precipitation} mm
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 