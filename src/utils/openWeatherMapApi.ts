import axios from 'axios';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  // DAIN platform analytics
  analytics?: {
    sessionId: string;
    userId: string;
    timestamp: string;
  };
  // Business integration fields
  weatherAlerts?: string[];
  localWeatherEvents?: string[];
  ecoImpact?: {
    airQuality: string;
    uvIndex: string;
    pollenCount: string;
  };
}

class OpenWeatherMapAPI {
  private static apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
  private static baseUrl = 'https://api.openweathermap.org/data/2.5';

  static async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      console.log('OpenWeatherMap API Key:', this.apiKey ? 'Present' : 'Missing');
      
      if (!this.apiKey) {
        throw new Error('OpenWeatherMap API key is not configured. Please check your .env file.');
      }

      // First, get the coordinates for the location
      console.log('Fetching coordinates for location:', location);
      const geocodeResponse = await axios.get('http://api.openweathermap.org/geo/1.0/direct', {
        params: {
          q: location,
          limit: 1,
          appid: this.apiKey
        }
      });

      console.log('Geocode response:', geocodeResponse.data);

      if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
        throw new Error('Location not found');
      }

      const { lat, lon } = geocodeResponse.data[0];
      console.log('Coordinates:', { lat, lon });

      // Then get the weather data
      console.log('Fetching weather data...');
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'imperial' // Use Fahrenheit
        }
      });

      console.log('Weather response:', response.data);

      const data = response.data;

      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        precipitation: data.rain ? data.rain['1h'] || 0 : 0,
        weatherAlerts: [],
        localWeatherEvents: [],
        ecoImpact: {
          airQuality: 'Good', // This would come from a separate air quality API
          uvIndex: 'Moderate', // This would come from a separate UV index API
          pollenCount: 'Low' // This would come from a separate pollen API
        }
      };
    } catch (error) {
      console.error('Detailed error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        if (error.response?.status === 401) {
          throw new Error('Invalid OpenWeatherMap API key. Please check your .env file.');
        } else if (error.response?.status === 404) {
          throw new Error('Location not found. Please try a different location.');
        }
      }
      throw new Error('Failed to fetch weather data. Please try again later.');
    }
  }

  static async getWeatherAlerts(location: string): Promise<string[]> {
    try {
      if (!this.apiKey) {
        return [];
      }

      // Get coordinates for the location
      const geocodeResponse = await axios.get('http://api.openweathermap.org/geo/1.0/direct', {
        params: {
          q: location,
          limit: 1,
          appid: this.apiKey
        }
      });

      if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
        return [];
      }

      const { lat, lon } = geocodeResponse.data[0];

      const response = await axios.get(`${this.baseUrl}/onecall`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          exclude: 'current,minutely,hourly,daily'
        }
      });

      return response.data.alerts?.map((alert: any) => alert.event) || [];
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      return [];
    }
  }

  static async getLocalWeatherEvents(location: string): Promise<string[]> {
    // This would integrate with a local events API
    return [];
  }
}

export { OpenWeatherMapAPI, type WeatherData }; 